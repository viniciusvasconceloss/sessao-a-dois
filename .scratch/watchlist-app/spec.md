# Combined Watchlist app

Status: done

## Problem Statement

Sara and Vinicius each keep a Letterboxd Watchlist. When deciding what to watch together, they have to look at two separate lists and then check, film by film, where each one can be watched in Brazil. Letterboxd only offers filtering by streaming service on its paid tier, and never across two people's lists at once.

## Solution

A private-in-spirit (but publicly hosted) website that shows the Combined Watchlist of both Members as a beautiful poster grid, in the spirit of Letterboxd, and lets them filter it by Owners, Provider, Offer Type, genre, year, runtime, country, language and rating. The data refreshes itself daily from both public Watchlists and TMDB, so the list always reflects what is on Letterboxd. Works on desktop, phone and iPad.

## User Stories

1. As a Member, I want my public Letterboxd Watchlist to be read automatically, so that I never have to re-enter films in a second app.
2. As a Member, I want the app to never require my Letterboxd password, so that my account stays safe.
3. As a Member, I want to see both Watchlists merged into one Combined Watchlist, so that we can pick a film together from a single place.
4. As a Member, I want each Film to show its Owners (Sara, Vinicius, or both), so that I know whose list it came from.
5. As a Member, I want an Owners filter with "Todos", "Sara", "Vinicius" and "Os dois", so that I can narrow the list to one person or to films we both want.
6. As a Member, I want the "Sara" filter to include films that are also in Vinicius's Watchlist, so that it represents her full Watchlist.
7. As a Member, I want "Os dois" to show only films present in both Watchlists, so that we can find guaranteed mutual picks.
8. As a Member, I want films already watched by one of us to stay in the list, so that the list mirrors Letterboxd exactly.
9. As a Member, I want to see films as posters in a grid, so that browsing feels like Letterboxd instead of a plain text list.
10. As a Member, I want titles in Portuguese with the original title shown smaller, so that I recognise films the way Letterboxd shows them in Brazil.
11. As a Member, I want to filter by Provider (Netflix, Max, Prime Video, Apple TV, Google Play…), so that I only see films I can watch on a given service.
12. As a Member, I want every Offer Type available in Brazil (subscription, free, ads, rent, buy) to count as available, so that I can also find films I'd rent or buy.
13. As a Member, I want an optional Offer Type filter, so that I can hide films that would cost extra.
14. As a Member, I want each Film card to show Provider logos with an Offer Type badge, so that I can tell at a glance where and how to watch it.
15. As a Member, I want films with no Offer in Brazil to still appear with a discreet "indisponível" badge, so that the list stays complete.
16. As a Member, I want unavailable films to disappear when any Provider filter is active, so that filtering by service gives only watchable results.
17. As a Member, I want to filter by genre, so that I can match our mood.
18. As a Member, I want to filter by year or decade, so that I can pick something old or recent.
19. As a Member, I want to filter by runtime, so that I can find something short on a weeknight.
20. As a Member, I want to filter by country and language, so that we can choose, e.g., a Korean or Brazilian film.
21. As a Member, I want to filter by TMDB rating, so that I can skip poorly rated films.
22. As a Member, I want to combine several filters at once, so that I can answer questions like "short dramas on Netflix that we both want".
23. As a Member, I want the list sorted by date added to the Watchlist (newest first) by default, so that recent additions surface.
24. As a Member, I want to sort by year, runtime and rating, so that I can browse in other orders.
25. As a Member, I want to click a poster and see a detail panel with backdrop, synopsis, genres, year, runtime, Owners and all Offers, so that I can decide without leaving the app.
26. As a Member, I want links from the detail panel to the Film on Letterboxd and to its JustWatch page, so that I can go straight to watching or logging it.
27. As a Member, I want the app to look polished and stylish (dark "cinema" theme, serif titles, our own accent colour), so that it feels like a crafted product.
28. As a Member, I want the app to work well on phone, iPad and desktop, so that we can use it from the couch or the computer.
29. As a Member, I want the data to refresh automatically every day, so that new Watchlist additions and Provider changes show up without effort.
30. As Vinicius, I want to trigger a Sync manually from GitHub, so that a film we just added shows up right away.
31. As Vinicius, I want Offers to be refreshed when older than about 7 days, so that Provider changes are reflected without hammering TMDB.
32. As Vinicius, I want a written setup guide for GitHub Pages, the GitHub Action and the TMDB key, so that I can deploy it myself.
33. As a Member, I want to open the app via a plain link with no login, so that it's frictionless to use.

## Implementation Decisions

