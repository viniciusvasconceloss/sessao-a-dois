import type { Film } from './contract'

// ponytail: ranks from two Watchlists aren't comparable in time; the smallest rank interleaves them.
// Swap for real dates if Sync ever gets them.
const addedRank = (f: Film) => Math.min(...Object.values(f.owners))

export function query(films: Film[]): Film[] {
  return films.toSorted((a, b) => addedRank(a) - addedRank(b))
}
