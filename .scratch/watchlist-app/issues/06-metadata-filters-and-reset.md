# 06: Genre, decade, runtime, country, language, minimum rating and reset

**What to build:** A Member combines metadata filters ("O quê" and "Nota TMDB mínima") with the others to answer questions like "short dramas on Netflix we both want", and resets everything in one click.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] "O quê": genre, decade, runtime range, country, language as stacked selects (no side-by-side truncation), options built from the data
- [ ] "Nota TMDB mínima": slider 0–9, step 0.5
- [ ] "Limpar filtros" resets every filter (Owners back to Todos), not the sort
- [ ] All filters combine with AND across sections
- [ ] Query tests cover each filter and a multi-filter combination
