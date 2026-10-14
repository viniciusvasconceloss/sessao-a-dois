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

The token is used by the Sync in GitHub Actions, and locally (from `.env.local`) by the Sync and `record-tmdb`; it never reaches the site.

## Sync

`.github/workflows/sync.yml` scrapes both Watchlists, fetches Film details from TMDB and commits `data/combined-watchlist.json`. When the data changed it redeploys the site. It runs daily at 06:00 (Brasília).

Run it manually:

- **Browser**: repo → **Actions** → **Sync** → **Run workflow** → **Run workflow**.
- **GitHub mobile app**: open the repo → **Actions** → **Sync** → **⋯** / **Run workflow**.

The first run fetches every Film (~600, about 15 minutes, since Letterboxd is called once per second). Later runs only fetch Films that are new to a Watchlist.

## Local development

The project runs on Node 24 (`.nvmrc`), the same as CI. Switch with [nvm](https://github.com/nvm-sh/nvm):

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash   # once, then open a new shell
nvm install     # reads .nvmrc; installs and switches to Node 24
nvm use         # in later shells
```

Distro-packaged Node (e.g. apt's `/usr/bin/node`) may lack TypeScript type stripping, so `npm run sync` fails with `ERR_UNKNOWN_FILE_EXTENSION`; nvm's official build does not.

`npm install` also points git at `.githooks/`, whose `pre-push` runs `check`, `test` and `build` and blocks the push if any fails. It checks the working tree, so commit or stash edits first. Skip it in an emergency with `git push --no-verify`.

For the Sync and `record-tmdb`, put the token in `.env.local` at the repo root (git-ignored); an exported `TMDB_API_TOKEN` takes precedence:

```sh
TMDB_API_TOKEN=eyJ...
```

`record-tmdb` fetches real TMDB responses for every movie the `lb-film-*.html` fixtures point at, plus the BR Provider catalog. Re-recording changes the values some Sync tests assert on, so update those in the same commit.

```sh
npm install
npm run dev     # local site
npm test        # unit tests
npm run check   # typecheck
npm run sync    # run the Sync locally (token from .env.local)
npm run record-tmdb   # re-record the TMDB fixtures in sync/fixtures
npm run shot -- / iphone --click .toggle   # screenshot → shots/iphone.jpg
```

`npm run shot -- [route|url] [phone|ipad|desktop|iphone] [--click <selector>]` starts and stops its own dev server for a route, writes a DPR-1 JPEG to `shots/<device>.jpg` and exits 1 if the page logged errors. `iphone` renders with WebKit. One-time browser setup: `npm run browsers`, then `sudo npx playwright install-deps chromium webkit`.

The site reads `data/combined-watchlist.json` (contract in `src/contract.ts`), written by the Sync.
