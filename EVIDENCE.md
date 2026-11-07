# EVIDENCE REGISTRY — Total Recall
Checked 2026-11-04. Statuses describe facts independently of a proposal.

| Claim | Status | Method/source | Limitation/next proof |
|---|---|---|---|
| Deadline Nov 10 2026 17:00 UTC; 10+ Walrus Mainnet memories, Tatum RPC, blog, demo, repo required | VERIFIED (DOCUMENT) | https://thewalrussessions.wal.app/tatum-total-recall | Check for organizer updates |
| Sui `LedgerService.GetTransaction` through Tatum produces authentic execution failure data | VERIFIED (LIVE MAINNET) | `web/scripts/discover-failures.mjs`; `POST /api/transaction` digest `Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp` returned `failed` with MoveAbort error, 2026-11-04 | Read-only; no user-owned transaction submitted |
| Tatum Mainnet gRPC auth and transaction read | VERIFIED (LIVE MAINNET) | `web/scripts/probe-tatum-grpc.cjs` HTTP 200/gRPC 0, and real executed `GetTransaction` via production Next.js API. 100 recent Mainnet transaction results scanned; 56 failures observed, 24 distinct error strings in that sample | 56/100 is NOT a network failure-rate estimate; older doc sample digest had `NOT_FOUND` (pruned) |
| Walrus Mainnet confirmed write and recall through APP | VERIFIED (LIVE MAINNET) | `POST /api/observations` fetched actual failed digests via Tatum, wrote 10 unique real observed failures using MemWal SDK 0.1.12 and received 10 completed blob IDs in `evidence/observation-write-receipts.json`; `GET /api/memories` returned 11 in namespace incl. one previous smoke test. | Ten records are onchain-observed NOT human-confirmed resolutions. No fake verified remediation; account already contained 1 smoke memory. |
| Cross-team Walrus memory requires application-mediated access (owner+namespace scoped) | VERIFIED (DOCUMENT) | https://docs.wal.app/walrus-memory/sdk/cookbook-multi-tenant | Shared permissions/redaction not designed |
| Existing Sui Move debugger can replay onchain transactions | VERIFIED (DOCUMENT) | https://docs.sui.io/references/ide/debugger | No competitive differentiation from one-off explanation |
| Sui indexer exposes watermarks/lag monitoring | VERIFIED (DOCUMENT) | https://www.docs.sui.io/operators/data-management/indexer-stack-setup | Actual local indexer feed missing |
| Fullnode pruning complaint #27768 resolved in Sui 1.78.2/1.79.1 per maintainer | VERIFIED (PUBLIC REPORTED RESOLUTION) | https://github.com/MystenLabs/sui/issues/27768 | This is fullnode *pruner*, not indexer pipeline, and no recurrence proof |
| Comparable genuine failed transaction pairs | VERIFIED (LIVE MAINNET) | `evidence/live-recall-proof.json`: 3 different pairs, each with distinct real digests and exact matching failure signature; Tatum live fetch for each | Demonstrates repeated symptom, NOT a successful repair |
| Human-verified resolution reused on later incident | BLOCKED / UNPROVEN | Requires reproduced fix or independently source-verified successful remediation, reviewer signoff, then app `POST /api/remember` and later recall | Not attempted as a real approval; source-backed diagnosis draft `evidence/resolution-verification-queue.md` is explicitly unverified |
| Indexer Recovery is connected to real operator watermark data | UNPROVEN | planned read-only metrics/scrape integration | No actual connected indexer |
| Ten genuine Sui failure observation memories stored on Walrus Mainnet | VERIFIED (10 real source-backed observations) | `evidence/observation-write-receipts.json`, 10 distinct Tatum-confirmed failed transaction digests and ten completed Walrus blob IDs, `GET /api/memories` 11 total; 2026-11-04 | There are ZERO independently human-verified resolution memories. One additional smoke test is not counted among ten. |
| Deterministic filters + auth review guard | VERIFIED (LOCAL TEST & LIVE API) | 13 earlier Python synthetic tests, 10 pure TypeScript synthetic tests, `POST /api/remember` unauthorized 403 and unverified 400, `evidence/live-recall-proof.json` self-match rejected | Synthetic filters do NOT prove a repaired transaction or independent human verification |
| Organizer permits B2B Sui developer operations under Smart Agents for Real Life | UNCERTAIN | published tracks are broad | Ask organizer; no confirmed approval |
| Ecosystem users want a new product despite existing debuggers, docs, Rootly | UNPROVEN | proposed 1–2 engineer/operator interviews | No user interviews |

