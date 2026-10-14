<script lang="ts">
  import data from '../data/combined-watchlist.json'
  import type { CombinedWatchlist } from './contract'
  import { query } from './query'
  import Card from './Card.svelte'

  const watchlist = data as CombinedWatchlist
  const films = query(watchlist.films)
</script>

<header class="top">
  <div class="wrap bar">
    <h1>Sessão a dois</h1>
    <p>{films.length} {films.length === 1 ? 'filme' : 'filmes'} na fila</p>
  </div>
</header>

<main class="wrap">
  <div class="grid">
    {#each films as film (film.tmdbId)}
      <Card {film} />
    {/each}
  </div>
</main>

<footer class="wrap">
  <p>
    Dados de filmes do <a href="https://www.themoviedb.org/" target="_blank" rel="noopener">TMDB</a>
    e de onde assistir do <a href="https://www.justwatch.com/br" target="_blank" rel="noopener">JustWatch</a>.
    Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
  </p>
</footer>

<style>
  .top {
    position: sticky;
    top: 0;
    z-index: 5;
    padding-top: env(safe-area-inset-top, 0px);
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--line);
  }
  .bar { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; padding-block: 14px 12px }
  h1 { font: 600 26px/1 var(--display); letter-spacing: -.01em; margin: 0; font-variation-settings: "opsz" 144 }
  .bar p { margin: 0; color: var(--muted); font-size: 14px }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 18px 14px;
    padding-block: 20px 48px;
  }
  footer { color: var(--muted); font-size: 12px; border-top: 1px solid var(--line); padding-bottom: env(safe-area-inset-bottom, 0px) }
  footer p { max-width: 70ch }
  @media (max-width: 640px) {
    .grid { grid-template-columns: repeat(3, 1fr); gap: 10px 8px; padding-top: 14px }
  }
</style>
