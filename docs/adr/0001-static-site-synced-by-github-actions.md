# Static site synced by a scheduled GitHub Action, no backend

The app is a static site on GitHub Pages; a GitHub Action scrapes both public Letterboxd Watchlists, enriches Films with TMDB data and Brazilian Offers, and commits the resulting data that the site reads. It runs daily and can be triggered manually from GitHub — there is deliberately no "sync" button in the site itself.

## Considered Options

- **Backend on Vercel/Cloudflare with an in-site sync button**: rejected; needs a server and a cache store to maintain, and Letterboxd is more likely to block datacenter IPs on demand.
- **Run on a home PC**: rejected; unusable on phone/iPad away from home.

## Consequences

- Data is at most ~1 day stale unless the Action is triggered manually.
- The site and its data are public; acceptable because both Watchlists are already public.
