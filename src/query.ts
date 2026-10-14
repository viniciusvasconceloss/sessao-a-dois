import { OFFER_TYPES, type Film, type OfferType } from './contract'

// 'all', 'both', or a Member's Letterboxd username
export type OwnersFilter = 'all' | 'both' | (string & {})

export interface Filters {
  owners: OwnersFilter
  providers?: number[] // TMDB provider ids, OR'ed; [] = any
  offerTypes?: OfferType[] // which Offers count; [] = all
  search?: string // part of the pt-BR or original title
  genre?: string // '' = any
  decade?: number // e.g. 1990; 0 = any
  runtime?: Runtime | ''
  country?: string // ISO 3166-1; '' = any
  language?: string // ISO 639-1; '' = any
  minRating?: number // TMDB, 0 = any
}

export const NO_FILTERS: Required<Filters> = { owners: 'all', providers: [], offerTypes: [], search: '', genre: '', decade: 0, runtime: '', country: '', language: '', minRating: 0 }

// Runtime ranges in minutes.
export const RUNTIMES = {
  short: { min: 1, max: 100, label: 'Até 1h40' },
  mid: { min: 1, max: 130, label: 'Até 2h10' },
  long: { min: 131, max: Infinity, label: 'Mais de 2h10' },
}
export type Runtime = keyof typeof RUNTIMES

// Case- and accent-insensitive "contains".
const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
export const matches = (text: string, search: string) => fold(text).includes(fold(search))

// Newest first by when Sync first saw the Film in any Owner's Watchlist. Within one Sync run there's no time,
// and ranks from two Watchlists aren't comparable in time, so the smallest rank interleaves them.
const lastAdded = (f: Film) => Math.max(0, ...Object.values(f.addedAt ?? {}).map(Date.parse))
const addedRank = (f: Film) => Math.min(...Object.values(f.owners))
const byAdded = (a: Film, b: Film) => lastAdded(b) - lastAdded(a) || addedRank(a) - addedRank(b)

const ownedBy = (f: Film, owners: OwnersFilter) =>
  owners === 'all' || (owners === 'both' ? Object.keys(f.owners).length > 1 : owners in f.owners)

const available = (f: Film, { providers = [], offerTypes = [] }: Filters) =>
  (!providers.length && !offerTypes.length) ||
  f.offers.some(o => (!providers.length || providers.includes(o.providerId)) && (!offerTypes.length || offerTypes.includes(o.type)))

export const decadeOf = (f: Film) => Math.floor(f.year / 10) * 10

// Runtime 0 (unknown on TMDB) is in no range.
const describedBy = (f: Film, { genre, decade, runtime, country, language, minRating }: Filters) =>
  (!genre || f.genres.includes(genre)) &&
  (!decade || decadeOf(f) === decade) &&
  (!runtime || (f.runtime >= RUNTIMES[runtime].min && f.runtime <= RUNTIMES[runtime].max)) &&
  (!country || f.countries.includes(country)) &&
  (!language || f.language === language) &&
  (!minRating || f.rating >= minRating)

// Ascending keys; ties fall back to date added.
const SORT_KEY = {
  added: () => 0,
  year: (f: Film) => -f.year,
  runtime: (f: Film) => f.runtime || Infinity, // 0 = unknown on TMDB
  rating: (f: Film) => -f.rating,
}
export type Sort = keyof typeof SORT_KEY

export function query(films: Film[], filters: Filters = { owners: 'all' }, sort: Sort = 'added'): Film[] {
  const key = SORT_KEY[sort]
  return films
    .filter(f => ownedBy(f, filters.owners) && available(f, filters) && describedBy(f, filters))
    .filter(f => !filters.search || matches(f.title, filters.search) || matches(f.originalTitle, filters.search))
    .toSorted((a, b) => key(a) - key(b) || byAdded(a, b))
}

// Display names for the ids kept in Filters.
export interface Names {
  owners: Record<string, string>
  providers: Record<number, string>
  countries: Record<string, string>
  languages: Record<string, string>
}

// One active filter choice, and the filters without it.
export interface Chip {
  label: string
  without: Required<Filters>
}

// The search is left out: it's always on screen.
export function activeFilters(f: Required<Filters>, names: Names): Chip[] {
  const chips: Chip[] = []
  const add = (on: unknown, label: string, without: Partial<Filters>) => on && chips.push({ label, without: { ...f, ...without } })
  add(f.owners !== 'all', names.owners[f.owners], { owners: NO_FILTERS.owners })
  for (const p of f.providers) add(true, names.providers[p], { providers: f.providers.filter(x => x !== p) })
  for (const t of f.offerTypes) add(true, OFFER_TYPES[t], { offerTypes: f.offerTypes.filter(x => x !== t) })
  add(f.genre, f.genre, { genre: NO_FILTERS.genre })
  add(f.decade, `Anos ${f.decade}`, { decade: NO_FILTERS.decade })
  add(f.runtime, f.runtime && RUNTIMES[f.runtime].label, { runtime: NO_FILTERS.runtime })
  add(f.country, names.countries[f.country], { country: NO_FILTERS.country })
  add(f.language, names.languages[f.language], { language: NO_FILTERS.language })
  add(f.minRating, `Nota ≥ ${f.minRating.toLocaleString('pt-BR')}`, { minRating: NO_FILTERS.minRating })
  return chips
}