Never describe synthetic test cases as real chain events, verified incident resolutions, production metrics, or sponsor integrations.

## 2026-11-04 — Controlled splitCoins reproduction and tested-memory proof

| Claim | Status | Method/source | Boundaries |
|---|---|---|---|
| A coin split overdraw triggers InsufficientCoinBalance | **VERIFIED (LIVE MAINNET SIMULATION)** | `web/scripts/simulate-splitcoins-repro.mjs` via authenticated Tatum `TransactionExecutionService.SimulateTransaction`: first splits 10,000,000 MIST, then tries 20,000,000; failed with `InsufficientCoinBalance in command 1`. Response `evidence/controlled-splitcoins-simulation.json` | Transaction was **not signed or executed**, `gasPaymentMocked=true`. Sender is an address from public chain evidence, not proof of sender consent or a repaired original |
| Changing the second split amount to 5,000,000 MIST passes identical controlled structure | **VERIFIED (LIVE MAINNET SIMULATION)** | Same source script and Tatum simulator returned `Transaction`, `effectSuccess=true`, no execution error at 2026-11-04T12:59:19Z | This is a reproduced and *simulation-tested* remediation pattern, **not a successful fix executed on a historical sender's transaction** |
| Simulation-tested procedure persisted on Walrus Memory Mainnet | **VERIFIED (LIVE MAINNET STORAGE AND RECALL)** | `web/scripts/publish-simulation-runbook.mjs`; completed blob `keORrsffV8gLkXG8smus_plmk1qUnXC2m2Gv9gyBwAw`; job/receipt `evidence/simulation-runbook-receipt.json`; semantic recall found exact evidence hash `bb08e026fddaebfb1167484755cd088236cab4ed232966f6b706376e2b9aac0e` | Extra Mainnet memory distinct from ten factual observations and one smoke test. Status `simulation-tested-not-human-verified`. Doesn't fulfill human-reviewed repair claim |
| WALRUS SDK's SEAL session built via authenticated Tatum native gRPC | **VERIFIED (INTEGRATION PROBE)** | `web/scripts/seal-session-tatum.mjs`: short-lived signed session via Tatum gRPC and public relayer `/config`; SDK accepted and completed Walrus write | Current MemWal SDK's fallback JSON-RPC endpoint returned HTTP 404. Temporary adapter uses a private SDK `sessionCache` property; pin/test SDK before updating |
| Application recalls a simulation-tested runbook for a different genuine failed transaction | **VERIFIED (LIVE FULL APP)** | One Walrus query via `src/lib/unified-recall.ts`: `POST /api/recall` for `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6` returned 1 simulation runbook, 1 prior real failure observation, 12 hits, `recallDegraded=false` in 5.6s; browser screenshot `evidence/screenshots/simulation-recall-workspace.png` shows runbook and proof link; `/proof/splitcoins` screenshot confirms displayed evidence | It is simulation-tested guidance, **not** a verified human repair of the original historical transaction |

**Do not silently upgrade evidence tiers.** A controlled Mainnet simulation validates a troubleshooting pattern, not a user-approved correction or a successful Mainnet transfer. A genuine reviewer-verified historical incident remains blocked.

## 2026-11-04 — Full in-app Walrus recall recovery and browser proof

