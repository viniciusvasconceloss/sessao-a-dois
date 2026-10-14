import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import type { CombinedWatchlist } from '../src/contract.ts'
import { sync, type Http } from './sync.ts'

const fixture = (name: string) => readFileSync(new URL(`fixtures/${name}`, import.meta.url), 'utf8')

// Serves recorded responses; any request without a fixture fails the Sync.
function recordedHttp() {
  const requests: string[] = []
  const http: Http = async (url, headers) => {
    requests.push(url)
    let m
    if ((m = url.match(/^https:\/\/letterboxd\.com\/([^/]+)\/watchlist\/page\/(\d+)\/$/)))
      return fixture(`lb-${m[1]}-watchlist-${m[2]}.html`)
    if ((m = url.match(/^https:\/\/letterboxd\.com\/film\/([^/]+)\/$/))) return fixture(`lb-film-${m[1]}.html`)
    if ((m = url.match(/^https:\/\/api\.themoviedb\.org\/3\/movie\/(\d+)\?language=pt-BR$/))) {
      expect(headers).toEqual({ Authorization: 'Bearer test-token' })
      return fixture(`tmdb-movie-${m[1]}.json`)
    }
    if ((m = url.match(/^https:\/\/api\.themoviedb\.org\/3\/movie\/(\d+)\/watch\/providers$/))) {
      expect(headers).toEqual({ Authorization: 'Bearer test-token' })
      return fixture(`tmdb-providers-${m[1]}.json`)
    }
    if (url === 'https://api.themoviedb.org/3/watch/providers/movie?watch_region=BR') {
      expect(headers).toEqual({ Authorization: 'Bearer test-token' })
      return fixture('tmdb-providers-catalog-br.json')
    }
    throw new Error(`no fixture for ${url}`)
  }
  return { http, requests }
}

const now = new Date('2026-10-15T06:00:00.000Z')
const run = (usernames: string[], http: Http, previous: CombinedWatchlist | null = null) =>
  sync({ usernames, previous, http, tmdbToken: 'test-token', now, delayMs: 0 })

test('a Watchlist becomes Films with pt-BR details, in Watchlist order', async () => {
  const { http } = recordedHttp()
  const data = await run(['v_inicius'], http)

  expect(data.syncedAt).toBe('2026-10-15T06:00:00.000Z')
  expect(data.films).toEqual([
    {
      tmdbId: 965150,
      slug: 'aftersun',
      title: 'Aftersun',
      originalTitle: 'Aftersun',
      overview: 'Sophie reflete sobre as férias que passou com o pai.',
      year: 2022,
      runtime: 102,
      genres: ['Drama'],
      countries: ['GB', 'US'],
      language: 'en',
      rating: 7.7,
      poster: '/evKz85EKouVbIr51zy5fOtpNRPg.jpg',
      backdrop: '/7yCXDq2Mq1PTaMr1gc2dzXzmSY8.jpg',
      owners: { v_inicius: 0 },
      offers: [
        { providerId: 11, provider: 'MUBI', logo: '/mubi.jpg', type: 'subscription' },
        { providerId: 300, provider: 'Pluto TV', logo: '/plutotv.jpg', type: 'free' },
        { providerId: 192, provider: 'YouTube', logo: '/youtube.jpg', type: 'ads' },
        { providerId: 2, provider: 'Apple TV', logo: '/appletv.jpg', type: 'rent' },
        { providerId: 2, provider: 'Apple TV', logo: '/appletv.jpg', type: 'buy' },
        { providerId: 3, provider: 'Google Play Movies', logo: '/googleplay.jpg', type: 'buy' },
      ],
      justwatch: 'https://www.themoviedb.org/movie/965150-aftersun/watch?locale=BR',
      filmFetchedAt: '2026-10-15T06:00:00.000Z',
      offersFetchedAt: '2026-10-15T06:00:00.000Z',
    },
    expect.objectContaining({
      tmdbId: 51739,
      slug: 'the-secret-world-of-arrietty',
      title: 'O Mundo dos Pequeninos',
      originalTitle: '借りぐらしのアリエッティ',
      year: 2010,
      genres: ['Animação', 'Família', 'Fantasia'],
      owners: { v_inicius: 1 },
    }),
  ])
})

test('both Watchlists merge across pages; a Film in both has both Owners', async () => {
  const { http, requests } = recordedHttp()
  const data = await run(['sarateves', 'v_inicius'], http)

  expect(data.films.map(f => [f.slug, f.owners])).toEqual([
    ['parasite-2019', { sarateves: 0 }],
    ['aftersun', { sarateves: 1, v_inicius: 0 }],
    ['perfect-days-2023', { sarateves: 2 }],
    ['the-secret-world-of-arrietty', { v_inicius: 1 }],
  ])
  expect(requests.filter(u => u.includes('/movie/965150?'))).toHaveLength(1)
})

test('a Watchlist that comes back empty aborts the Sync instead of dropping its Films', async () => {
  const previous = await run(['v_inicius'], recordedHttp().http)
  const blocked = previous.films.map(f => ({ ...f, owners: { blocked: 0 } }))

  await expect(run(['blocked'], recordedHttp().http, { ...previous, films: blocked })).rejects.toThrow(
    /blocked/,
  )
})

