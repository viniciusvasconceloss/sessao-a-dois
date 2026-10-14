# 01: Poster grid live on GitHub Pages with sample data

**What to build:** The Members open a public GitHub Pages link on desktop, phone or iPad and see the Combined Watchlist as a poster grid in the chosen visual direction, fed by sample data. This is the tracer bullet: scaffold, data contract, cards and deploy, end to end.

- Scaffold the site with Vite + Svelte + TypeScript (see spec, Implementation Decisions).
- Define the data contract (the single JSON file the site reads; see spec "Data contract") as a TypeScript type shared by site and Sync.
- Convert the prototype's embedded sample data (`const DATA` in `.scratch/watchlist-app/prototype-ui.html` on branch `prototype/watchlist-ui`) into a fixture that conforms to the contract.
- Members config lives in the repo: Sara = Letterboxd `sarateves`, Vinicius = Letterboxd `v_inicius` (display name + username + badge colour).
- Cards, grid, typography and tokens from variant A, per the spec UI section and `/tmp/handoff-watchlist-ui.md` if still present (else read the prototype on the branch).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Grid of 2:3 posters, A's layout (auto-fill ~150px columns; 3 fixed columns on phone)
- [ ] Owners badge (S/V circles in Member colours), up to 3 Provider logos then "+N", Offer Type mark on logo when best Offer isn't subscription (R$ for rent/buy, AD for ads)
- [ ] Films with no Offers render greyscale/dimmed with an "indisponível" badge
- [ ] Hover lifts card and reveals title + year
- [ ] Default order: date added to a Watchlist, newest first
- [ ] Posters use native lazy loading; ~600 cards scroll smoothly (no pagination)
- [ ] Fraunces + Manrope, A's palette (graphite, brass accent), UI in pt-BR
- [ ] GitHub Action builds and deploys the site to GitHub Pages on push to the main branch
- [ ] Setup guide in the repo covers enabling GitHub Pages and the deploy Action
- [ ] TMDB/JustWatch attribution in the footer
