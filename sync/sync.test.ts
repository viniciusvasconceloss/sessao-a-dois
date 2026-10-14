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
      offers: [],
      justwatch: null,
      filmFetchedAt: '2026-10-15T06:00:00.000Z',
      offersFetchedAt: '1970-01-01T00:00:00.000Z',
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
  expect(requests.filter(u => u.includes('/movie/965150'))).toHaveLength(1)
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
    offers: [{ provider: 'MUBI', logo: '/mubi.png', type: 'subscription' as const }],
    filmFetchedAt: '2026-10-01T00:00:00.000Z',
  }
  const removed = { ...cachedAftersun, tmdbId: 1, slug: 'removed-film' }
  const previous = { syncedAt: '2026-10-01T00:00:00.000Z', films: [cachedAftersun, removed] }

  const { http, requests } = recordedHttp()
  const data = await run(['v_inicius'], http, previous)

  expect(requests).not.toContain('https://letterboxd.com/film/aftersun/')
  expect(requests.filter(u => u.includes('/movie/965150'))).toEqual([])
  expect(data.films).toEqual([
    { ...cachedAftersun, owners: { v_inicius: 0 } },
    expect.objectContaining({ slug: 'the-secret-world-of-arrietty', owners: { v_inicius: 1 } }),
  ])
})