- **Root-cause observations:** Windows node fetch intermittently failed with `getaddrinfo EAI_AGAIN relayer.memory.walrus.xyz`; in a separate request Tatum gRPC returned an `RpcError`. DNS subsequently resolved both domains, and Walrus `/health` returned HTTP 200. These were transient network issues, not proof of corrupted memory or invalid credentials.
- **Application inefficiency repaired:** old `POST /api/recall` executed three parallel MemWal semantic queries with maximum totals of 145 hits. `src/lib/unified-recall.ts` now executes **one** signed Walrus query capped at 25 hits, then independently validates/categorizes human-verified cases, genuine prior failure observations, and simulation-tested runbooks.
- **Direct MemWal probe:** `web/scripts/probe-single-recall.mjs` returned **12 memories in 3,772 ms**, with runbook ranked first, 10 actual failed transaction observations and 1 older smoke test. This is a live Mainnet read with local delegate auth; no new write.
- **Live full app:** `POST /api/recall` with real failed digest `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6` returned HTTP 200 in **5.6s**, Tatum failure `InsufficientCoinBalance in command 16`, `splitCoins`, 12 Walrus hits, **1 simulation-runbook**, **1 prior observation**, and `recallDegraded=false`. Runbook contained `/proof/splitcoins` and matching evidence SHA-256 `bb08e026fddaebfb1167484755cd088236cab4ed232966f6b706376e2b9aac0e`.
- **Second genuine positive control:** `XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue` returned one simulation-tested runbook with `recallDegraded=false`.
- **Genuine negative control:** unrelated `MoveAbort` digest `Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp` returned **zero simulation runbooks**, `recallDegraded=false`, across the same 12 Walrus results.
- **Browser evidence:** Headless Chrome rendered real `/workspace?digest=BbRZD...` with visible Tatum error evidence, matching saved runbook, correct warning, and proof link, at `evidence/screenshots/simulation-recall-workspace.png`. Separate `/proof/splitcoins` rendered at `evidence/screenshots/simulation-proof-page.png`.
- **Read-only resilience:** `src/lib/retry-reads.ts` implements bounded retry on transient DNS/network errors for **reads only**; tests `web/scripts/test-retry-reads.mjs` passed (transient recovery, permanent error no-retry, bounded attempts). It is NOT applied to Walrus writes because doing so could duplicate a completed job.

**Still not proven:** any human-reviewed, case-specific fix actually applied to a historical sender's transaction, full public deployment, final demo film or submission. There are 12 Mainnet memories total: 10 legitimate historical failure observations, 1 connection smoke test, 1 controlled simulation-tested runbook; **0 human-verified historical repair memories**.

### Production verification (2026-11-04)
- `pnpm lint` and `pnpm build` both returned exit code 0. Next.js 16.4.4 generated `/`, `/workspace`, `/proof/splitcoins`, and all server APIs.
- Clean `pnpm start --hostname 127.0.0.1 --port 4217` served `/workspace` and `/proof/splitcoins` with HTTP 200.
- Read-only production `POST /api/recall` with `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6` returned HTTP 200, genuine Tatum outcome `failed`, **one** Walrus simulation-tested runbook from **12** hits, `recallDegraded=false`, and link `/proof/splitcoins`; elapsed **7,383 ms**.
- **Status:** production app's Tatum → Walrus → categorized runbook recall is VERIFIED. Historical human-approved repair remains UNVERIFIED.


## 2026-11-05 — Vercel Production secrets + live end-to-end verification

| Claim | Status | Method/source | Limitation |
|---|---|---|---|
| Production Tatum and Walrus secrets are configured securely | VERIFIED (VERCEL CONFIG) | Vercel project casewake, production env listing with decrypt=false: TATUM_API_KEY and MEMWAL_PRIVATE_KEY appear as sensitive, visibility=secret, decrypted=false, no security issues. Values were not fetched. | Both variables target Production only. |
| Latest production deployment is live | VERIFIED (DEPLOYMENT) | dpl_EBnwaqjqjDm4UFhGe9oovHwkKTym, READY, commit 40e93fdf8191ff74da36deb926c870fb89ccec9b, alias https://casewake.vercel.app. | Serverless region iad1. |
| Live Tatum transaction read + Walrus recall | VERIFIED (LIVE PRODUCTION) | Public /api/status: both configured true. POST /api/transaction for BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6 returned outcome failed. POST /api/recall returned 1 simulation runbook, 1 observation, 12 hits, recallDegraded=false. | The runbook is simulation-tested, not a historical repair. |
| Separate matching real failure retrieves same runbook | VERIFIED (LIVE PRODUCTION) | POST /api/recall digest XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue: 1 runbook, recallDegraded=false. | Same simulation-tested limitations apply. |
| Unrelated real MoveAbort is rejected | VERIFIED (LIVE PRODUCTION NEGATIVE CONTROL) | POST /api/recall digest Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp: 0 runbooks, recallDegraded=false. | Does not establish all possible false-positive rates. |
| Public API abuse boundaries | VERIFIED (LIVE PRODUCTION) | Unlisted digest -> HTTP 403; /api/observations -> HTTP 403; /api/remember -> HTTP 403. /api/status says publicDemoMode=true and reviewerWritesEnabled=false. | Human-verified write P0 remains inaccessible in public demo until authenticated reviewer flow is restored. |
| Durable Mainnet inventory | VERIFIED (LIVE PRODUCTION) | GET /api/memories: allStoredMemories=12, complete=true, namespace incident-memory-v1. | 10 observed failures + 1 simulation runbook + 1 smoke test; zero human-verified resolution records. |
| Public judge-facing pages and assets | VERIFIED (LIVE PRODUCTION) | /, /workspace, /proof/splitcoins, /journal/casewake, /images/casewake-live-workspace.png, /images/casewake-simulation-proof.png all HTTP 200. | Blog is an in-product engineering article; external third-party blog publication not done if event requires a separate blog URL. |

