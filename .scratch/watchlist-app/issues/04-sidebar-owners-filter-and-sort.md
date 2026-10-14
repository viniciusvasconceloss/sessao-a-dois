# 04: Filter sidebar with Owners filter and sort

**What to build:** A Member narrows the grid to Todos / Sara / Vinicius / Os dois from a sidebar and changes the sort order. Introduces the pure Query module that all later filters extend.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Query module: pure function (Combined Watchlist, filters, sort) → visible Films, built test-first
- [ ] Owners semantics: "Sara"/"Vinicius" = Film is in that Member's Watchlist (including shared); "Os dois" = in both; "Todos" = all
- [ ] Sidebar laid out like variant B, restyled with A's fonts and tokens: wordmark "Sessão a dois" + one-line description, then "De quem" as a vertical list
- [ ] Each Owners option shows a live count computed with the current filters except Owners
- [ ] Sort as a compact select in the main area's top row: date added (default), year, runtime, rating
- [ ] Film count shown in the top row
