import { expect, test } from 'vitest'
import type { Film } from './contract'
import { query } from './query'

const film = (tmdbId: number, owners: Film['owners']) => ({ tmdbId, owners }) as Film

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
