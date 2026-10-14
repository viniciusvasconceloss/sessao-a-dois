# 04: Coding standards for the reviewer, with checks for the mechanical rules

**What to build:** The Standards reviewer checks the code against written rules instead of guessing. The rules that can be checked mechanically fail `npm run check` or `npm test` on their own. These findings came back again and again in the watchlist-app reviews.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] A short `CODING_STANDARDS.md` with only the judgement rules:
  - identifiers use GLOSSARY terms
  - each value has one source of truth (no defaults or labels copied between files)
  - tests cover boundaries and empty or unknown values
  - comments are updated when behaviour changes
- [x] The data contract is types only (no runtime helpers imported by Sync). This is enforced by a check that fails if the contract exports a runtime value
- [x] An unused export fails a check (the `noUnusedLocals` compiler flag already catches unused imports)
- [x] The `code-review` skill finds the file without needing a pointer, or gets one
