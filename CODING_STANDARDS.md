# Coding standards

Judgement rules for writing and reviewing code here. The mechanical rules (the data contract in `src/contract.ts` is types only; every export is imported somewhere) are checked by `scripts/standards.test.ts` and `npm test`, so reviewers can skip them.

- **Identifiers use GLOSSARY terms.** Name things after the terms in `GLOSSARY.md` (Film, Member, Watchlist, Owners, Provider, Offer, Offer Type…), not synonyms.
- **Each value has one source of truth.** Defaults, labels, orderings and lists live in one place and are imported from there. Don't copy them into a second file, a test, or a component.
- **Tests cover boundaries and empty or unknown values.** Each rule is tested at its edges (first/last, min/max, exactly on a threshold) and with empty input, missing fields, and codes or values the code doesn't know.
- **Comments are updated when behaviour changes.** A change that makes a comment false updates or deletes it in the same commit.
