# 02: Sync both Watchlists and Film details into the site

**What to build:** The site shows the Members' real Combined Watchlist instead of sample data. A GitHub Action runs the Sync daily and on manual dispatch, scrapes both public Watchlists, resolves each Film to TMDB, fetches its pt-BR details and commits the data file the site reads (ADR 0001). Offers are not part of this ticket (see 03).

**Blocked by:** 01

**Status:** done

- [x] Sync has one entry point taking the Members config and producing the data file in the contract from 01
- [x] Scrapes every page of each public Watchlist (28 Films per page; Sara ~387, Vinicius ~264) and keeps Watchlist order as date-added rank per Member
- [x] Owners correct for Films in one or both Watchlists; Films removed from a Watchlist disappear
- [x] Letterboxd slug → TMDB id resolved from the film page and cached forever; Film details (pt-BR title, original title, overview, genres, year, runtime, countries, language, rating, poster, backdrop) cached in the data
- [x] Letterboxd requests throttled politely; first full run (~600 Films) completes within the Action's limits; later runs only fetch new Films
- [x] HTTP is injected; tests run the entry point against recorded Letterboxd HTML and TMDB JSON fixtures and assert on the produced data (merge, Owners, pagination, caching, removal)
- [x] Workflow runs on a daily schedule and via manual dispatch, commits only when data changed, and the commit triggers a Pages redeploy
- [x] TMDB API Read Access Token (v4, sent as Bearer) read from the GitHub Actions secret `TMDB_API_TOKEN` (already created by Vinicius), never shipped to the site
- [x] Setup guide covers getting a TMDB key, adding the secret, and running the Sync manually from GitHub (incl. the mobile app)

## Comments

- (from 01) A push made with the default `GITHUB_TOKEN` does not trigger other workflows, so the Sync's data commit won't fire `deploy.yml` on its own. Have the Sync workflow call the deploy (e.g. make `deploy.yml` a `workflow_call` and invoke it after committing) instead of relying on the push.
- (from 02) New Films get `offers: []`, `justwatch: null` and `offersFetchedAt` = epoch ("never"), so 03's refresh rule picks them all up on its first run. Add the Offers fetch to `fetchFilm`/the cached branch in `sync/sync.ts` and extend `sync/sync.test.ts` with TMDB `/watch/providers` fixtures.
- (from 02) Fixtures are trimmed copies of real Letterboxd markup; TMDB JSON fixtures are hand-written in TMDB's response shape (no token was available locally).