test('entries without a TMDB movie (TV miniseries, no TMDB id, TMDB error) are skipped', async () => {
  const { http, requests } = recordedHttp()
  const data = await run(['edgecase'], http)

  expect(data.films.map(f => [f.slug, f.owners])).toEqual([['aftersun', { edgecase: 2 }]])
  expect(requests).not.toContain('https://api.themoviedb.org/3/movie/87108?language=pt-BR')
})

test('a later run only fetches new Films, and drops Films removed from every Watchlist', async () => {
  const first = await run(['sarateves', 'v_inicius'], recordedHttp().http)
  const cachedAftersun = {
    ...first.films.find(f => f.slug === 'aftersun')!,
    owners: { sarateves: 7 },
    offers: [{ providerId: 11, provider: 'MUBI', logo: '/mubi.png', type: 'subscription' as const }],
    filmFetchedAt: '2026-10-01T00:00:00.000Z',
  }
  const removed = { ...cachedAftersun, tmdbId: 1, slug: 'removed-film' }
  const previous = { syncedAt: '2026-10-01T00:00:00.000Z', films: [cachedAftersun, removed] }

  const { http, requests } = recordedHttp()
  const data = await run(['v_inicius'], http, previous)

  expect(requests).not.toContain('https://letterboxd.com/film/aftersun/')
  expect(requests.filter(u => u.includes('/movie/965150?'))).toEqual([])
  expect(data.films).toEqual([
    { ...cachedAftersun, owners: { v_inicius: 0 } },
    expect.objectContaining({ slug: 'the-secret-world-of-arrietty', owners: { v_inicius: 1 } }),
  ])
})

test('channels and plan variants merge into their base Provider, without duplicate Offers', async () => {
  const { http, requests } = recordedHttp()
  const data = await run(['sarateves'], http)
  const offersOf = (slug: string) => data.films.find(f => f.slug === slug)!.offers

  expect(offersOf('parasite-2019')).toEqual([
    { providerId: 1899, provider: 'HBO Max', logo: '/hbomax.jpg', type: 'subscription' },
    { providerId: 531, provider: 'Paramount Plus', logo: '/paramount.jpg', type: 'subscription' },
    // Base not in TMDB's BR catalog: keeps the channel's id and logo under the base name.
    { providerId: 9999, provider: 'Belas Artes à La Carte', logo: '/belasartes-apple.jpg', type: 'subscription' },
    { providerId: 8, provider: 'Netflix', logo: '/netflix.jpg', type: 'ads' },
    { providerId: 119, provider: 'Amazon Prime Video', logo: '/primevideo.jpg', type: 'rent' },
  ])
  expect(offersOf('perfect-days-2023')).toEqual([
    { providerId: 11, provider: 'MUBI', logo: '/mubi.jpg', type: 'subscription' },
    { providerId: 2142, provider: 'MGM+', logo: '/mgm.jpg', type: 'subscription' },
  ])
  expect(requests.filter(u => u.includes('/watch/providers/movie'))).toHaveLength(1)
})

test('a Film with no Offers in Brazil is kept with an empty Offer list', async () => {
  const data = await run(['v_inicius'], recordedHttp().http)

  expect(data.films.find(f => f.slug === 'the-secret-world-of-arrietty')).toMatchObject({
    offers: [],
    justwatch: null,
    offersFetchedAt: '2026-10-15T06:00:00.000Z',
  })
})

test('Offers older than 7 days are refetched; fresher ones, and ones whose refetch fails, are kept', async () => {
  const first = await run(['sarateves', 'v_inicius'], recordedHttp().http)
  const oldOffers = [{ providerId: 8, provider: 'Netflix', logo: '/netflix.jpg', type: 'subscription' as const }]
  const aged = (slug: string, offersFetchedAt: string) => ({
    ...first.films.find(f => f.slug === slug)!,
    offers: oldOffers,
    offersFetchedAt,
  })
  const previous = {
    syncedAt: '2026-10-08T00:00:00.000Z',
    films: [
      aged('aftersun', '2026-10-08T00:00:00.000Z'), // 7 days 6 h old
      aged('the-secret-world-of-arrietty', '2026-10-09T00:00:00.000Z'), // 6 days 6 h old
      aged('parasite-2019', '2026-10-01T00:00:00.000Z'), // old, but its refetch fails
    ],
  }
  const recorded = recordedHttp()
  const http: Http = async (url, headers) => {
    if (url.endsWith('/movie/496243/watch/providers')) throw new Error(`500 ${url}`)
    return recorded.http(url, headers)
  }

  const data = await run(['sarateves', 'v_inicius'], http, previous)
  const film = (slug: string) => data.films.find(f => f.slug === slug)!

  expect(film('aftersun')).toMatchObject({
    offers: first.films.find(f => f.slug === 'aftersun')!.offers,
    offersFetchedAt: '2026-10-15T06:00:00.000Z',
  })
  expect(film('the-secret-world-of-arrietty')).toMatchObject(previous.films[1])
  expect(film('parasite-2019')).toMatchObject({ offers: oldOffers, offersFetchedAt: '2026-10-01T00:00:00.000Z' })
  expect(recorded.requests).not.toContain('https://api.themoviedb.org/3/movie/51739/watch/providers')
})
