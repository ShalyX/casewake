# PROJECT — Casewake / Incident Memory

## Current milestone
BUILD_VERTICAL_SLICE — authentic onchain-observation and cross-transaction Walrus recall are **VERIFIED**. Human-verified repair/recommendation loop is **NOT VERIFIED** and remains an open high-priority proof gate.

## Selected product / boundaries
- Thesis explicitly selected by user on 2026-11-03: Incident Memory. Final product identity locked as Casewake in BRAND.md on 2026-11-06.
- User/problem/primary loop: PRODUCT.md revision 1; real Sui transaction → human-approved fix → persistent Walrus memory → safe later recommendation, always reviewed by a person.
- EchoLedger, Watchline and Indexer Recovery are parked, not discarded. No feature merge.
- No autonomous repair, blockchain signing or automatic financial action. No fake cases, fake transaction data or unverified "fixed" claims.

## Completed and verified — 2026-11-04
1. Recovered failed npm setup using `pnpm`; installed Next.js 16.4.4, React 19.3, Sui SDK 2.39, native gRPC, MemWal 0.1.12; `pnpm-lock.yaml` generated.
2. Next.js production build and TS compilation passed; app runs locally via `pnpm start --hostname 127.0.0.1 --port 4217`. `GET /workspace` returned HTTP 200. Separate landing and app.
3. Tatum gRPC authentication HTTP 200/gRPC 0; live `POST /api/transaction` returned a true Sui Mainnet `MoveAbort` failed transaction. `web/scripts/discover-failures.mjs` sampled 100 recent executed tx and found 56 failures (24 distinct error strings IN THIS SAMPLE, not network-wide rates). Candidates in `evidence/failed-sui-transaction-candidates.json`.
4. MemWal SDK signed auth, completed Mainnet storage job and later recall proven. One older smoke-test blob `fxqZ53GnDXBT3YR37npywnvxNdJF6Bb27giTaF9iKYA`.
5. `POST /api/observations` (reviewer-key protected) independently re-fetched ten **distinct real failed Sui transactions from Tatum**, then completed ten separate Walrus Mainnet writes; job IDs and blob receipts in `evidence/observation-write-receipts.json`.
6. `GET /api/memories` independently listed 11 stored memories (10 authentic onchain observations + prior smoke), with complete pagination.
7. `POST /api/recall` retrieved matching onchain observations for **three different later genuine failed digests**, while returning ZERO human-verified resolutions. Exact matches and negative self-match checks saved in `evidence/live-recall-proof.json`.
8. Unauthenticated reviewer request rejected 403; authenticated request without human verified checkbox rejected 400. `WORKSPACE_WRITE_KEY` generated privately and kept in ignored `web/.env.local`.
9. Pure deterministic TS safety tests now 10/10 (synthetic fixtures); earlier Python spike 13/13 (synthetic). Production app screenshot `evidence/screenshots/workspace.png` captured on real local host.
10. Web app proof panel distinguishes observed failure precedents from human-reviewed resolutions, shows Mainnet namespace inventory, and hides reviewer keys from git/browser persistent storage.

## Active work / required verification
- Final build and lint QA after last changes (source is written; check new command results before passing).
- Reviewer-approved resolution still **UNPROVEN**: two genuine analogous failure digests exist, and official Sui docs provide generic troubleshooting, but NO demonstrated successful fix and NO human signoff. See `evidence/resolution-verification-queue.md`.
- The required ten Mainnet memories are genuine **observations**, not ten verified repairs. Do not count smoke or observations as human-verified fixes.
- Brand naming and brand kit: PASS. Public repository and Vercel Production deployment: live. Product Hygiene: PARTIAL pending release-candidate rerun. Final demo MP4/QA, external blog publication if required, organizer track-fit confirmation, judge simulation and submission receipt remain open.
- Read-only Sui chain lookup works; no automatic repair, notifications or transfers.

