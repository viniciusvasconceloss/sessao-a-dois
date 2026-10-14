import type { Film, OfferType } from './contract'

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

// ponytail: ranks from two Watchlists aren't comparable in time; the smallest rank interleaves them.
// Swap for real dates if Sync ever gets them.
const addedRank = (f: Film) => Math.min(...Object.values(f.owners))

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
  added: addedRank,
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
    .toSorted((a, b) => key(a) - key(b) || addedRank(a) - addedRank(b))
}
