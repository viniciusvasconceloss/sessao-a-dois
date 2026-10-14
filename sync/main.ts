// Runs the Sync and writes data/combined-watchlist.json, only when the Films changed.
import { readFileSync, writeFileSync } from 'node:fs'
import type { CombinedWatchlist } from '../src/contract.ts'
import { MEMBERS } from '../src/members.ts'
import { sync } from './sync.ts'

const file = new URL('../data/combined-watchlist.json', import.meta.url)
const tmdbToken = process.env.TMDB_API_TOKEN
if (!tmdbToken) throw new Error('TMDB_API_TOKEN is not set (export it or put it in .env.local)')

const http = async (url: string, headers?: Record<string, string>) => {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.text()
}
// The Sync skips Films whose fetch fails, so check the token first or every new Film would be skipped.
await http('https://api.themoviedb.org/3/authentication', { Authorization: `Bearer ${tmdbToken}` })

const previous: CombinedWatchlist = JSON.parse(readFileSync(file, 'utf8'))
const data = await sync({ usernames: MEMBERS.map(m => m.username), previous, tmdbToken, http })

if (JSON.stringify(data.films) === JSON.stringify(previous.films)) console.log('no changes')
else {
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
  console.log(`wrote ${data.films.length} films`)
}
