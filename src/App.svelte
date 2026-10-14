<script lang="ts">
  import data from '../data/combined-watchlist.json'
  import { img, OFFER_TYPES, type CombinedWatchlist, type Offer, type OfferType } from './contract'
  import { MEMBERS } from './members'
  import { decadeOf, matches, query, RUNTIMES, type Filters, type OwnersFilter, type Sort } from './query'
  import Card from './Card.svelte'

  const watchlist = data as CombinedWatchlist

  const OWNERS: [OwnersFilter, string][] = [['all', 'Todos'], ...MEMBERS.map(m => [m.username, m.name] as [OwnersFilter, string]), ['both', 'Os dois']]
  const SORTS: [Sort, string][] = [['added', 'Adicionados recentemente'], ['year', 'Ano'], ['runtime', 'Duração'], ['rating', 'Nota TMDB']]

  const TYPES = Object.entries(OFFER_TYPES) as [OfferType, string][]

  // Every Provider in the data, the one with most Films first.
  const PROVIDERS = (() => {
    const byId = new Map<number, { offer: Offer; films: Set<number> }>()
    for (const f of watchlist.films)
      for (const offer of f.offers) {
        if (!byId.has(offer.providerId)) byId.set(offer.providerId, { offer, films: new Set() })
        byId.get(offer.providerId)!.films.add(f.tmdbId)
      }
    return [...byId.values()].sort((a, b) => b.films.size - a.films.size).map(p => p.offer)
  })()

  // "O quê" options, built from the data.
  const uniq = <T,>(xs: T[]) => [...new Set(xs)]
  const byLabel = (a: [unknown, string], b: [unknown, string]) => a[1].localeCompare(b[1], 'pt')
  const country = new Intl.DisplayNames('pt-BR', { type: 'region' })
  const lang = new Intl.DisplayNames('pt-BR', { type: 'language' })
  const capital = (s: string) => s[0].toUpperCase() + s.slice(1)
  const GENRES = uniq(watchlist.films.flatMap(f => f.genres)).sort((a, b) => a.localeCompare(b, 'pt'))
  const DECADES = uniq(watchlist.films.map(decadeOf)).sort((a, b) => b - a)
  // TMDB keeps codes of countries that no longer exist; Intl doesn't know them or names their successor.
  const GONE: Record<string, string> = { XC: 'Tchecoslováquia', SU: 'União Soviética', AN: 'Antilhas Holandesas' }
  const COUNTRIES = uniq(watchlist.films.flatMap(f => f.countries)).map(c => [c, GONE[c] ?? country.of(c) ?? c] as [string, string]).sort(byLabel)
  // TMDB uses 'cn' for Cantonese.
  const LANGUAGES = uniq(watchlist.films.map(f => f.language)).map(l => [l, capital(lang.of(l === 'cn' ? 'yue' : l) ?? l)] as [string, string]).sort(byLabel)

  const NO_FILTERS: Required<Filters> = { owners: 'all', providers: [], offerTypes: [], search: '', genre: '', decade: 0, runtime: '', country: '', language: '', minRating: 0 }
  let filters: Required<Filters> = $state({ ...NO_FILTERS })
  let providerSearch = $state('')
  const reset = () => {
    filters = { ...NO_FILTERS }
    providerSearch = ''
  }
  const shownProviders = $derived(PROVIDERS.filter(p => matches(p.provider, providerSearch)))
  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter(x => x !== item) : [...list, item])
  let sort: Sort = $state('added')

  const films = $derived(query(watchlist.films, filters, sort))
  const ownersCount = (owners: OwnersFilter) => query(watchlist.films, { ...filters, owners }).length
</script>