Evidence boundary: The full Tatum -> Walrus simulation-tested guidance loop now works on the deployed Vercel production service. The original Product Lock's human-approved historical resolution and later reuse loop remains unproven and must not be described as completed.


## 2026-11-06 — Protected reviewer path implementation (cloud key pending)

- Added a timing-safe WORKSPACE_WRITE_KEY verifier shared by public-mode digest gates. Anonymous visitors remain restricted to the three published real examples; an authorized reviewer can inspect other genuine Sui digests.
- /api/remember and /api/observations require the reviewer key regardless of PUBLIC_DEMO_MODE. The human-verified route still requires verified=true, diagnosis, concrete resolution steps, reviewer identity and HTTPS evidence URL, then independently re-fetches the failed transaction through Tatum before a Walrus write.
- UI exposes the private reviewer key only when the server reports reviewerWritesEnabled. Key is held in React memory, not localStorage. It is passed only as x-workspace-key to same-origin server APIs.
- Local production build: ESLint + Next.js production build + TypeScript passed.
- Local public-mode tests: reviewerWritesEnabled=true with local env present; custom digest without key 403; custom digest with wrong key 403; remember with wrong key 403. No memory write was attempted.
- New production deployment commit dcd555a READY. Vercel WORKSPACE_WRITE_KEY is NOT YET CONFIGURED; public status still reviewerWritesEnabled=false. Unauthenticated remember returns 503 until the secret is added; this is fail-closed.
- Next proof: user adds WORKSPACE_WRITE_KEY as Vercel Encrypted / Production; redeploy; status true; unauthorized request 403; reviewer-authenticated custom digest lookup succeeds; invalid verified=false case returns 400 without writing. Do not test a real write without an independently verified case.


## 2026-11-06 — Reviewer credential configured in Vercel Production

- Vercel project casewake environment listing (decrypt=false) shows WORKSPACE_WRITE_KEY as type=sensitive, visibility=secret, target=production, decrypted=false, and securityIssues=[]. Secret value was not fetched or logged.
- Production deployment dpl_8wM7EBC9zv5MzUECWwEueRsgKCKQ is READY on commit dcd555a5d8892158134a90286f207174baf1bc9e, alias https://casewake.vercel.app.
- Live /api/status: publicDemoMode=true, reviewerWritesEnabled=true, tatumConfigured=true, walrusConfigured=true.
- Anonymous custom transaction lookup: HTTP 403.
- Anonymous /api/remember: HTTP 403.
- Anonymous /api/observations: HTTP 403.
- Public approved sample recall still works: one simulation runbook, recallDegraded=false.
- Positive authenticated reviewer request has NOT yet been exercised; do not mark reviewer authentication fully tested until a correct key is used for a custom digest lookup.
- No memory write was performed during these checks. No human-confirmed historical resolution exists yet.


## 2026-11-06 — DEEPBOOK_REPAYMENT_GUARD

