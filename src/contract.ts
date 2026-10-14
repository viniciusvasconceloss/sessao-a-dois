// The data contract between Sync and site: the single JSON file the site reads.
// Image paths are TMDB CDN paths: https://image.tmdb.org/t/p/{size}{path}

export type OfferType = 'subscription' | 'free' | 'ads' | 'rent' | 'buy'

export interface Offer {
  provider: string // base Provider name; Amazon Channels already merged by Sync
  logo: string
  type: OfferType
}

export interface Film {
  tmdbId: number
  slug: string // Letterboxd film slug
  title: string // pt-BR
  originalTitle: string
  overview: string
  year: number
  runtime: number // minutes
  genres: string[]
  countries: string[] // ISO 3166-1
  language: string // ISO 639-1 original language
  rating: number // TMDB vote average
  poster: string | null
  backdrop: string | null
  // Letterboxd username → position in that Member's Watchlist (0 = most recently added)
  owners: Record<string, number>
  offers: Offer[] // region BR
  justwatch: string | null
  filmFetchedAt: string // ISO timestamp
  offersFetchedAt: string // ISO timestamp
}

export interface CombinedWatchlist {
  syncedAt: string // ISO timestamp
  films: Film[]
}
