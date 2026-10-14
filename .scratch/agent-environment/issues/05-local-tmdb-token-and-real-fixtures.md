# 05: Local TMDB token and Sync fixtures from real responses

**What to build:** An agent can run the real Sync locally against TMDB, and the Sync tests use fixtures recorded from real responses. Hand-written fixtures missed lowercase "Amazon channel" and plan variants ("Netflix Standard with Ads"), which only showed up after a push and a real Sync, and cost an extra commit and an extra Sync run.

**Blocked by:** 03

**Status:** done

- [x] **Human step:** the user puts `TMDB_API_TOKEN` in a git-ignored local env file (`*.local` is already ignored). The agent never prints the token
- [x] `npm run sync` reads the token from that file when the variable is not set
- [x] A script records TMDB responses for a few real Films into the test fixtures, including plan variants and channels
- [x] The Sync tests run against those fixtures, and the merge of variants and channels into the base Provider is still covered
