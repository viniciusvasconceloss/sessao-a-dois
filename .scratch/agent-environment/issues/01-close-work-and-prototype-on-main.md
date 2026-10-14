# 01: Close tickets and the spec the same way every time; prototype on main

**What to build:** Two documentation fixes, so agents no longer have to dig. An agent finishing a ticket knows how to close it without opening an earlier ticket to copy it. When the last ticket of a spec closes, the spec closes in the same commit. In the watchlist-app sessions, tickets 04, 05 and 08 were committed still open, and a whole session was spent only on closing the spec. The UI prototype that was the design reference for watchlist-app lives on main, next to the spec, and the spec points to it. Agents no longer dig it out of the `prototype/watchlist-ui` branch with `git show` and grep (4 times, with output over the limit every time).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] The issue-tracker doc has a "Closing work" section: `Status: done`, every acceptance box ticked, both in the commit that delivers the ticket
- [x] The same section says: when the last ticket of a spec is done, set the spec's Status to done in that commit
- [x] `done` is in the triage-labels vocabulary, so the reviewer stops flagging it
- [x] The `implement` skill tells the agent to close the ticket (via the issue-tracker doc) before committing
- [x] The prototype HTML is committed in the watchlist-app folder in `.scratch`
- [x] The spec has a one-line pointer to it
- [x] Ask the user whether to delete the `prototype/watchlist-ui` branch (local and remote). Do not delete it without a yes (user said yes; deleted)
