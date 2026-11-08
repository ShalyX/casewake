# Motion handoff — Phase 19, 2026-11-08

UI motion contract: MOTION_STORYBOARD_ROUSE_2026-11-08.md; static frames: design/phase19/index.html. The app story separates chain evidence, reviewed recall, human approval, accepted storage, completed receipt and distinct recurrence. Final footage must use current implemented Rouse and real read-only receipt/recall. Frame pairs are recorded design targets, not footage or proof of a live sequence. Film production and rewrite of the obsolete script remain Phase27.

---

# Current narrative direction — Rouse, 2026-11-08

The Nov 4 script below is historical and is not the current proof ceiling. Rouse now has one explicitly ShalyX-approved independent integration resolution, a completed Mainnet blob and verified exact-blob recall on a distinct compatible failure. It still does not prove the original operator deployed a correction or that a historical onchain transaction was repaired.

The final demo should foreground the general incident-memory journey and the bounded approved case, with the procedure, reviewer, match reasons, source and exact blob visible. DESIGN.md supplies Phase 16 composition targets. No final video/script-production acceptance is claimed; rewrite the historical script during Phase 27 before recording.

---

# Casewake — Judge Demo Production

**Status:** script and shot plan prepared 2026-11-04. FINAL VIDEO NOT YET RECORDED.

**Competition:** Tatum x Walrus Total Recall. Duration: 2–3 minutes, public video URL required. Proposed cut: **02:35**, 1920x1080, 30 fps.

## Narrative
**The chain records the failed event. Casewake remembers useful precedent—with the evidence tier visible.** Live Tatum, live Walrus and one simulation-tested correction are genuine. We do **not** claim a historical transaction was repaired, a human engineer signed off, or an autonomous fix occurred.

## Exact recorded digests
- A — Historical failure with remembered runbook: `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6`.
- B — Separate repeated failure: `XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue`.
- C — Negative control: `Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp`.
All are genuine Sui Mainnet digests previously tested through Tatum; C is a different MoveAbort error.

## Final 02:35 film / timestamped shot list

| Time | Screen / cursor choreography | Exact voiceover / narration | Proof |
|---|---|---|---|
| 00:00–00:10 | Title over real failed transaction detail. Snap to `InsufficientCoinBalance`. | "Your transaction failed. So did another one. The blockchain remembers both failures—but does anyone remember what to check next?" | Real onchain failure A |
| 00:10–00:25 | Casewake branded landing, enter Workspace, click **Repeat failure** example. | "This is Casewake: an engineering memory for repeated Sui transaction failures. No wallet required. No transaction signing." | Real UI, honest feature scope |
| 00:25–00:45 | Enlarged error panel: digest, Tatum gRPC, failing command 16 `splitCoins`. Deliberate short pause on provenance. | "Tatum reads the actual Sui Mainnet transaction effects. Here, command sixteen tried a coin split and failed with InsufficientCoinBalance. That is onchain evidence, not an AI guess." | Live Tatum `GetTransaction` |
| 00:45–01:05 | Scroll horizontally or pan toward Walrus sidebar; a prior case appears with amber/green evidence category. | "Walrus recalls a previously seen failure and a runbook tested against Mainnet simulation. We don't label that historical incident resolved—because it wasn't verified as repaired." | Live semantic recall + deterministic classification |
| 01:05–01:30 | Click **Inspect the actual Tatum simulation evidence**. Show failed left 20M, successful right 5M; details visible. | "We recreated the exact *error pattern* under controlled conditions: split twenty million from a ten-million-MIST coin, and simulation fails. Change the requested split to five million, and the simulation passes. Neither was submitted onchain." | `/proof/splitcoins`, saved responses |
| 01:30–01:48 | Show evidence SHA-256 and Walrus Mainnet blob on proof page; optionally overlay terminal excerpt with job receipt but no secret env. | "That tested procedure was written to Walrus Mainnet and recalled in another session. The memory blob and evidence fingerprint are here, so judges can inspect what the claim is based on." | Blob `keORrsffV8gLkXG8smus_plmk1qUnXC2m2Gv9gyBwAw` |
| 01:48–02:05 | Back to workspace, click **Second case**, wait for matching runbook. | "A separate real transaction produces the same failure class and command type. Casewake remembers the procedure—and labels its limitations." | Distinct digest B, 1 matching runbook |
| 02:05–02:18 | Click **Negative control**; show unrelated MoveAbort and no simulation runbook. | "But a different MoveAbort does not get that suggestion. Similar-looking text isn't enough to recommend a fix." | Real negative control C |
| 02:18–02:32 | Tight evidence montage: 12 Walrus records, 10 observed failures, test runbook, Tatum/GitHub code; avoid unverified claims. | "We have twelve completed Walrus Mainnet memories, including ten genuine failure observations, and live Tatum reads. Every reused recommendation has a provenance tier." | `/api/memories`, receipts, repo |
| 02:32–02:35 | Casewake wordmark, tagline. | "Casewake. The next failure shouldn't start from zero." | Final product name |

