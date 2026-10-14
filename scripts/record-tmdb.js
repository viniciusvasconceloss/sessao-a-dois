// Records real TMDB responses into sync/fixtures for every movie a Letterboxd film fixture points at,
// plus TMDB's BR Provider catalog. Tests that assert on these values change when they are re-recorded.
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const dir = new URL('../sync/fixtures/', import.meta.url)
const token = process.env.TMDB_API_TOKEN
if (!token) throw new Error('TMDB_API_TOKEN is not set (put it in .env.local)')

async function record(path, file, pick = json => json) {
  const res = await fetch(`https://api.themoviedb.org/3${path}`, { headers: { Authorization: `Bearer ${token}` } })
  // A movie gone from TMDB keeps no fixture, so the Sync tests see it fail.
  if (res.status === 404) return rmSync(new URL(file, dir), { force: true }), console.log(`no fixture for ${path}: 404`)
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  writeFileSync(new URL(file, dir), JSON.stringify(pick(await res.json()), null, 1) + '\n')
  console.log(`wrote ${file}`)
}

for (const name of readdirSync(dir).filter(f => f.startsWith('lb-film-'))) {
  const bodyTag = readFileSync(new URL(name, dir), 'utf8').match(/<body[^>]*>/)?.[0] ?? ''
  const id = bodyTag.match(/data-tmdb-id="(\d+)"/)?.[1]
  if (!id || !bodyTag.includes('data-tmdb-type="movie"')) continue
  await record(`/movie/${id}?language=pt-BR`, `tmdb-movie-${id}.json`)
  // The Sync only reads BR; US stays so the fixture still has a region to ignore.
  await record(`/movie/${id}/watch/providers`, `tmdb-providers-${id}.json`, ({ id, results: { BR, US } }) => ({
    id,
    results: { BR, US },
  }))
}
await record('/watch/providers/movie?watch_region=BR', 'tmdb-providers-catalog-br.json')
