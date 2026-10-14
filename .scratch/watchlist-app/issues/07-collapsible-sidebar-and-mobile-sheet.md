# 07: Collapsible sidebar, phone bottom sheet, active-filter chips

**What to build:** A Member hides the filter sidebar to see the selected Films cleanly, while still seeing which filters are active. On phone, filters live in a bottom sheet.

**Blocked by:** 04

**Status:** done

- [x] Desktop / iPad landscape: a toggle in the top row collapses the sidebar completely and the grid takes the full width
- [x] Toggle label shows the active-filter count, e.g. "Filtros (3)"
- [x] Open/closed state remembered per browser (localStorage, wrapped in try/catch; works without it)
- [x] Collapse animated, respecting prefers-reduced-motion
- [x] Phone / iPad portrait: sidebar hidden by default, opens as a bottom sheet from the same toggle
- [x] While collapsed, active filters appear as removable chips (e.g. "Netflix ×", "Os dois ×") — default not yet confirmed by the Members; easy to drop if they object

## Comments

- Wordmark moved to the main top row, so it stays visible with the sidebar collapsed (Member decision).
- "Filtros (N)" counts one per chip; the film search is not a chip (always on screen).
- Phone sheet closes on backdrop tap or Escape; its open state is not remembered (closed on every visit).
