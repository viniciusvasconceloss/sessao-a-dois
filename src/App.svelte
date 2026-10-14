<script lang="ts">
  import data from '../data/combined-watchlist.json'
  import type { CombinedWatchlist } from './contract'
  import { MEMBERS } from './members'
  import { query, type Filters, type OwnersFilter, type Sort } from './query'
  import Card from './Card.svelte'

  const watchlist = data as CombinedWatchlist

  const OWNERS: [OwnersFilter, string][] = [['all', 'Todos'], ...MEMBERS.map(m => [m.username, m.name] as [OwnersFilter, string]), ['both', 'Os dois']]
  const SORTS: [Sort, string][] = [['added', 'Adicionados recentemente'], ['year', 'Ano'], ['runtime', 'Duração'], ['rating', 'Nota TMDB']]

  let filters: Filters = $state({ owners: 'all' })
  let sort: Sort = $state('added')

  const films = $derived(query(watchlist.films, filters, sort))
  const ownersCount = (owners: OwnersFilter) => query(watchlist.films, { ...filters, owners }).length
</script>

<div class="layout">
  <aside class="wrap">
    <h1 class="mark">Sessão a dois<small>A lista de Sara e Vinicius, com onde ver cada filme no Brasil.</small></h1>
    <fieldset class="who">
      <legend>De quem</legend>
      {#each OWNERS as [value, label] (value)}
        <button aria-pressed={filters.owners === value} onclick={() => (filters.owners = value)}>
          {label}<small>{ownersCount(value)}</small>
        </button>
      {/each}
    </fieldset>
  </aside>

  <main class="wrap">
    <div class="head">
      <p>{films.length} {films.length === 1 ? 'filme' : 'filmes'}</p>
      <label>Ordenar
        <select bind:value={sort}>
          {#each SORTS as [value, label] (value)}<option {value}>{label}</option>{/each}
        </select>
      </label>
    </div>
    <div class="grid">
      {#each films as film (film.tmdbId)}
        <Card {film} />
      {/each}
    </div>
  </main>
</div>

<footer class="wrap">
  <p>
    Dados de filmes do <a href="https://www.themoviedb.org/" target="_blank" rel="noopener">TMDB</a>
    e de onde assistir do <a href="https://www.justwatch.com/br" target="_blank" rel="noopener">JustWatch</a>.
    Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
  </p>
</footer>

<style>
  .layout { display: grid; grid-template-columns: 280px minmax(0, 1fr) }
  aside {
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
    border-right: 1px solid var(--line);
    padding-block: max(32px, env(safe-area-inset-top, 0px)) 48px;
    display: grid; gap: 30px; align-content: start;
  }
  .mark { font: 600 30px/1 var(--display); letter-spacing: -.01em; margin: 0; font-variation-settings: "opsz" 144 }
  .mark small { display: block; font: 400 13px/1.4 "Manrope", sans-serif; color: var(--muted); letter-spacing: 0; margin-top: 10px }
  fieldset { border: 0; padding: 0; margin: 0; display: grid; gap: 2px }
  legend { font-size: 12px; font-weight: 700; color: var(--accent); letter-spacing: .06em; text-transform: uppercase; padding: 0; margin-bottom: 10px }
  .who button {
    display: flex; justify-content: space-between; align-items: baseline; width: 100%;
    border: 0; background: none; padding: 2px 0; text-align: left; cursor: pointer;
    font: 400 21px/1.3 var(--display); color: var(--muted);
  }
  .who button:hover { color: var(--fg) }
  .who button[aria-pressed="true"] { color: var(--fg); font-style: italic }
  .who small { font: 400 13px "Manrope", sans-serif; font-variant-numeric: tabular-nums }

  main { min-width: 0 }
  .head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; padding-block: 20px 0; color: var(--muted); font-size: 14px }
  .head p { margin: 0 }
  .head label { display: flex; gap: 8px; align-items: center }
  select { background: var(--panel); color: var(--fg); border: 1px solid var(--line); border-radius: 6px; padding: 5px 8px; font: inherit }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 18px 14px;
    padding-block: 16px 48px;
  }
  footer { color: var(--muted); font-size: 12px; border-top: 1px solid var(--line); padding-bottom: env(safe-area-inset-bottom, 0px) }
  footer p { max-width: 70ch }
  @media (max-width: 900px) {
    .layout { grid-template-columns: minmax(0, 1fr) }
    aside { position: static; height: auto; border-right: 0; border-bottom: 1px solid var(--line); padding-bottom: 20px }
  }
  @media (max-width: 640px) {
    .grid { grid-template-columns: repeat(3, 1fr); gap: 10px 8px; padding-top: 12px }
  }
</style>
