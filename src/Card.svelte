<script lang="ts">
  import { img, OFFER_TYPES, type Film, type Offer, type OfferType } from './contract'
  import { MEMBERS } from './members'

  let { film }: { film: Film } = $props()

  const RANK = Object.keys(OFFER_TYPES)
  const MARK: Partial<Record<OfferType, string>> = { ads: 'AD', rent: 'R$', buy: 'R$' }

  const owners = $derived(MEMBERS.filter(m => m.username in film.owners))

  // One entry per Provider: its best Offer (best first) plus every Offer Type it has.
  const providers = $derived.by(() => {
    const byProvider = new Map<string, Offer[]>()
    for (const o of film.offers.toSorted((a, b) => RANK.indexOf(a.type) - RANK.indexOf(b.type)))
      byProvider.set(o.provider, [...(byProvider.get(o.provider) ?? []), o])
    return [...byProvider.values()].map(offers => ({ ...offers[0], types: offers.map(o => OFFER_TYPES[o.type]).join(', ') }))
  })

  const runtime = $derived(`${Math.floor(film.runtime / 60)}h${film.runtime % 60 ? ` ${film.runtime % 60}min` : ''}`)
</script>

<article class="card" class:na={!film.offers.length}>
  {#if film.poster}<img src={img('w342', film.poster)} alt="" loading="lazy" />{/if}
  <span class="own" title={owners.map(m => m.name).join(' e ')}>
    {#each owners as m (m.username)}<i style:background={m.colour}>{m.name[0]}</i>{/each}
  </span>
  <span class="offers">
    {#each providers.slice(0, 3) as p (p.provider)}
      <span class="logo" title="{p.provider}: {p.types}">
        <img src={img('w92', p.logo)} alt={p.provider} loading="lazy" />
        {#if MARK[p.type]}<b>{MARK[p.type]}</b>{/if}
      </span>
    {:else}
      <span class="na-badge">indisponível</span>
    {/each}
    {#if providers.length > 3}<span class="plus">+{providers.length - 3}</span>{/if}
  </span>
  <span class="tip"><b>{film.title}</b><small>{film.year}, {runtime}</small></span>
</article>

<style>
  .card {
    position: relative;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    border-radius: 6px;
    background: var(--panel);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .06);
    transition: transform .18s, box-shadow .18s;
  }
  .card:hover { transform: translateY(-3px); box-shadow: 0 0 0 2px var(--accent), 0 14px 30px rgba(0, 0, 0, .5) }
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
  .card:hover .tip { opacity: 1 }
</style>
