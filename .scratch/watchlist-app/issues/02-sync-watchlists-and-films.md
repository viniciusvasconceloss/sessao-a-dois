# 02: Sync both Watchlists and Film details into the site

**What to build:** The site shows the Members' real Combined Watchlist instead of sample data. A GitHub Action runs the Sync daily and on manual dispatch, scrapes both public Watchlists, resolves each Film to TMDB, fetches its pt-BR details and commits the data file the site reads (ADR 0001). Offers are not part of this ticket (see 03).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Sync has one entry point taking the Members config and producing the data file in the contract from 01
- [ ] Scrapes every page of each public Watchlist (28 Films per page; Sara ~387, Vinicius ~264) and keeps Watchlist order as date-added rank per Member
- [ ] Owners correct for Films in one or both Watchlists; Films removed from a Watchlist disappear
- [ ] Letterboxd slug → TMDB id resolved from the film page and cached forever; Film details (pt-BR title, original title, overview, genres, year, runtime, countries, language, rating, poster, backdrop) cached in the data
- [ ] Letterboxd requests throttled politely; first full run (~600 Films) completes within the Action's limits; later runs only fetch new Films
- [ ] HTTP is injected; tests run the entry point against recorded Letterboxd HTML and TMDB JSON fixtures and assert on the produced data (merge, Owners, pagination, caching, removal)
- [ ] Workflow runs on a daily schedule and via manual dispatch, commits only when data changed, and the commit triggers a Pages redeploy
- [ ] TMDB API key read from a GitHub Actions secret, never shipped to the site
- [ ] Setup guide covers getting a TMDB key, adding the secret, and running the Sync manually from GitHub (incl. the mobile app)
