# 03: Sync Offers in Brazil

**What to build:** Cards and filters reflect where each Film can really be watched in Brazil. The Sync fetches TMDB watch providers for region BR, turns them into Offers of every Offer Type, and keeps them fresh.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Every Offer Type counted: subscription, free, ads, rent, buy; each Offer has Provider id, name, logo and Offer Type
- [ ] Amazon Channels (e.g. "HBO Max Amazon Channel", "Telecine Amazon Channel") merge into their base Provider; no duplicate Offers result
- [ ] JustWatch link stored per Film
- [ ] Offers older than ~7 days are refetched; fresher ones are kept as is
- [ ] Films with no BR Offers are stored with an empty Offer list (site shows "indisponível")
- [ ] Tests (same seam as 02) cover flattening, channel merge, empty Offers and the refresh rule
