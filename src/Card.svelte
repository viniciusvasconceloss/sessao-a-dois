<script lang="ts">
  import type { Film, OfferType } from './contract'
  import { img, OFFER_TYPES, providersOf, runtimeLabel } from './format'
  import { MEMBERS } from './members'

  let { film, onclick }: { film: Film; onclick: () => void } = $props()

  const MARK: Partial<Record<OfferType, string>> = { ads: 'AD', rent: 'R$', buy: 'R$' }

  const owners = $derived(MEMBERS.filter(m => m.username in film.owners))

  const providers = $derived(providersOf(film.offers))
</script>

<button class="card" class:na={!film.offers.length} aria-label={film.title} {onclick}>
  {#if film.poster}<img src={img('w342', film.poster)} alt="" loading="lazy" />{/if}
  <span class="own" title={owners.map(m => m.name).join(' e ')}>
    {#each owners as m (m.username)}<i style:background={m.colour}>{m.name[0]}</i>{/each}
  </span>
  <span class="offers">
    {#each providers.slice(0, 3) as p (p.providerId)}
      <span class="logo" title="{p.provider}: {p.types.map(t => OFFER_TYPES[t]).join(', ')}">
        <img src={img('w92', p.logo)} alt={p.provider} loading="lazy" />
        {#if MARK[p.types[0]]}<b>{MARK[p.types[0]]}</b>{/if}
      </span>
    {:else}
      <span class="na-badge">indisponível</span>
    {/each}
    {#if providers.length > 3}<span class="plus">+{providers.length - 3}</span>{/if}
  </span>
  <span class="tip"><b>{film.title}</b><small>{film.year}, {runtimeLabel(film.runtime)}</small></span>
</button>

<style>
  .card {
    display: block; width: 100%; padding: 0; border: 0; font: inherit; color: inherit; text-align: left; cursor: pointer;
    position: relative;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    border-radius: 6px;
    background: var(--panel);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .06);
    transition: transform .18s, box-shadow .18s;
  }
  .card:hover, .card:focus-visible { transform: translateY(-3px); box-shadow: 0 0 0 2px var(--accent), 0 14px 30px rgba(0, 0, 0, .5) }
  .card > img { width: 100%; height: 100%; object-fit: cover }
  .na > img { filter: grayscale(.85) brightness(.7) }

  .own { position: absolute; top: 6px; left: 6px; display: inline-flex }
  .own i {
    width: 22px; height: 22px; border-radius: 50%;
    display: grid; place-items: center;
    font: 700 11px/1 "Manrope", sans-serif; font-style: normal; color: var(--bg);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, .55);
  }
  .own i + i { margin-left: -6px }

  .offers {
    position: absolute; left: 0; right: 0; bottom: 0;
    display: flex; gap: 4px; padding: 26px 6px 6px;
    background: linear-gradient(transparent, rgba(0, 0, 0, .85));
  }
  .logo { position: relative; flex: none }
  .logo img { width: 26px; height: 26px; border-radius: 6px }
  .logo b {
    position: absolute; right: -3px; bottom: -3px;
    font: 700 8px/1 system-ui, sans-serif; background: var(--fg); color: #111; border-radius: 3px; padding: 2px 3px;
  }
  .plus { align-self: center; font-size: 11px; color: #ddd; margin-left: 2px }
  .na-badge { font-size: 11px; font-weight: 600; color: var(--muted); background: rgba(0, 0, 0, .7); border-radius: 4px; padding: 2px 6px }

  .tip {
    position: absolute; inset: auto 0 0;
    padding: 40px 10px 10px;
    background: linear-gradient(transparent, rgba(0, 0, 0, .95) 45%);
    opacity: 0; transition: opacity .15s;
  }
  .tip b { display: block; font: 600 15px/1.2 var(--display) }
  .tip small { color: var(--muted) }
  .card:hover .tip, .card:focus-visible .tip { opacity: 1 }
</style>
