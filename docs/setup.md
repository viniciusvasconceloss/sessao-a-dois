# Setup

## GitHub Pages

The site is built and deployed by `.github/workflows/deploy.yml` on every push to `main`.

1. On GitHub, open the repo → **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, choose **GitHub Actions**.
3. Push to `main` (or open **Actions** → **Deploy site** → **Run workflow**).
4. When the run finishes, the link is shown on the run's summary and under **Settings** → **Pages**, e.g. `https://<user>.github.io/<repo>/`.

The site uses relative paths, so it works under any repo name.

## Members

Display name, Letterboxd username and badge colour live in `src/members.ts`. The Sync reads every Member listed there; Watchlists must be public.

## TMDB token

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/signup).
2. Open **Settings** → **API** ([direct link](https://www.themoviedb.org/settings/api)) and request an API key (type "Developer", personal use).
3. Copy the **API Read Access Token** (the long one starting with `eyJ`, not the short "API Key").
4. On GitHub, open the repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Name: `TMDB_API_TOKEN`, value: the token.

The token is only used by the Sync inside GitHub Actions; it never reaches the site.

## Sync

`.github/workflows/sync.yml` scrapes both Watchlists, fetches Film details from TMDB and commits `data/combined-watchlist.json`. When the data changed it redeploys the site. It runs daily at 06:00 (Brasília).

Run it manually:

- **Browser**: repo → **Actions** → **Sync** → **Run workflow** → **Run workflow**.
- **GitHub mobile app**: open the repo → **Actions** → **Sync** → **⋯** / **Run workflow**.

The first run fetches every Film (~600, about 15 minutes, since Letterboxd is called once per second). Later runs only fetch Films that are new to a Watchlist.

## Local development

```sh
npm install
npm run dev     # local site
npm test        # unit tests
npm run check   # typecheck
TMDB_API_TOKEN=eyJ... npm run sync   # run the Sync locally (needs an official Node.js build ≥ 22.18)
```

The site reads `data/combined-watchlist.json` (contract in `src/contract.ts`), written by the Sync.
