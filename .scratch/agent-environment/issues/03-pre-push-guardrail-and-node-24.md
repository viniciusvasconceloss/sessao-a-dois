# 03: Check before push, and the same Node locally as in CI

**What to build:** A push to main runs typecheck, tests and build first, and blocks the push if any of them fails. Today they only run in the deploy workflow after the push. Local Node matches CI (24), so `npm run sync` runs locally without `tsx`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A git pre-push hook, installed by `npm install`, runs `check`, `test` and `build`, and stops the push if any fails
- [ ] The project declares Node 24 (`.nvmrc` and `engines`), and the setup doc explains how to switch
- [ ] With Node 24, `npm run sync` gets past the TypeScript loader (`ERR_UNKNOWN_FILE_EXTENSION` no longer appears; a missing token is still fine)