## Recording environment
- Film only the app browser; use a separate Chrome profile with no personal tabs, notifications or extensions.
- Browser 1920x1080, zoom 110% or 125% only if evidence and two-column UI remain visible.
- Pre-open `/`, `/workspace`, `/proof/splitcoins`; preload real digests through the public example buttons.
- Record both a fully live run and a backup evidence shot for each upstream dependency. If a provider fails, **never** splice in invented successful API data; label backup clips with recorded time or use recorded run with context.
- No credential fields, browser devtools showing request headers, `.env.local`, private keys, wallet secrets, or hidden user information.
- Motion: direct cuts, slow evidence zooms only when necessary; no stock streamer, fake chat, generic robot imagery, random animations or copyrighted music.
- Captions: optional but keep technical terms correctly spelled. Mono text at least 16 px screen equivalent in final recording.
- Sound: clean spoken narration; no required music. Hard limiter and noise check before publish.
- Export: MP4 H.264 + AAC, 1920x1080, 30 fps, 2:35 target.
- Filename target: `artifacts/casewake-total-recall-demo.mp4`; **NOT CREATED** yet.

## Reset + proof checks
1. Confirm `PUBLIC_DEMO_MODE=true` (or configured preview environment); reviewer writes disabled.
2. Check `/api/status`: keys configured, `publicDemoMode=true`, `reviewerWritesEnabled=false`.
3. A and B must return `simulationRunbooks.length === 1` from a live successful Walrus recall.
4. C must return `simulationRunbooks.length === 0`.
5. `/proof/splitcoins` must show the *real* failed and successful test data; do not edit the proof JSON.
6. `/api/memories` must return an independently measured complete count (12 as of Nov 4).
7. Capture screenshot evidence before filming, then rehearse full 2:35 path once.
8. After recording, watch full video and log timestamps for any freezes/dead air, unreadable code, misleading sentences, bad audio, or missing sponsor proof. Do not declare DEMO_QA passed until actual file review.

## Backup assets
- `evidence/screenshots/simulation-recall-workspace.png`
- `evidence/screenshots/simulation-proof-page.png`
- `evidence/controlled-splitcoins-simulation.json`
- `evidence/simulation-runbook-receipt.json`
- `evidence/observation-write-receipts.json`
- `evidence/live-recall-proof.json`

**Current evidence boundary:** We have reproduced the error pattern and tested a correction under Sui Mainnet *simulation*. We have **not** independently verified that the original historical transaction was successfully repaired or that a human reviewed a case-specific fix.


## 2026-11-05 — Public production rehearsal status

- Production URL: https://casewake.vercel.app; deployment READY at dpl_EBnwaqjqjDm4UFhGe9oovHwkKTym, commit 40e93fd.
- Tatum + Walrus private env credentials configured in Vercel Production as sensitive values; never expose in video or logs.
- Live first case: one simulation runbook + one observation from 12 hits, no degradation.
- Live second comparable failure: one runbook, no degradation.
- Live negative control: zero runbooks, no degradation.
- Public write endpoints and unlisted digest are 403; do not show any anonymous write path.
- Landing, workspace, proof page, article and both screenshots return HTTP 200.
- Video status remains NOT RECORDED. Script still requires a complete timed recording, full watch-through and judge QA.

## Operator Phase 9 — original-product demo architecture guardrail (Nov 6)

The existing 02:35 script is an **honest fallback recording plan for the observation + simulation-tested runbook slice only**, not demonstration of the original locked Casewake magic moment. Never silently treat the fallback script as proof of full-product completion.

**Required full-product film, conditional on actual proof:** (a) real failed Sui digest read from Tatum; (b) engineer explains and confirms a specific independently corroborated correction; (c) protected Casewake reviewer approval; (d) completed Mainnet Walrus job/blob receipt; (e) a *different* genuine comparable failed Sui transaction retrieves the exact reviewed blob; (f) unrelated failure is correctly excluded. Identify the provenance/evidence tier at each beat. No fabricated engineer, transaction, evidence or memory. The DeepBook three-gate full-route scenario stays a featured proof, not the whole product.

Before DEMO_PRODUCTION, replace the fallback script or explicitly show what failed to meet the original locked P0. Never manufacture the missing human-approved memory simply to capture an idealized demo. Recording reset must show real app state and avoid secrets.