- claim: A full-PTB Tatum Mainnet simulation gate blocks the observed underfunded DeepBook flash-loan route and allows an exact repayment control.
- criticality: CRITICAL
- category: technical | reliability
- status: VERIFIED (simulation; prevention only)
- proof_standard: Reproducible Tatum Sui Mainnet gRPC simulation of original route, negative overdraw control and positive exact-repayment control.
- method: Run web/scripts/prove-deepbook-repayment-guard.mjs from the web directory with local TATUM_API_KEY configured.
- owner: Engineering
- artifacts: evidence/deepbook-repayment-guard-proof.json; evidence/deepbook-repayment-guard-report.md; evidence/refreshed-flashloan-simulation-attempts.json; evidence/flashloan-guard-small-variants.json.
- environment: Tatum Sui Mainnet gRPC; gas mocked; no signature, submission or chain execution.
- observed_at: 2026-11-06.
- limitations: Original three-hop route still fails at command 16 and is not repaired/proven profitable. Per-hop output shortfall is not isolated. A fresh simulation can become stale if pool state changes; rerun immediately before signing. Human approval and Walrus memory write remain pending.
- judge_location: evidence/deepbook-repayment-guard-report.md.

## Operator v0.5.0 critical-claim closure plan — November 6, 2026

Source of truth: PRODUCT.md revision 1, immutable original eight P0 groups; deadline Nov 10, 17:00 UTC. A proof plan is **not** proof. "Deadline" here is the internal target to investigate; a BLOCKED item does not turn PASS on that date.

| Critical claim | Status Nov 6 | Owner | Verification method and exact artifact target | Internal target | Judge surface |
|---|---|---|---|---|---|
| Tatum fetches a genuine failed Mainnet transaction | VERIFIED | Engineering | Live `POST /api/transaction`; evidence/live-recall-proof.json and production source | Nov 7 | /workspace |
| Failure/success/unknown classification | PARTIAL | QA | Distinct live-API outcome cases; `evidence/transaction-outcomes.json` | Nov 7 | /workspace |
| 10+ authentic Mainnet Walrus memories | VERIFIED (12 total; 10 observations) | Proof | Completed job IDs/blob IDs in evidence/observation-write-receipts.json, GET /api/memories | Nov 7 | /workspace memory inventory |
| Authenticated reviewer and denied anonymous writes | VERIFIED (production prior revision) | Security | Unauthorized 403 + authorized custom digest lookup; EVIDENCE.md/release screenshots | Nov 7 | /workspace private reviewer |
| Generic reviewer-reviewed case path | CODED ON DRAFT BRANCH; LIVE UNPROVEN | Engineering + QA | PR #1, TypeScript, synthetic tests/CI, real Tatum success pair from same sender, authorized UI acceptance | Nov 8 | /workspace reviewer editor |
| General case proof cannot be forged by a URL/checkbox | CODED; LIVE UNPROVEN | Proof + Security | Tatum executed success + sender match, honest reviewer causal attestation, strict memory schema; regression tests | Nov 8 | /workspace + repo |
| Historical DeepBook corrected full repayment | BLOCKED | Engineering | Repeatable independent full-PTB simulation, exact original principal/no wallet funding, gas-aware evidence; evidence/ephemeral-route-repair-replay-audit.json records replay FAIL | Nov 8 | /workspace strict three gates |
| Human reviewed a specific engineering fix | BLOCKED | Real human reviewer | Explicit confirmation after independent evidence, not an AI guess or prevention-only runbook; approved-case receipt | Nov 8 | /workspace |
| Completed Walrus verified-case receipt | BLOCKED | Engineering + Proof | Protected POST /api/remember; completed job/blob ID persisted; `evidence/human-verified-case-receipt.json` | Nov 8 | /workspace receipt |
| Distinct matching failure recalls exact verified-case blob | BLOCKED | Proof + QA | Live Tatum second digest, Walrus signed recall, same blob ID; `evidence/verified-case-second-incident.json` | Nov 8 | /workspace match |
| Different failure receives no false recommendation | VERIFIED for simulation runbook; GENERAL CASE PENDING | QA | Real unrelated MoveAbort + synthetic compatibility negatives; `evidence/negative-controls.json` | Nov 8 | /workspace |
| Complete empty/loading/failed/results workspace state matrix | PARTIAL | QA | Browser acceptance at desktop/mobile; `evidence/workspace-state-matrix.md` | Nov 9 | /workspace |
| Original P0s still visible across product | PARTIAL | Product Critic | Updated PRODUCT.md coverage ledger with distinct code/proof per original P0 | Nov 9 | product and repo |
| Brand naming and identity | PASS naming; visual QA partial | Brand/Art Director | BRAND.md naming attack; real rendered favicon/desktop/mobile capture | Nov 9 | landing and workspace |
| Full UI visual design | NOT DONE | Art Director/Design Engineer | DESIGN.md, references, asset and motion specs; real screenshots QA | Nov 9 | live demo |
| Product Hygiene | PARTIAL | Product Hygiene | HYGIENE.md skill/fallback, secret scan and re-run | Nov 9 | repo |
| External engineer utility and track-fit claim | UNPROVEN | Research | External engineer feedback + organizer reply, or label unconfirmed | Nov 9 | README/blog |
| Published blog with learning timeline | PARTIAL | Pitch | Public readable article describing actual observed learning; verify external vs in-app publication requirement | Nov 9 | blog URL |
| Final video is authentic and watchable | NOT DONE | Demo Director | 2–3 minute real UI recording, full playback QA and script concordance | Nov 10 | public MP4 |
| Product/technical/sponsor/30-second judge QA | NOT DONE | Judge | Four-lens independent simulation report, failed claims logged | Nov 10 | SCORECARD.md |
| Final submission is complete | NOT DONE | HQ/QA | Public repo/live app/video/blog/form checks and observed submission receipt | Nov 10 before 17:00 UTC | submission |

