# 03: Sync Offers in Brazil

**What to build:** Cards and filters reflect where each Film can really be watched in Brazil. The Sync fetches TMDB watch providers for region BR, turns them into Offers of every Offer Type, and keeps them fresh.

**Blocked by:** 02

**Status:** done

- [x] Every Offer Type counted: subscription, free, ads, rent, buy; each Offer has Provider id, name, logo and Offer Type
- [x] Amazon Channels (e.g. "HBO Max Amazon Channel", "Telecine Amazon Channel") merge into their base Provider; no duplicate Offers result
- [x] JustWatch link stored per Film
- [x] Offers older than ~7 days are refetched; fresher ones are kept as is
- [x] Films with no BR Offers are stored with an empty Offer list (site shows "indisponível")
- [x] Tests (same seam as 02) cover flattening, channel merge, empty Offers and the refresh rule

## Comments

- (from 01) The contract has no Provider id yet (the sample data had none); add `providerId` to `Offer` in `src/contract.ts` here, when the Sync produces real ids.
- (from 03) Channels resold through Amazon, Apple TV or Roku Premium merge into their base Provider, looked up by name in TMDB's BR catalog (fetched at most once per Sync). If the base isn't in the catalog, the Offer keeps the channel's id and logo under the base name. Offers are deduplicated by Provider name + Offer Type, so a Provider filter (05) should key on name, not id.
- (from 03) TMDB exposes no direct JustWatch URL. `justwatch` holds `results.BR.link`, TMDB's watch page, which links out to JustWatch.