## Source-of-truth / proof artifacts
- `PRODUCT.md` thesis, `HACKATHON.md` rules, `DEMO.md` planned film, `DEPENDENCY_ATTACK.md`.
- `EVIDENCE.md` claim statuses and proof register.
- `evidence/failed-sui-transaction-candidates.json`: real Tatum sample, only onchain execution failures.
- `evidence/observation-write-receipts.json`: 10 authentic Mainnet observation writes, one job and blob ID each.
- `evidence/live-recall-proof.json`: 3 repeat-failure matches plus self-match rejection.
- `evidence/resolution-verification-queue.md`: pending documented `InsufficientCoinBalance` candidate, not a verified fix.
- `web/scripts/discover-failures.mjs`, `ingest-real-observations.py`, `verify-live-recall.py`, `test-incidents.mjs`.
- `evidence/screenshots/workspace.png`: initial local UI capture; additional real-data screenshot recommended.

## Highest-value next move
1. Finish the general Casewake vertical slice: authentic Tatum intake → deterministic Walrus recall → evidence-tiered human review → protected case write → completed blob receipt → distinct compatible failure recalls the exact blob. Do not make the blocked DeepBook route the product workflow.
2. Keep the strict DeepBook three-gate acceptance separate and blocked; do not promote prevention-only proof or the mismatched successor pair.
3. Complete the success/unknown outcome matrix and workspace state matrix; then complete Product Review, design lock, visual QA, red team and the installed Product Hygiene skill.
4. Record and review the real 2–3 minute demo, publish the required external blog if the rules require it, run four-lens judge simulation, and obtain the actual submission receipt. Deadline: 2026-11-10 17:00 UTC.

## Constraints / safeguards
- SDK versions of a failed transaction cannot be inferred from chain evidence; version-scoped fixes require manual confirmation.
- A fuzzy Walrus hit without deterministic exact matching is a related observation, not an eligible fix.
- Walrus owner+namespace isolation does NOT automatically provide multi-tenant access control. Current reviewer-key protection is local MVP, not a production user auth system. Production public deployment needs real roles/rate limits.
- Never leak private API key, delegate key, reviewer secret, or wallet seed. `web/.env.local` is gitignored and was checked.

## Decisions and handoffs
- 2026-11-01: Generic memory bot killed; original personal finalists EchoLedger and Watchline compared.
- 2026-11-03: User directed exploration to ecosystem problems; both personal finalists parked.
- 2026-11-03: Incident Memory selected over Indexer Recovery; PRODUCT_LOCK revision 1.
- 2026-11-04: User instructed five-point execution; 10 genuine onchain observations completed, 3 real cross-transaction recall paths verified, actual repair approval blocked on missing successful-remediation proof.
- Research: sources and public issue context.
- Engineering: build/live Tatum/Walrus observation path passed; reviewed repair gate open.
- Proof: EVIDENCE.md statuses reconciled.
- Demo Director: early architecture only; final recording not made.
- Operator: persist true status; no submission-ready claims.

