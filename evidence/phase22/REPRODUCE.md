# Reproduce Phase22 QA

Use an isolated production checkout, webpack build and local port4242. Keep credentials outside artifacts. The historical run-discovery helper loads the operator's existing environment privately and starts Next with PUBLIC_DEMO_MODE=true to exercise the public-read boundary. No reviewer secret is used by browser fixtures. Do not execute real storage endpoints for this QA.

Browser scripts live in web/scripts/phase22-*.mjs. With the installed Playwright CLI, wrap the exported function as `async (page) => { ... }` in a temporary file and run `playwright-cli -s=<owned-session> run-code --filename <file>`. The function returns structured JSON; extract the CLI's `### Result` block. Strip a trailing function-declaration semicolon from the wrapper if present.

Install axe-core in a separate QA directory at ../qa-tools/node_modules/axe-core (or change axePath in the script); the recorded version is4.14.0. This is a QA dependency, not a production bundle dependency. Playwright video requires its ffmpeg installation. System ffprobe/ffmpeg were used to inspect recordings and create review copies.

Run static-audit first; it clears sessionStorage before actual live screenshots. Then states-qa, library-states-qa and keyboard-qa. All storage routes in state suites are intercepted; fixture submissions are counted separately from real writes. The stable Axe scans wait for reveal animation completion to measure final text colors. The 320px receipt scan exercises long source digests.

Run motion-qa alone in a foreground browser after all Axe scans finish. It creates four isolated recorded contexts and brings each to the foreground. Each intercepts all API routes and displays a fixture badge. Avoid full-page screenshots during recordings: their temporary viewport resize can appear in the video. Compare normal and reduced recordings, response/event times, retained focus, pending/completed labels and search retry behavior. Recordings are about22seconds each and are QA material, not the final hackathon demo.

Run live-fold separately for the real anonymous recurrence and exact reviewed blob. verify-discoverability-readonly.mjs covers actual public inspection/library/search and protected routes without valid authorization. Preserve its result separately in this evidence directory. Run npm lint/test, webpack build and scripts/verify-design-lock.py. API implementation and write guards should remain unchanged.

`python scripts/verify-phase22-qa.py` checks the committed evidence and source hashes. It is an evidence consistency check, not a claim that the browser suite has just been rerun. After app changes, rerun the relevant browser states and regenerate the reviewed source manifest before claiming fresh acceptance.

Boundaries: Chromium/Windows only, no Narrator/NVDA/Safari/Firefox/physical-device certification; public deployment remains separate. See REVIEW.md for findings, target comparison and exact evidence scope.
