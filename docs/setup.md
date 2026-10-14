# Setup

## GitHub Pages

The site is built and deployed by `.github/workflows/deploy.yml` on every push to `main`.

1. On GitHub, open the repo → **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, choose **GitHub Actions**.
3. Push to `main` (or open **Actions** → **Deploy site** → **Run workflow**).
4. When the run finishes, the link is shown on the run's summary and under **Settings** → **Pages**, e.g. `https://<user>.github.io/<repo>/`.

The site uses relative paths, so it works under any repo name.

## Members

Display name, Letterboxd username and badge colour live in `src/members.ts`.

## Local development

```sh
npm install
npm run dev     # local site
npm test        # unit tests
npm run check   # typecheck
```

The site reads `data/combined-watchlist.json` (contract in `src/contract.ts`). Until the Sync exists it holds sample data.