- Architecture follows ADR 0001: static site on GitHub Pages; a scheduled (daily) and manually-dispatchable GitHub Action runs the Sync and commits the generated data the site reads. No backend, no in-site sync button.
- Stack: TypeScript throughout. Site built with Vite + Svelte. Sync is a Node script in the same repo.
- **Sync module** (deep module, one entry point): given the two Members' usernames, produces the Combined Watchlist data file. Internally:
  - Scrapes each Member's public Watchlist pages (paginated) for film slugs, keeping Watchlist order as the "date added" ordering.
  - Resolves each slug to a TMDB id from the Letterboxd film page (`data-tmdb-id`); this mapping is cached since it never changes.
  - Fetches Film details from TMDB in `pt-BR` (title, original title, overview, genres, year, runtime, countries, original language, rating, poster, backdrop).
  - Fetches watch providers for region `BR`, flattening every Offer Type into Offers (Provider id, name, logo, Offer Type) plus the JustWatch link.
  - Amazon Channels (e.g. "HBO Max Amazon Channel", "Telecine Amazon Channel") are merged into their base Provider (HBO Max, Telecine), so the Provider filter stays short.
  - Caches Film and Offer data in the committed data; Offers older than ~7 days are refetched.
  - HTTP access is injected so it can be tested against recorded fixtures; requests to Letterboxd are throttled politely.
  - Fallback if Letterboxd blocks scraping: accept Letterboxd CSV exports as Watchlist input (not built unless needed).
- **Data contract** (site ↔ Sync): a single JSON file containing the list of Films, each with TMDB id, Letterboxd slug, Owners, date-added rank per Member, metadata, poster/backdrop paths, Offers, JustWatch link, and timestamps of last refresh.
- **Query module** (pure): given the Combined Watchlist, a filter set and a sort, returns the visible Films. Owners semantics: "Sara"/"Vinicius" = Film is in that Member's Watchlist; "Os dois" = in both. Provider filter matches any Offer on a selected Provider; when active, Films with no Offers are excluded. Offer Type filter restricts which Offers count.
- **UI**: poster grid, filter sidebar, sort control, detail panel/sheet. Images and Provider logos served from TMDB's image CDN. TMDB/JustWatch attribution shown in the footer. Visual direction chosen in the prototype round (2026-10-14), a mix of variants A and B:
  - Poster grid and cards from variant A "Foyer": dense grid (3 columns on phone), Owners badge (S/V circles), up to 3 Provider logos with an Offer Type mark for rent/buy, greyed "indisponível" card, hover title.
  - Filter sidebar from variant B "Programa": Owners with live counts, Provider logo grid with multi-select, Offer Type chips, genre/decade/runtime/country/language, minimum TMDB rating, reset.
  - Typography and palette from A: Fraunces (display) + Manrope (body), graphite background, brass accent.
  - New: the sidebar collapses completely (toggle with active-filter count) so the selected films can be seen without it; state remembered per browser. On phone it is a bottom sheet, closed by default.
  - Detail panel: A's side drawer (bottom sheet on phone), by default; the user did not comment on it.
  - Prototype (primary source): branch `prototype/watchlist-ui`, file `.scratch/watchlist-app/prototype-ui.html` (`?variant=A|B|C`).
- Secrets: TMDB API key stored as a GitHub Actions secret; never shipped to the site.
- Setup guide documented in the repo (Pages, Action, secret, usernames).

## Testing Decisions

- Good tests exercise external behaviour only: inputs in, outputs out, no assertions on internal helpers.
- Two seams:
  1. **Sync**: run the Sync entry point with injected HTTP returning recorded Letterboxd HTML and TMDB JSON fixtures; assert on the produced data file (merging, Owners, Offers flattening, cache/refresh rules, pagination).
  2. **Query**: call the pure query function with a small hand-built Combined Watchlist; assert on returned Films for Owners, Provider, Offer Type, metadata filters, combinations and sorting.
- UI is verified by running the app, not unit-tested.
- No prior art in the repo (greenfield).

## Out of Scope

- Editing Letterboxd Watchlists from the app.
- Logins, accounts, or private Watchlists.
- Marking or hiding films watched by a Member.
- Letterboxd average rating (would require extra scraping).
- A "services we subscribe to" preset.
- Regions other than Brazil.
- Native apps.

## Further Notes

- Glossary: `GLOSSARY.md`. Architecture decision: `docs/adr/0001-static-site-synced-by-github-actions.md`.
- Verified during design: public Watchlist pages expose `data-item-slug` without login; film pages expose `data-tmdb-id`.
- Visual direction was chosen in a prototype session (three variations); see the UI decision above and branch `prototype/watchlist-ui`.
