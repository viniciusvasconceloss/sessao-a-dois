<script lang="ts">
  import data from '../data/combined-watchlist.json'
  import { img, OFFER_TYPES, type CombinedWatchlist, type Film, type Offer, type OfferType } from './contract'
  import { countryName, languageName } from './format'
  import { MEMBERS } from './members'
  import { activeFilters, decadeOf, matches, NO_FILTERS, query, RUNTIMES, type Filters, type Names, type OwnersFilter, type Sort } from './query'
  import { tick } from 'svelte'
  import Card from './Card.svelte'
  import Detail from './Detail.svelte'

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
  const GENRES = uniq(watchlist.films.flatMap(f => f.genres)).sort((a, b) => a.localeCompare(b, 'pt'))
  const DECADES = uniq(watchlist.films.map(decadeOf)).sort((a, b) => b - a)
  const COUNTRIES = uniq(watchlist.films.flatMap(f => f.countries)).map(c => [c, countryName(c)] as [string, string]).sort(byLabel)
  const LANGUAGES = uniq(watchlist.films.map(f => f.language)).map(l => [l, languageName(l)] as [string, string]).sort(byLabel)

  let filters: Required<Filters> = $state({ ...NO_FILTERS })
  let providerSearch = $state('')
  const reset = () => {
    filters = { ...NO_FILTERS }
    providerSearch = ''
  }
  const shownProviders = $derived(PROVIDERS.filter(p => matches(p.provider, providerSearch)))
  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter(x => x !== item) : [...list, item])
  let sort: Sort = $state('added')

  const NAMES: Names = {
    owners: Object.fromEntries(OWNERS),
    providers: Object.fromEntries(PROVIDERS.map(p => [p.providerId, p.provider])),
    countries: Object.fromEntries(COUNTRIES),
    languages: Object.fromEntries(LANGUAGES),
  }
  const chips = $derived(activeFilters(filters, NAMES))

  // Phone / iPad portrait: the sidebar is a bottom sheet, closed on every visit and on rotation.
  const phoneQuery = matchMedia('(max-width: 900px)')
  const OPEN_KEY = 'sidebar-open'
  const stored = () => {
    try { return localStorage.getItem(OPEN_KEY) !== 'false' } catch { return true }
  }
  let phone = $state(phoneQuery.matches)
  let open = $state(!phoneQuery.matches && stored())
  phoneQuery.addEventListener('change', e => {
    phone = e.matches
    open = !phone && stored()
  })
  let aside: HTMLElement, toggleButton: HTMLButtonElement
  const setOpen = (value: boolean) => {
    open = value
    // Focus waits for the DOM to drop inert.
    if (phone) return tick().then(() => (value ? aside : toggleButton).focus())
    try { localStorage.setItem(OPEN_KEY, String(value)) } catch {}
  }
  const sheetOpen = $derived(phone && open)

  const films = $derived(query(watchlist.films, filters, sort))
  let selected: Film | null = $state(null)
  const ownersCount = (owners: OwnersFilter) => query(watchlist.films, { ...filters, owners }).length
</script>

<svelte:window onkeydown={e => e.key === 'Escape' && sheetOpen && setOpen(false)} />

