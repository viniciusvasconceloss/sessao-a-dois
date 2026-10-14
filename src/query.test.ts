import { expect, test } from 'vitest'
import type { Film } from './contract'
import { query } from './query'

const film = (tmdbId: number, owners: Film['owners'], rest: Partial<Film> = {}) => ({ tmdbId, owners, ...rest }) as Film

test('default order is date added, newest first, interleaving both Watchlists', () => {
  const films = [
    film(1, { sarateves: 2 }),
    film(2, { v_inicius: 0 }),
    film(3, { sarateves: 1, v_inicius: 3 }),
    film(4, { sarateves: 0 }),
    film(5, { v_inicius: 1 }),
  ]
  expect(query(films).map(f => f.tmdbId)).toEqual([2, 4, 3, 5, 1])
})

const ids = (films: Film[]) => films.map(f => f.tmdbId)
const all = { owners: 'all' } as const
const saraVini = [film(1, { sarateves: 0 }), film(2, { v_inicius: 0 }), film(3, { sarateves: 1, v_inicius: 1 })]

test('a Member filter shows their full Watchlist, including Films shared with the other Member', () => {
  expect(ids(query(saraVini, { owners: 'sarateves' }))).toEqual([1, 3])
  expect(ids(query(saraVini, { owners: 'v_inicius' }))).toEqual([2, 3])
  expect(ids(query(saraVini, all))).toEqual([1, 2, 3])
})

test('"Os dois" shows only Films in both Watchlists', () => {
  expect(ids(query(saraVini, { owners: 'both' }))).toEqual([3])
})

test('sorts by year (newest), runtime (shortest) or rating (best), ties falling back to date added', () => {
  const f = (tmdbId: number, rank: number, year: number, runtime: number, rating: number) =>
    film(tmdbId, { sarateves: rank }, { year, runtime, rating })
  const films = [f(1, 3, 1990, 120, 7.1), f(2, 0, 2023, 95, 8.4), f(3, 2, 2023, 140, 6.0), f(4, 1, 1960, 95, 8.4)]
  expect(ids(query(films, all, 'year'))).toEqual([2, 3, 1, 4])
  expect(ids(query(films, all, 'runtime'))).toEqual([2, 4, 1, 3])
  expect(ids(query(films, all, 'rating'))).toEqual([2, 4, 1, 3])
  expect(ids(query(films, all, 'added'))).toEqual([2, 4, 3, 1])
})

test('runtime sort puts Films with unknown runtime (0) last', () => {
  const films = [film(1, { sarateves: 0 }, { runtime: 0 }), film(2, { sarateves: 1 }, { runtime: 140 }), film(3, { sarateves: 2 }, { runtime: 80 })]
  expect(ids(query(films, all, 'runtime'))).toEqual([3, 2, 1])
})
