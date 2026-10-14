# 05: Provider and Offer Type filters

**What to build:** A Member picks one or more Providers from a logo grid ("Onde") and optionally restricts Offer Types ("Como"), and the grid shows only Films watchable that way.

**Blocked by:** 04

**Status:** done

- [x] "Onde": grid of Provider logo buttons built from the Providers present in the data; multi-select with OR semantics
- [x] When any Provider is selected, Films with no Offers are hidden
- [x] "Como": chips Assinatura / Grátis / Com anúncios / Aluguel / Compra; selected Offer Types restrict which Offers count for the Provider filter and for "has any Offer"
- [x] Owners counts update with these filters
- [x] Query tests cover single/multi Provider, Offer Type restriction, their combination, and the unavailable-Film rule

## Comments

- Decided with Vinicius: "Como" alone (no Provider) filters on its own, showing Films with an Offer of a selected type on any Provider. "Onde" logos are ordered by number of Films, most first.
- Added on request: "Buscar serviço" field filters the "Onde" logos as you type (Enter selects the first); "Buscar filme" in the top row filters the grid by pt-BR or original title (Query `search`, case/accent-insensitive).
