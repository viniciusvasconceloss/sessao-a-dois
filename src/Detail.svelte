<script lang="ts">
  import { img, OFFER_TYPES, type Film } from './contract'
  import { countryName, languageName, providersOf, runtimeLabel } from './format'
  import { MEMBERS } from './members'

  let { film, onclose }: { film: Film | null; onclose: () => void } = $props()

  // A modal <dialog> gives Esc, the focus trap and focus restoration natively.
  let dialog: HTMLDialogElement
  $effect(() => {
    if (!film) return
    dialog.showModal()
    dialog.scrollTop = 0
  })

  const owners = $derived(film ? MEMBERS.filter(m => m.username in film.owners) : [])
</script>

<dialog bind:this={dialog} aria-labelledby="detail-title" {onclose} onclick={e => e.target === dialog && dialog.close()}>
  {#if film}
    <div class="in">
      <button class="x" aria-label="Fechar" onclick={() => dialog.close()}>×</button>
      <div class="bd" style:background-image={film.backdrop && `url(${img('w1280', film.backdrop)})`}></div>
      <div class="body">
        <div class="head">
          {#if film.poster}<img src={img('w342', film.poster)} alt="" />{/if}
          <div>
            <h2 id="detail-title">{film.title}</h2>
            {#if film.originalTitle !== film.title}<p class="orig">{film.originalTitle}</p>{/if}
          </div>
        </div>
        <p class="meta">
          <span>{film.year}</span><span>{runtimeLabel(film.runtime)}</span>
          {#if film.countries.length}<span>{film.countries.map(countryName).join(', ')}</span>{/if}
          <span>{languageName(film.language)}</span>
          {#if film.rating}<span>★ {film.rating.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} TMDB</span>{/if}
        </p>
        {#if film.genres.length}<p class="meta">{film.genres.join(', ')}</p>{/if}
        <p class="own">
          {#each owners as m (m.username)}<i style:background={m.colour}>{m.name[0]}</i>{/each}
          <span>Na lista de {owners.map(m => m.name).join(' e ')}</span>
        </p>
        {#if film.overview}<p class="ov">{film.overview}</p>{/if}
        <section>
          <h3>Onde assistir no Brasil</h3>
          {#each providersOf(film.offers) as p (p.providerId)}
            <div class="row">
              <img src={img('w92', p.logo)} alt="" />
              <span>{p.provider}</span>
              <span class="tags">{#each p.types as t (t)}<span>{OFFER_TYPES[t]}</span>{/each}</span>
            </div>
          {:else}
            <p class="meta">Indisponível no Brasil.</p>
          {/each}
        </section>
        <div class="links">
          <a href="https://letterboxd.com/film/{film.slug}/" target="_blank" rel="noopener">Ver no Letterboxd</a>
          <a href={film.justwatch ?? `https://www.justwatch.com/br/busca?q=${encodeURIComponent(film.title)}`} target="_blank" rel="noopener">Ver no JustWatch</a>
        </div>
      </div>
    </div>
  {/if}
</dialog>

<style>
  :global(html:has(dialog[open])) { overflow: hidden }
  dialog {
    width: min(560px, 100vw); max-width: 100vw; height: 100vh; max-height: 100vh; margin: 0 0 0 auto; padding: 0;
    background: var(--panel); color: var(--fg); border: 0; border-left: 1px solid var(--line); overflow-y: auto;
  }
  dialog[open] { animation: in .28s cubic-bezier(.2, .8, .2, 1) }
  @keyframes in { from { transform: translateX(40px); opacity: 0 } }
  dialog::backdrop { background: rgb(0 0 0 / .5) }
  /* Fills the dialog so a click on it is a click outside the content. */
  .in { position: relative; min-height: 100% }
  .x {
    position: absolute; top: max(12px, env(safe-area-inset-top, 0px)); right: 12px; z-index: 1;
    width: 38px; height: 38px; border-radius: 50%; border: 0; background: rgb(0 0 0 / .6); color: var(--fg); font-size: 20px; cursor: pointer;
  }
  .bd { aspect-ratio: 16 / 9; background: var(--bg) center / cover; position: relative }
  .bd::after { content: ""; position: absolute; inset: 0; background: linear-gradient(transparent 40%, var(--panel)) }
  .body { padding: 0 24px max(40px, env(safe-area-inset-bottom, 0px)); margin-top: -72px; position: relative; display: grid; gap: 20px }
  .head { display: flex; gap: 18px; align-items: flex-end }
  .head img { width: 110px; flex: none; border-radius: 6px; box-shadow: 0 12px 30px rgb(0 0 0 / .6) }
  h2 { font: 600 30px/1.08 var(--display); margin: 0 0 6px; text-wrap: balance }
  .orig { color: var(--muted); margin: 0; font-style: italic }
  .meta { color: var(--muted); font-size: 14px; display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 0 }
  .own { display: flex; align-items: center; margin: 0 }
  .own i {
    width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center;
    font: 700 11px/1 "Manrope", sans-serif; font-style: normal; color: var(--bg); box-shadow: 0 0 0 2px var(--panel);
  }
  .own i + i { margin-left: -6px }
  .own span { margin-left: 10px }
  .ov { margin: 0; line-height: 1.65 }
  h3 { font: 600 13px/1 "Manrope", sans-serif; color: var(--muted); margin: 0 0 10px; letter-spacing: .02em }
  section { display: grid; gap: 8px }
  .row { display: flex; align-items: center; gap: 12px }
  .row img { width: 36px; height: 36px; border-radius: 8px }
  .tags { margin-left: auto; display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px }
  .tags span { font-size: 12px; border: 1px solid var(--line); border-radius: 999px; padding: 2px 9px; color: var(--muted) }
  .links { display: flex; gap: 10px; flex-wrap: wrap }
  .links a { text-decoration: none; border: 1px solid var(--line); border-radius: 10px; padding: 10px 16px; font-weight: 600 }
  .links a:hover { border-color: var(--accent) }
  @media (max-width: 640px) {
    dialog { width: 100vw; height: auto; max-height: 92vh; margin: auto 0 0; border: 0; border-radius: 18px 18px 0 0 }
    dialog[open] { animation-name: up }
    @keyframes up { from { transform: translateY(60px); opacity: 0 } }
    .head img { width: 84px }
    h2 { font-size: 24px }
  }
</style>
