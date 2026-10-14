// The Sync: Letterboxd Watchlists + TMDB → the Combined Watchlist data file (ADR 0001).
import type { CombinedWatchlist, Film, Offer } from '../src/contract.ts'

// GET url, resolve with the body; reject on a non-2xx response.
export type Http = (url: string, headers?: Record<string, string>) => Promise<string>

export interface SyncOptions {
  usernames: string[] // Letterboxd
  previous: CombinedWatchlist | null // last data file, used as the cache
  http: Http
  tmdbToken: string // TMDB API Read Access Token (v4)
  now?: Date
  delayMs?: number // pause before each Letterboxd request
}

const NEVER = new Date(0).toISOString()

export async function sync(opts: SyncOptions): Promise<CombinedWatchlist> {
  const { usernames, previous, http, tmdbToken, now = new Date(), delayMs = 1000 } = opts
  const getLetterboxd = async (path: string) => {
    await new Promise(r => setTimeout(r, delayMs))
    return http(`https://letterboxd.com${path}`)
  }

  const owners = new Map<string, Film['owners']>() // slug → Owners, in first-seen order
  for (const username of usernames) {
    const slugs = await scrapeWatchlist(username, getLetterboxd)
    // A blocked or changed page parses as empty; don't let that wipe a Member's Films.
    if (!slugs.length && previous?.films.some(f => username in f.owners))
      throw new Error(`Watchlist of ${username} came back empty; Letterboxd may be blocking the Sync`)
    for (const [rank, slug] of slugs.entries()) owners.set(slug, { ...owners.get(slug), [username]: rank })
  }

  const tmdb = async (path: string) =>
    JSON.parse(await http(`https://api.themoviedb.org/3${path}`, { Authorization: `Bearer ${tmdbToken}` }))

  let catalog: Promise<TmdbProvider[]> | undefined // TMDB's BR Providers, fetched once when a channel needs its base

  const cached = new Map(previous?.films.map(f => [f.slug, f]))
  const films: Film[] = []
  for (const [slug, filmOwners] of owners) {
    let film = cached.get(slug)
    if (!film) {
      // Not cached, so a skipped Film is retried on the next run.
      try {
        const fetched = await fetchFilm(slug)
        if (!fetched) {
          console.warn(`skipped ${slug}: no TMDB movie on its Letterboxd page`)
          continue
        }
        film = { ...fetched, owners: {} }
      } catch (e) {
        console.warn(`skipped ${slug}: ${e}`)
        continue
      }
    }
    film = { ...film, owners: filmOwners }
    if (now.getTime() - Date.parse(film.offersFetchedAt) >= OFFERS_MAX_AGE_MS) {
      // On failure the old Offers and timestamp stay, so the refresh is retried on the next run.
      try {
        film = { ...film, ...(await fetchOffers(film.tmdbId)) }
      } catch (e) {
        console.warn(`kept old Offers of ${slug}: ${e}`)
      }
    }
    films.push(film)
  }
  return { syncedAt: now.toISOString(), films }

  async function fetchFilm(slug: string): Promise<Omit<Film, 'owners'> | null> {
    const bodyTag = (await getLetterboxd(`/film/${slug}/`)).match(/<body[^>]*>/)?.[0] ?? ''
    const id = bodyTag.match(/data-tmdb-id="(\d+)"/)?.[1]
    // ponytail: TV-backed entries (miniseries) are skipped; fetch /tv/{id} if they're ever wanted
    if (!id || !bodyTag.includes('data-tmdb-type="movie"')) return null
    const movie: TmdbMovie = await tmdb(`/movie/${id}?language=pt-BR`)
    return {
      tmdbId: movie.id,
      slug,
      title: movie.title,
      originalTitle: movie.original_title,
      overview: movie.overview,
      year: Number(movie.release_date?.slice(0, 4)) || 0,
      runtime: movie.runtime ?? 0,
      genres: movie.genres.map(g => g.name),
      countries: movie.production_countries.map(c => c.iso_3166_1),
      language: movie.original_language,
      rating: movie.vote_average,
      poster: movie.poster_path,
      backdrop: movie.backdrop_path,
      offers: [],
      justwatch: null,
      filmFetchedAt: now.toISOString(),
      offersFetchedAt: NEVER,
    }
  }

  async function fetchOffers(tmdbId: number): Promise<Pick<Film, 'offers' | 'justwatch' | 'offersFetchedAt'>> {
    const br: TmdbRegionProviders | undefined = (await tmdb(`/movie/${tmdbId}/watch/providers`)).results.BR
    const offers: Offer[] = []
    for (const [key, type] of Object.entries(OFFER_TYPES))
      for (const p of br?.[key as keyof typeof OFFER_TYPES] ?? []) {
        const base = await baseProvider(p)
        // By name: two channels of a base missing from the catalog keep different ids.
        if (!offers.some(o => o.provider === base.provider_name && o.type === type))
          offers.push({ providerId: base.provider_id, provider: base.provider_name, logo: base.logo_path, type })
      }
    return { offers, justwatch: br?.link ?? null, offersFetchedAt: now.toISOString() }
  }

  // "HBO Max Amazon Channel" → HBO Max from TMDB's BR catalog; a base missing there keeps the channel's id and logo.
  async function baseProvider(p: TmdbProvider): Promise<TmdbProvider> {
    const name = p.provider_name.trim().replace(CHANNEL, '')
    if (name === p.provider_name.trim()) return p
    catalog ??= tmdb('/watch/providers/movie?watch_region=BR').then(r => r.results)
    return (await catalog).find(c => sameName(c.provider_name, name)) ?? { ...p, provider_name: name }
  }
}

// ponytail: known reseller stores only; add one here if TMDB shows a new "<Provider> <Store> Channel"
const CHANNEL = / (Amazon|Apple TV|Roku Premium) Channel$/
const sameName = (a: string, b: string) => {
  const key = (s: string) => s.toLowerCase().replaceAll('+', 'plus').replace(/[^a-z0-9]/g, '')
  return key(a) === key(b)
}

const OFFERS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

// TMDB's watch provider lists → Offer Types, in the order Offers are stored.
const OFFER_TYPES = { flatrate: 'subscription', free: 'free', ads: 'ads', rent: 'rent', buy: 'buy' } as const

interface TmdbProvider {
  provider_id: number
  provider_name: string
  logo_path: string
}

// One region of TMDB's /movie/{id}/watch/providers. `link` is TMDB's watch page, which links out to JustWatch.
type TmdbRegionProviders = { link: string } & { [K in keyof typeof OFFER_TYPES]?: TmdbProvider[] }

// The fields used from TMDB's /movie/{id}.
interface TmdbMovie {
  id: number
  title: string
  original_title: string
  overview: string
  release_date: string | null
  runtime: number | null
  genres: { name: string }[]
  production_countries: { iso_3166_1: string }[]
  original_language: string
  vote_average: number
  poster_path: string | null
  backdrop_path: string | null
}

// Film slugs in Watchlist order (most recently added first), across every page.
async function scrapeWatchlist(username: string, get: (path: string) => Promise<string>) {
  const slugs: string[] = []
  for (let n = 1; ; n++) {
    const html = await get(`/${username}/watchlist/page/${n}/`)
    slugs.push(...[...html.matchAll(/data-item-slug="([^"]+)"/g)].map(m => m[1]))
    if (!html.includes('<a class="next"')) return slugs
  }
}