## State checkpoint
Revision 15, 2026-11-07. Current working branch: fix/general-verified-resolution (draft PR #1); latest verified preview commit 5da03e8.

## 2026-11-04 — Simulation-tested runbook milestone
- Two unsigned, read-only Tatum Sui Mainnet `SimulateTransaction` runs completed with the same controlled splitCoins structure. 10M MIST source coin → request 20M MIST = `InsufficientCoinBalance in command 1`; request 5M MIST = successful simulation. Both used mock gas, executed **no** onchain transfers. Full evidence in `evidence/controlled-splitcoins-simulation.json`; source `web/scripts/simulate-splitcoins-repro.mjs`.
- Distinct Mainnet Walrus memory written for this evidence under status `simulation-tested-not-human-verified`, with blob ID `keORrsffV8gLkXG8smus_plmk1qUnXC2m2Gv9gyBwAw` and successful semantic recall. Source `web/scripts/publish-simulation-runbook.mjs`; receipt `evidence/simulation-runbook-receipt.json`.
- MemWal SDK's SEAL session needed a compatibility adapter: public Sui JSON-RPC fallback returned 404. Signed short-lived SEAL session via our authenticated Tatum native gRPC worked. Refactored app server calls into `web/src/lib/memwal-secure.ts`. It touches version-specific SDK `sessionCache`: pin dependencies and retest before upgrades.
- App code added `simulationRunbooks` as third explicit evidence tier distinct from **onchain observed** and **human verified**. Human-verified historical repairs remain ZERO. Proof page: `/proof/splitcoins`.
- **Status:** production build, actual `POST /api/recall` replay, and screenshot verification are in progress; do not mark app route proven until tests complete. Tatum simulation and Walrus direct SDK memory write+recall are already VERIFIED.
- Highest-value next: replay real failed `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6` through the updated app, verify remembered runbook and proof link, capture screenshot; then pursue genuine human-reviewed resolution and presentation tasks.

## 2026-11-04 — Recovery checkpoint, latest status
- Remote PC reconnect completed. DNS for Walrus and Tatum was intermittently failing; read-only calls now have bounded retries (never apply automatic retries to writes).
- One Walrus semantic search replaces three concurrent requests. Direct SDK single-recall returned 12 memories and simulation-tested runbook in 3.8s. Full app `POST /api/recall` returned 1 runbook + 1 prior observation, `recallDegraded=false`, 5.6s for real digest `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6`. Second matching real digest retrieved runbook; unrelated real `MoveAbort` excluded.
- Browser Chrome proof captured at `evidence/screenshots/simulation-recall-workspace.png` and `evidence/screenshots/simulation-proof-page.png`. Visual QA shows matching runbook with disclaimer and working public proof page.
- Read-only retry safety assertions passed. Final production lint/build and Git commit pending at time of this entry.
- Core app recall blocker **CLEARED**. Honest remaining gates: human-reviewed historical incident resolution, name/brand lock, public deploy, final demo/blog, organizer track clarification, submission.

### Final production verification — 2026-11-04
- **PASS:** clean `pnpm lint` and Next.js production build/TypeScript.
- **PASS:** production `/workspace` and `/proof/splitcoins` HTTP 200.
- **PASS:** real failed transaction `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6` gives 1 saved Walrus simulation-tested runbook, 12 retrieved memories, no degradation, 7.4s production response.
- **PASS:** related second failed digest matches; unrelated MoveAbort yields zero runbook recommendations.
- **PASS:** direct SDK and Chrome UI screenshots show the actual Walrus-backed runbook, caveats, and Tatum simulation proof.
- **PASS:** bounded read-only retry tests; no automatic retry on writes.
- **OPEN:** human reviewer-approved fix for a specific historical transaction, name/brand, public hosting, final demo/blog/submission. Core in-app recall blocker CLEARED.


## 2026-11-05 — Cloud integration verified; resume full-product BUILD_LOOP

Completed: Vercel Production Tatum + Walrus secrets configured securely; deployment READY on 40e93fd; live transaction read, semantic recall, second analogue, negative control, write blocks and public route/assets verified. Mainnet memory inventory = 12 complete. Public field notes article is live.

Product Integrity: current deliverable is an integrated vertical slice, not the complete locked product. The user-approved P0 for engineer-confirmed resolution capture and completed Walrus receipt is present in the original Product Lock but blocked by the public read-only mode. No historical case-specific repair has been independently approved. Do not call this JUDGE_READY or full product.

Current phase: BUILD_LOOP. Next Engineering action: safely restore reviewer-only WORKSPACE_WRITE_KEY flow for public production while preserving anonymous 403s; then capture a genuine human-approved resolution only when an authorized engineer supplies independent evidence, and prove later cross-incident recall. Also acceptance-test succeeded/unknown transaction branches and workspace states.

Presentation: public app/repo/article are live; actual demo video not recorded. Submission fields and organizer track-fit still open. Deadline remains Nov 10 17:00 UTC.


## 2026-11-06 — Restoring the locked human-review P0

The prior public-demo restriction had hidden and blocked the original Product Lock capability to submit a human-confirmed case. This was a safety restriction, not a product thesis change, but it left the public product incomplete.

Engineering restored the reviewer-only path: timing-safe WORKSPACE_WRITE_KEY comparison, private-key input held only in page memory, authorized reviewer custom-digest access, and human verification/evidence gates before Walrus writes. Anonymous public visitors remain limited to three genuine example digests and cannot write.

Local ESLint + Next.js production build + TypeScript pass. Wrong-key and anonymous custom-digest requests are 403 locally. The new production code is deployed READY on commit dcd555a. The cloud WORKSPACE_WRITE_KEY is not configured yet; status reports reviewerWritesEnabled=false and write endpoints fail closed.

Next: user adds this one additional encrypted Vercel secret. Then test the authenticated path with a deliberately invalid verified=false submission (expected 400, no write), plus unauthorized 403. Only after a real engineer-supplied resolution with independent proof may a human-verified memory be written.


## 2026-11-06 — Reviewer secret configured; production protection verified

Vercel Production now has WORKSPACE_WRITE_KEY as an encrypted secret. Deployment dpl_8wM7EBC9zv5MzUECWwEueRsgKCKQ is READY on commit dcd555a. Live status confirms reviewerWritesEnabled=true alongside Tatum and Walrus. Anonymous custom digest, remember and observation calls all return 403; public sample recall remains healthy. No memory write was performed.

The only auth acceptance gap is a positive request using the correct reviewer key. Next, enter the key in the private reviewer field at /workspace and run a custom-digest lookup. Do not submit a resolution until an authorized engineer provides real diagnosis, resolution steps and independent evidence. The original human-confirmed resolution/reuse P0 remains open.


## 2026-11-06 — DeepBook repayment guard proof / BUILD_LOOP checkpoint

Engineering reproduced the original three-hop DeepBook flash-loan failures through Tatum Sui Mainnet simulation after clearing only the expired epoch constraint. Both historical transactions again fail at command 16 with InsufficientCoinBalance. The Bb route still fails when the borrow/repayment amount alone is reduced to 75%, 50%, 25%, 10% and 1%.

A read-only Mainnet guard acceptance test now proves:
- Original three-hop route: BLOCK at command 16.
- Actual DeepBook overdraw control: borrow 0.01 SUI, split 0.02 SUI -> BLOCK at command 1.
- Actual DeepBook exact-repayment control: borrow 0.01 SUI, split and return exactly 0.01 SUI -> ALLOW; all four PTB commands succeed.

The tested prevention guard allows signing only after a fresh full-PTB Tatum simulation succeeds. All tests used mocked gas and no transaction was signed, submitted or executed. See evidence/deepbook-repayment-guard-report.md and evidence/deepbook-repayment-guard-proof.json.

Important boundary: this proves the prevention gate and exact flash-loan repayment control. It does NOT prove the historical three-hop route is profitable or corrected. The final DeepBook swap has min_base_out=0. Non-zero per-hop minimum outputs are follow-up hardening, not part of the verified prevention memory; a successful corrected route has not been demonstrated.

PRODUCT INTEGRITY
- approved_product: Incident Memory / Casewake, Product Lock revision 1.
- current_deliverable: partial product plus a verified technical prevention-guard proof.
- mechanism_proven: Tatum Mainnet detects the failure; full-PTB simulation guard blocks it; exact DeepBook repayment control passes.
- full_user_journey: digest intake -> Tatum evidence -> recall -> human-approved prevention/resolution -> Walrus receipt -> later compatible recall. The human approval, resolution memory, receipt and subsequent human-case recall remain incomplete.
- locked_P0_total: 8 grouped capabilities.
- P0_verified: real transaction lookup, protected reviewer custom lookup, observation memory writes, observed-case recall, simulation runbook recall, anonymous write protection, and prevention-guard simulation proof.
- P0_missing_or_blocked: human approval and Walrus write of a reviewed resolution; later recall of that human-approved case; success/unknown lookup acceptance; full workspace state QA.
- differentiators_retained: evidence-linked human-reviewed resolution memory and safe later reuse.
- new_or_replaced_thesis: NO.
- next_action: user approval of the exact prevention resolution and reviewer label; then write one genuine Mainnet case through Casewake and verify its Walrus receipt and recall on the second matching digest.
- verdict: BLOCKED for FULL_PRODUCT_VERIFIED / JUDGE_READY.

No memory was written in this checkpoint.


## Operator v0.5.0 phase audit — November 6, 2026 (latest checkpoint)

Read the complete phase-by-phase record in [OPERATOR_PHASE_AUDIT_2026-11-06.md](OPERATOR_PHASE_AUDIT_2026-11-06.md). This checkpoint supersedes earlier assertions that TECHNICAL_DERISK and BUILD_VERTICAL_SLICE had passed. A past state flag did not satisfy the actual Operator exit proof.

**Product Integrity: DRIFT (engineering focus), not an authorized thesis change.** The original product remains Incident Memory / Casewake, revision 1: Tatum observes a real failure, an engineer confirms a case-specific resolution, Walrus stores the completed human-verified case with a real blob ID, and a different matching failure retrieves that exact case for a safe human-reviewed recommendation. This is not a DeFi arbitrage/flashloan product. The 8 grouped original P0s remain in PRODUCT.md.

**Actually verified:** Tatum real Sui Mainnet read, Walrus signed observation and simulation-runbook writes/retrieval, 12 completed Mainnet memories (ten authentic failure observations, one test runbook, one integration smoke), real comparable failure positive recall and unrelated MoveAbort negative control, separate landing/workspace/proof pages, protected reviewer endpoints, compiled/deployed web app. These prove mechanisms and partial product behavior, not the full reviewer-verified magic moment.

**Blocking product gap:** ZERO human-verified repairs stored in Walrus and ZERO demonstrated recurrence retrieval of an engineer-reviewed resolved case. The newer user-approved three-gate criterion for the original DeepBook source remains strictly enforced. One 1.25 SUI partial-size trade briefly simulated a full 65.265188650 SUI flashloan repayment, but the same serialized candidate later failed splitCoins at command #19 with insufficient SUI on both Tatum and public Mainnet. Proof in `evidence/ephemeral-route-repair-replay-audit.json`; no human approval or new Walrus verified case was written. This does not prove a durable viable historical route or profitable arbitrage.

**Operator re-entry:** TECHNICAL_DERISK with product integrity and supporting evidence unfinished; BUILD_VERTICAL_SLICE and PRODUCT_REVIEW must be reassessed against the original approval before any BUILD_LOOP completion claim. Downstream NAME_LOCK adversarial review, EVIDENCE_PLAN closure, DESIGN.md/reference/motion/visual QA, installed-skill Product Hygiene execution, demo recording, four-lens judge simulation and final submission audit remain open as noted in the full audit. No prevention-only promotion is authorized; the earlier pending approval question is superseded by the user's explicit hold.

**Next action:** close the strict case-specific simulation proof with repeatable independent results or maintain Gate 1 blocked, then demonstrate the actual Casewake user journey from reviewer-authorized resolution through completed Walrus receipt and exact-blob recurrence. Continue all other missing original P0/product and judge-facing phases without inventing results. Deadline: 2026-11-10 17:00 UTC.

**Audit addendum — confirmed P0 regression:** The current `web/src/app/api/remember/route.ts` only accepts `route-repair` proof for one hardcoded DeepBook digest, and `web/src/lib/guard-evidence.ts` rejects other resolution kinds even after proof parsing. Consequently Casewake cannot store a verified reviewer-approved resolution for an otherwise independently proven unrelated Sui incident. This is a concrete general-product functionality regression. Restore the generic evidence-linked human-reviewed memory write path without weakening the stricter proof rules applicable to the selected DeepBook demo. The corrected audit is in `OPERATOR_PHASE_AUDIT_2026-11-06.md`.

## 2026-11-06 — Operator execution checkpoint / draft PR #1

**Phase discipline:** 35-phase audit in OPERATOR_PHASE_AUDIT_2026-11-06.md remains controlling. Historical phases 1–5, 7 and 9 have existing accepted artifacts; phase 6 remains partial (outside-user/organizer proof); phase 8 naming attack now completed in BRAND.md; phase 10 owner/method/deadline claim plan now completed in EVIDENCE.md; phase 11 dependency attack remains partial; phase 12 TECHNICAL_DERISK is still blocked on real successful correction and later reviewed-memory acceptance. Do not jump to BUILD_VERTICAL_SLICE/FULL_PRODUCT_VERIFIED.

**Product-integrity correction built on isolated branch** `fix/general-verified-resolution` in draft https://github.com/ShalyX/casewake/pull/1:
1. Added general `onchain-successor` resolution kind alongside strict DeepBook `route-repair`.
2. Requires a real, distinct Tatum-confirmed succeeded follow-up from the same observed onchain sender, exact canonical onchain evidence link, named human reviewer and documented technical change; no arbitrary URL/checkbox alone can create a memory.
3. Kept original DeepBook source digest strict; prevention-only proof still cannot be promoted. The selected second DeepBook digest remains reserved.
4. Restored reviewer UI for unrelated genuine Sui incidents; added manually entered distinct later digest + signed Walrus exact-blob recurrence validation.
5. Removed hardcoded DeepBook error language from the general Walrus recall query while retaining deterministic fingerprint/package/version safeguards.
6. Added synthetic compatibility/tamper regression assertions and GitHub CI. First PR CI run passed install, tests, ESLint and Next production build. Current head must be checked again before integration acceptance.

**NOT DONE:** production merge; authorized live general-case acceptance (failed + successful same-sender Tatum pair), actual human signoff, any new verified Walrus write and exact later-case blob recall. Preview deployment READY but private sponsor/reviewer credentials remain Production-only. A BUILD success is not a proof of a working real reviewed resolution.

**Next action:** reconcile current CI result, securely acceptance-test the new general source/successor Tatum checks using a *genuinely related* pair with a human reviewer, preserve the locked DeepBook Gate 1 until a repeatable corrected full principal repayment exists, then create a completed Walrus record and prove eligible exact-blob recall. Resume phase 13 only after phase 12's existential evidence is legitimately closed. No fake reviewer or memory.


## Current Operator checkpoint — 2026-11-07

- Phase 12 TECHNICAL_DERISK is closed as a risk-disposition phase, not as proof that every claim passed. Tatum Mainnet reads and Walrus Mainnet observation/simulation-runbook storage and recall are proven. The general human-review path is implemented in draft PR #1 and passes CI/Preview. A human-reviewed case write and exact-blob recurrence remain blocked until a genuinely case-specific proof and explicit reviewer approval exist.
- Active phase: 13 / BUILD_VERTICAL_SLICE. The generic Casewake workspace now foregrounds chain evidence → human review → Walrus recall. The DeepBook strict repayment acceptance is isolated as a separate evidence case, still blocked; no acceptance rule was weakened.
- Latest PR head: 5da03e89de0705deb3e51f2ee8c2e9605ea16f90; GitHub Actions run 42335361421 passed install, deterministic tests, ESLint and Next production build. Vercel Preview dpl_89ZRTrWrJ3UzmVAqQa4gaRh2LJHF is READY at https://casewake-1840fh0xz-shalyxs-projects.vercel.app. Preview credentials are absent by design; no live reviewer write was attempted.
- Production remains on master commit 94194282650a217c67adcecf0df559abdbcf713b. No Production promotion or Walrus resolution write occurred in this checkpoint.
- The Windows workspace was left untouched; current implementation work is on the GitHub PR branch to avoid mixing the stale local checkpoint and untracked investigation artifacts.

## 2026-11-07 — Phase 13 live read-only acceptance

| Claim | Status | Method/source | Limitation |
|---|---|---|---|
| Live Tatum failed transaction lookup returns execution evidence, chain timestamp and checkpoint | VERIFIED (LIVE MAINNET CONTROL) | Local production build `/api/transaction` for `6NJrsdCPfda8FzRaMEDpGpwWyg1xpD5TDZCDXwV47T4v`; outcome `failed`; `transactionTimestampMs` finite and checkpoint numeric | This fixture is from the DeFi-heavy candidate pool; it is a status/provenance control only, not the representative general developer case |
| Live Tatum successful transaction lookup is distinguished from failure and includes chain timestamp/checkpoint | VERIFIED (LIVE MAINNET CONTROL) | `/api/transaction` for `DmskUFSYixcpEcNgJyyquQH6q8t7fA856Y6rzZuVbBQv`; outcome `succeeded` | Control only; not asserted to be a correction or causal successor |
| Historical unavailable digest is not mislabeled as an onchain failure | RETEST PENDING | Earlier `/api/transaction` returned HTTP 422 `not found`; current branch maps gRPC `NOT_FOUND` to `outcome: unknown` and updates the live acceptance script to assert no Walrus recall | Code-level classifier tests pass; rebuilt local API retest still required |
| Anonymous verified-resolution write is blocked | VERIFIED (LIVE LOCAL API) | `POST /api/remember` without reviewer key returned HTTP 403 | No write attempted |
| Authenticated reviewer without explicit causal approval is blocked | VERIFIED (LIVE LOCAL API) | `POST /api/remember` with reviewer key and `confirmedCausalLink=false` returned HTTP 400 | Request deliberately stopped before successor verification and before Walrus storage; no write attempted |
| Later-successor chronology is enforced in code and persisted-memory validation | VERIFIED (CODE + SYNTHETIC TESTS) | Tatum read mask includes `timestamp` and `checkpoint`; `verifyOnchainSuccessor` requires finite timestamps and strictly increasing checkpoint; `test-route-memory-gate.mjs` rejects equal, earlier and missing checkpoints | No genuine representative case has yet exercised this path end-to-end |
| Corrective branch quality | PARTIAL (LOCAL) | Seven test scripts pass (17 TAP tests plus four assertion-based suites); `pnpm lint` exits 0 | Production build for this updated head is pending GitHub Actions; deterministic fixtures do not prove a human-reviewed resolution |

The repeatable command is `node scripts/verify-phase13-readonly.mjs` from `web/` with the local production server running. It performs real Tatum reads and reviewer rejection checks only. It never writes to Walrus, signs or submits a transaction.

**No human-verified resolution memory was written.** The first general case still requires a genuinely different non-flashloan Sui developer incident, case-specific diagnosis/proof, a Tatum-confirmed later successful transaction, and an authorized human's explicit causal approval. The eight-digest DeFi/flashloan sample is not accepted as representative validation.

## 2026-11-07 — rebuilt live Phase 13 acceptance

| Claim | Status | Method/source | Limitation |
|---|---|---|---|
| Failed Mainnet lookup | PASS | Tatum live read for `6NJrsdCPfda8FzRaMEDpGpwWyg1xpD5TDZCDXwV47T4v`; finite chain timestamp + checkpoint | DeFi-heavy control only, not general-case proof |
| Successful Mainnet lookup | PASS | Tatum live read for `DmskUFSYixcpEcNgJyyquQH6q8t7fA856Y6rzZuVbBQv`; finite chain timestamp + checkpoint | Not asserted to be a correction or causal successor |
| Historical NOT_FOUND mapping | PASS | `3AkKcrSrqPqD8JA2UBgecq3fES6Tm73v4aDHbdSnyUzt` -> `unknown`; subsequent recall returns zero candidates and zero Walrus hits | Unknown is never inferred to be a failed execution |
| Anonymous write and unapproved reviewer | PASS | Live API: 403 anonymous; 400 without causal approval | No Walrus write attempted |
| Static quality | PASS | 7 operator test scripts, 17 TAP + 4 assertion suites; ESLint; Next production build | Does not prove a real human-reviewed memory |
| Phase 13 complete journey | OPEN | No general case write, completed blob receipt or exact-blob recurrence yet | Requires a genuine representative case and explicit human review |

Machine-readable evidence: `evidence/phase13-readonly-acceptance-2026-11-07.json`. The local server was rebuilt/restarted before the read-only retest. No signing, submission or Walrus resolution write occurred.

## 2026-11-07 — Real-case loop research in isolated worktree

- Branch: `codex/real-incident-loop`, isolated under the current chat's `work/casewake-loop`; original dirty checkout and existing verification worktree were preserved.
- Found a concrete two-command duplicate-cancellation incident, distinct from flashloan work. Tatum effects and `OrderCanceled` events prove the target order was already cancelled before each failed retry; a later different-order success is explicitly rejected as a correction of the original order.
- Added a reference integration reconciliation correction and reproducible evidence replay, plus a default-read-only payload/finish runner. No automatic reviewer approval, transaction submission or Walrus write occurred.
- Fixed the overescaped MoveLocation package regex in `tatum.ts`; live reads now supply the correct package ID for both cases.
- Casewake's actual signed Walrus baseline returns 12 hits, zero eligible cases for the selected recurrence. All new source/receipt claims remain explicit; no product acceptance gate was marked complete.
- Scope caveat: the existing plan asks for a non-DeFi case. This DeepBook order-management case remains an optional candidate pending user acceptance and named human causal review. Original operator code deployment is unknown. See `evidence/real-case/REVIEW.md`.
- Next action: present the concrete evidence and precise independent-integration resolution for a user scope decision and human review. If accepted and explicitly approved, publish/use its immutable artifact through the general reviewed-evidence path, capture one completed Walrus receipt, verify exact-blob reuse on the second real failure and reject self/mismatch controls. Otherwise retain this as research and continue non-DeFi sourcing. Do not reinterpret it as the historical flashloan repair.
