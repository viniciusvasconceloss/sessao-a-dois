# 07: Collapsible sidebar, phone bottom sheet, active-filter chips

**What to build:** A Member hides the filter sidebar to see the selected Films cleanly, while still seeing which filters are active. On phone, filters live in a bottom sheet.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Desktop / iPad landscape: a toggle in the top row collapses the sidebar completely and the grid takes the full width
- [ ] Toggle label shows the active-filter count, e.g. "Filtros (3)"
- [ ] Open/closed state remembered per browser (localStorage, wrapped in try/catch; works without it)
- [ ] Collapse animated, respecting prefers-reduced-motion
- [ ] Phone / iPad portrait: sidebar hidden by default, opens as a bottom sheet from the same toggle
- [ ] While collapsed, active filters appear as removable chips (e.g. "Netflix ×", "Os dois ×") — default not yet confirmed by the Members; easy to drop if they object