<div class="layout">
  <aside class="wrap">
    <h1 class="mark">Sessão a Dois 🍿🍿</h1>
    <fieldset class="who">
      <legend>De quem</legend>
      {#each OWNERS as [value, label] (value)}
        <button aria-pressed={filters.owners === value} onclick={() => (filters.owners = value)}>
          {label}<small>{ownersCount(value)}</small>
        </button>
      {/each}
    </fieldset>
    <fieldset>
      <legend>Onde</legend>
      <input type="search" placeholder="Buscar serviço" aria-label="Buscar serviço" bind:value={providerSearch}
        onkeydown={e => e.key === 'Enter' && shownProviders[0] && (filters.providers = toggle(filters.providers, shownProviders[0].providerId))} />
      <div class="prov">
        {#each shownProviders as p (p.providerId)}
          <button title={p.provider} aria-pressed={filters.providers.includes(p.providerId)}
            onclick={() => (filters.providers = toggle(filters.providers, p.providerId))}>
            <img src={img('w92', p.logo)} alt={p.provider} loading="lazy" />
          </button>
        {:else}
          <p class="none">Nenhum serviço</p>
        {/each}
      </div>
    </fieldset>
    <fieldset>
      <legend>Como</legend>
      <div class="types">
        {#each TYPES as [value, label] (value)}
          <button aria-pressed={filters.offerTypes.includes(value)} onclick={() => (filters.offerTypes = toggle(filters.offerTypes, value))}>{label}</button>
        {/each}
      </div>
    </fieldset>
    <fieldset class="what">
      <legend>O quê</legend>
      <select bind:value={filters.genre} aria-label="Gênero">
        <option value="">Todos os gêneros</option>
        {#each GENRES as g (g)}<option value={g}>{g}</option>{/each}
      </select>
      <select bind:value={filters.decade} aria-label="Década">
        <option value={0}>Qualquer década</option>
        {#each DECADES as d (d)}<option value={d}>Anos {d}</option>{/each}
      </select>
      <select bind:value={filters.runtime} aria-label="Duração">
        <option value="">Qualquer duração</option>
        {#each Object.entries(RUNTIMES) as [value, r] (value)}<option {value}>{r.label}</option>{/each}
      </select>
      <select bind:value={filters.country} aria-label="País">
        <option value="">Todos os países</option>
        {#each COUNTRIES as [value, label] (value)}<option {value}>{label}</option>{/each}
      </select>
      <select bind:value={filters.language} aria-label="Idioma">
        <option value="">Todos os idiomas</option>
        {#each LANGUAGES as [value, label] (value)}<option {value}>{label}</option>{/each}
      </select>
    </fieldset>
    <fieldset class="rating">
      <legend>Nota TMDB mínima: {filters.minRating ? filters.minRating.toLocaleString('pt-BR') : 'qualquer'}</legend>
      <input type="range" min="0" max="9" step="0.5" bind:value={filters.minRating} aria-label="Nota TMDB mínima" />
    </fieldset>
    <button class="reset" onclick={reset}>Limpar filtros</button>
  </aside>

  <main class="wrap">
    <div class="head">
      <input class="find" type="search" placeholder="Buscar filme" aria-label="Buscar filme" bind:value={filters.search} />
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
  .mark { font: 700 26px/1.1 var(--display); letter-spacing: -.01em; margin: 0 }
  fieldset { border: 0; padding: 0; margin: 0; display: grid; gap: 2px }
  legend { font-size: 12px; font-weight: 700; color: var(--accent); letter-spacing: .06em; text-transform: uppercase; padding: 0; margin-bottom: 10px }
  .who button {
    display: flex; justify-content: space-between; align-items: baseline; width: 100%;
    border: 0; background: none; padding: 2px 0; text-align: left; cursor: pointer;
    font: 500 19px/1.4 var(--display); color: var(--muted);
  }
  .who button:hover { color: var(--fg) }
  .who button[aria-pressed="true"] { color: var(--fg); font-weight: 700 }
  .prov { display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 8px }
  .prov button { border: 0; padding: 0; background: none; border-radius: 9px; opacity: .45; cursor: pointer; transition: opacity .15s }
  .prov img { border-radius: 9px; width: 100% }
  .prov button:hover { opacity: 1 }
  .prov button[aria-pressed="true"] { opacity: 1; box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent) }
  input[type=search] { width: 100%; background: var(--panel); color: var(--fg); border: 1px solid var(--line); border-radius: 6px; padding: 6px 10px; font: inherit; font-size: 14px }
  .who + fieldset input { margin-bottom: 10px }
  .none { grid-column: 1 / -1; margin: 0; color: var(--muted); font-size: 13px }
  .head .find { flex: 1 1 220px; max-width: 360px; margin-right: auto }
  .types { display: flex; flex-wrap: wrap; gap: 6px }
  .types button { border: 1px solid var(--line); background: none; border-radius: 999px; padding: 4px 12px; font: inherit; font-size: 13px; color: var(--muted); cursor: pointer }
  .types button[aria-pressed="true"] { border-color: var(--accent); color: var(--fg); background: color-mix(in srgb, var(--accent) 18%, transparent) }
  .what { gap: 8px }
  .what select, .rating input { width: 100%; accent-color: var(--accent) }
  .reset { justify-self: start; border: 1px solid var(--line); background: none; border-radius: 6px; padding: 6px 12px; font: inherit; font-size: 14px; color: var(--muted); cursor: pointer }
  .reset:hover { color: var(--fg); border-color: var(--accent) }
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
