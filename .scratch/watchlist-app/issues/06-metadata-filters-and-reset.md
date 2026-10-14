# 06: Genre, decade, runtime, country, language, minimum rating and reset

**What to build:** A Member combines metadata filters ("O quê" and "Nota TMDB mínima") with the others to answer questions like "short dramas on Netflix we both want", and resets everything in one click.

**Blocked by:** 04

**Status:** done

- [x] "O quê": genre, decade, runtime range, country, language as stacked selects (no side-by-side truncation), options built from the data
- [x] "Nota TMDB mínima": slider 0–9, step 0.5
- [x] "Limpar filtros" resets every filter (Owners back to Todos), including "Buscar filme" and "Buscar serviço", not the sort
- [x] All filters combine with AND across sections
- [x] Query tests cover each filter and a multi-filter combination

## Comments

- Runtime ranges follow the prototype: Até 1h40 / Até 2h10 / Mais de 2h10 (limits inclusive); Films with unknown runtime (0) match no range.
- Country and language names come from `Intl.DisplayNames` (pt-BR); TMDB's `cn` is Cantonese, and gone countries (XC, SU, AN) get their own names.