<div class="layout" class:closed={!open}>
  <button class="backdrop" aria-label="Fechar filtros" tabindex="-1" onclick={() => setOpen(false)}></button>
  <aside id="filters" class="wrap" inert={!open} aria-label="Filtros" bind:this={aside} tabindex="-1"
    role={sheetOpen ? 'dialog' : undefined} aria-modal={sheetOpen || undefined}>
    {#if phone}
      <div class="sheet-head"><b>Filtros</b><button onclick={() => setOpen(false)}>Aplicar</button></div>
    {/if}
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

  <main class="wrap" inert={sheetOpen}>
    <div class="head">
      <h1 class="mark">Sessão a Dois 🍿🍿</h1>
      <button class="toggle" bind:this={toggleButton} aria-expanded={open} aria-controls="filters" onclick={() => setOpen(!open)}>
        Filtros{chips.length ? ` (${chips.length})` : ''}
      </button>
      <input class="find" type="search" placeholder="Buscar filme" aria-label="Buscar filme" bind:value={filters.search} />
      <p>{films.length} {films.length === 1 ? 'filme' : 'filmes'}</p>
      <label>Ordenar
        <select bind:value={sort}>
          {#each SORTS as [value, label] (value)}<option {value}>{label}</option>{/each}
        </select>
      </label>
    </div>
    {#if !open && chips.length}
      <ul class="chips" aria-label="Filtros ativos">
        {#each chips as chip (chip.label)}
          <li><button aria-label="Remover {chip.label}" onclick={() => (filters = chip.without)}>{chip.label} <span aria-hidden="true">×</span></button></li>
        {/each}
      </ul>
    {/if}
    <div class="grid">
      {#each films as film (film.tmdbId)}
        <Card {film} onclick={() => (selected = film)} />
      {/each}
    </div>
  </main>
</div>

<Detail film={selected} onclose={() => (selected = null)} />

<footer class="wrap" inert={sheetOpen}>
  <p>
    Dados de filmes do <a href="https://www.themoviedb.org/" target="_blank" rel="noopener">TMDB</a>
    e de onde assistir do <a href="https://www.justwatch.com/br" target="_blank" rel="noopener">JustWatch</a>.
    Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
  </p>
</footer>

<style>
  .layout { display: grid; grid-template-columns: 280px minmax(0, 1fr); transition: grid-template-columns .25s ease }
  .layout.closed { grid-template-columns: 0 minmax(0, 1fr) }
  aside {
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
    border-right: 1px solid var(--line);
    padding-block: max(28px, env(safe-area-inset-top, 0px)) 48px;
    display: grid; gap: 30px; align-content: start;
    overflow-x: hidden; transition: padding .25s, border-width .25s;
  }
  /* Fixed-width content so collapsing clips it instead of reflowing it. */
  aside > * { min-width: 248px }
  /* Visibility only delayed on the way out, so the opened sidebar can take focus at once. */
  .closed aside { visibility: hidden; padding-inline: 0; border-right-width: 0; transition: padding .25s, border-width .25s, visibility .25s }
  .backdrop { display: none }
  .mark { font: 700 22px/1.1 var(--display); letter-spacing: -.01em; margin: 0; color: var(--fg) }
  .toggle, .chips button { border: 1px solid var(--line); background: none; border-radius: 999px; padding: 5px 12px; font: inherit; font-size: 14px; color: var(--fg); cursor: pointer }
  .toggle[aria-expanded="true"], .chips button:hover { border-color: var(--accent) }
  .chips { list-style: none; margin: 0; padding: 12px 0 0; display: flex; flex-wrap: wrap; gap: 6px }
  .chips button { font-size: 13px; padding: 3px 10px }
  .chips span { color: var(--muted) }
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
  .head .find { flex: 1 1 200px; max-width: 360px; margin-right: auto }
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
    .layout, .layout.closed { grid-template-columns: minmax(0, 1fr) }
    aside {
      position: fixed; inset: auto 0 0; z-index: 2; height: auto; max-height: 85vh;
      background: var(--bg); border: 1px solid var(--line); border-radius: 16px 16px 0 0;
      padding-block: 0 max(32px, env(safe-area-inset-bottom, 0px));
      transition: transform .25s ease;
    }
    .closed aside { transform: translateY(100%); transition: transform .25s ease, visibility .25s; padding-inline: max(16px, env(safe-area-inset-left, 0px)) }
    /* Stays put while the filters scroll under it; filters apply live, so Aplicar just closes the sheet. */
    .sheet-head {
      position: sticky; top: 0; z-index: 1; display: flex; justify-content: space-between; align-items: center;
      margin-inline: calc(-1 * max(16px, env(safe-area-inset-left, 0px))); padding: 14px max(16px, env(safe-area-inset-left, 0px));
      background: var(--bg); border-bottom: 1px solid var(--line);
    }
    .sheet-head b { font: 700 18px var(--display) }
    .sheet-head button {
      border: 0; border-radius: 999px; padding: 7px 18px; background: var(--accent); color: var(--bg);
      font: inherit; font-weight: 700; font-size: 14px; cursor: pointer;
    }
    .backdrop { display: block; position: fixed; inset: 0; z-index: 1; border: 0; background: rgb(0 0 0 / .5) }
    .closed .backdrop { display: none }
  }
  @media (max-width: 640px) {
    .grid { grid-template-columns: repeat(3, 1fr); gap: 10px 8px; padding-top: 12px }
  }
</style>