**Hard constraints:** A successful simulation of an unrelated route does not prove the original DeepBook correction. A Tatum-successor record is independently corroborated onchain but still relies on a named human reviewer to establish the causal fix. Tests and CI are never represented as a completed real reviewed memory. No Walrus write may be triggered for unverified proof.


## 2026-11-07 — General Casewake workflow restoration and product-shell correction

| Claim | Status | Method/source | Limitation |
|---|---|---|---|
| Generic reviewer-approved case path exists for legitimate non-DeepBook Sui incidents | VERIFIED (CODE + CI + PREVIEW) | Draft PR #1, successor-evidence.ts, remember/route.ts and verify-recall/route.ts; same Tatum-observed sender, matching Move operation, exact explorer link, documented technical change and explicit human causal attestation; GitHub Actions run 42335361421 passed tests/lint/build | No live human-approved case write or exact-blob recurrence has been performed. This is not a verified resolution claim. |
| Product workspace foregrounds the approved general Incident Memory workflow | VERIFIED (PREVIEW HTTP 200) | Commit 5da03e89de0705deb3e51f2ee8c2e9605ea16f90; Vercel Preview dpl_89ZRTrWrJ3UzmVAqQa4gaRh2LJHF; generic CASE MEMORY / PROOF STATUS panel; no Featured DeepBook / three-gate shell and no false route-success copy | Preview has no Tatum/Walrus credentials; visual browser QA and live acceptance remain open. |
| Strict DeepBook acceptance remains separate and honest | VERIFIED (CODE/STATE) | DEEPBOOK_SOURCE_DIGEST, strict route-repair validator and /api/acceptance; original route remains blocked, no prevention-only bypass | This selected evidence case remains incomplete; it is not the product's generic workflow. |
| Latest PR build | VERIFIED (CI) | GitHub Actions run 42335361421 at 5da03e89; install, deterministic incident tests, ESLint and Next production build all passed | PR #1 remains draft and unmerged. |
| Production baseline | VERIFIED (LIVE STATUS) | Production deployment dpl_HrWrFZ2XbQwJCHQyFpq3G83Z4bHa on master 94194282650a217c67adcecf0df559abdbcf713b; /api/status reports Tatum, Walrus and reviewer writes configured, publicDemoMode true | Draft PR code is not yet deployed to Production. |

No new Walrus resolution memory was written in this checkpoint. Do not infer a successful reviewer write from CI, a Preview build, a Tatum read or the existing simulation runbook.
