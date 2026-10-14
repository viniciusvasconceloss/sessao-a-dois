# 02: One command to screenshot the app, including iPhone Safari

**What to build:** An agent that needs to see the site runs one project command and gets a small screenshot at phone, iPad or desktop size. It no longer hunts for a browser, installs Playwright into a scratchpad, borrows it from another repo or patches `executablePath`. In the watchlist-app sessions, browser setup was rediscovered in 5+ sessions. The ticket 08 session hit 16MB, 91% of it 2x-DPR PNG screenshots re-read on every CSS tweak. The same command also renders with WebKit at iPhone size. 4 of the 5 rework rounds on ticket 08 were mobile layout, and the Safari heading fix shipped untested.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] **Human step:** the user runs `sudo npx playwright install-deps webkit` once, since installing it needs sudo. The agent asks for this at the start instead of working around it
- [x] Playwright is a dev dependency, and its browser installs with a documented npm script
- [x] One npm script takes a URL or route and a device (`phone`, `ipad`, `desktop`) and writes a screenshot to a fixed path
- [x] Screenshots use DPR 1 and a compressed format; a phone shot is well under 200KB
- [x] The dev server can be started and stopped without `pkill -f vite`, whose exit code 144 broke chained commands, for example by a script that owns the server's lifecycle
- [x] A pointer the agent sees (a project `run` skill or one CLAUDE.md line) names the command
- [x] The command accepts an `iphone` device that uses WebKit with an iPhone viewport and user agent, and a screenshot of the filter sheet renders without errors
