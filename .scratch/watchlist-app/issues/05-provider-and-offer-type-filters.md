# 05: Provider and Offer Type filters

**What to build:** A Member picks one or more Providers from a logo grid ("Onde") and optionally restricts Offer Types ("Como"), and the grid shows only Films watchable that way.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] "Onde": grid of Provider logo buttons built from the Providers present in the data; multi-select with OR semantics
- [ ] When any Provider is selected, Films with no Offers are hidden
- [ ] "Como": chips Assinatura / Grátis / Com anúncios / Aluguel / Compra; selected Offer Types restrict which Offers count for the Provider filter and for "has any Offer"
- [ ] Owners counts update with these filters
- [ ] Query tests cover single/multi Provider, Offer Type restriction, their combination, and the unavailable-Film rule
