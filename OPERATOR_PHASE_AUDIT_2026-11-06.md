# Casewake — Hackathon Operator v0.5.0 phase and product-integrity audit
Audited: 2026-11-06. Scope: Total Recall (Tatum × Walrus), `ShalyX/casewake`, Product Lock revision 1 approved November 3.

## Source of truth and verdict
- Actual controlling thesis: failed Sui digest -> Tatum execution evidence -> eligible memory retrieval / error and version matching -> human-confirmed and proven resolution -> completed Walrus Mainnet blob -> distinct comparable failure gets an evidence-linked, human-reviewable suggested procedure. NO trading app and NO autonomous repair execution.
- User's newer, explicitly chosen three-gate acceptance remains valid as a stricter proof requirement for the selected DeepBook case: (1) full self-funded corrected flashloan simulation, (2) independent verification + human review and Walrus receipt, (3) later `XkAz3...` recall of exact receipt. It is an *evidence case*, not a product thesis replacement.
- Product integrity verdict: **DRIFT in engineering focus AND implementation; BLOCKED in full-product acceptance.** The original thesis remains documented and some read-only workflows survive, but the general human-verified memory write P0 was narrowed into a one-incident-only route-repair gate.
- **Confirmed implementation regression:** `web/src/app/api/remember/route.ts` permits `resolutionKind=route-repair` only for the single `BbRZD...` digest, and `web/src/lib/guard-evidence.ts` unconditionally rejects the alternative prevention-guard flow. `web/src/lib/incidents.ts` also limits decoding of route repairs to this one digest. Hence the protected general incident-memory editor cannot actually store independently proven resolutions for other genuine failures. This is not an acceptable implementation of PRODUCT.md's general human-reviewed case memory P0. Preserve strict DeepBook-specific three-gate proof for the showcase, but restore a **separate general verified-case validation and reviewer-approved write path** with credible, case-specific evidence; no arbitrary URL/checkbox bypass.
- The repo checkpoint `.hackathon/state.json` at revision 12 was stale: it said `BUILD_LOOP`, `technical_risks_cleared=true` and `vertical_slice_complete=true` despite zero human-verified repair memories, and offered the prevention-only approval gate after the user explicitly ruled it out. These are not valid completion claims.
- At present the durable 12 Mainnet memories comprise ten authentic observations, one simulation-tested runbook, and one integration smoke record; **ZERO verified repaired cases**. Recalled observations are not recalled verified resolutions.
- The original full-size Turbos→Bluefin→DeepBook repayment remains unproven. A 1.25 SUI partial-trade replacement passed a single full-principal (65.265188650 SUI) read-only Mainnet simulation, but the exact serialized 3,596-byte transaction failed later at the repayment split, command 19, on Tatum and public Sui endpoints. Net after gas was negative even during the transient pass. Evidence: `evidence/ephemeral-route-repair-replay-audit.json`; **Gate 1 is not accepted, Gates 2–3 remain locked**.

## Every phase — status assessed against required exit evidence
Status: PASS = required phase proof present; PARTIAL = meaningful work but missing exit proof; BLOCKED = required core proof fails; NOT DONE = no qualifying completion.

| # | Operator phase | Status | Evidence and missing exit condition |
|---:|---|---|---|
| 1 | INTAKE | PASS | `HACKATHON.md` event facts, current product and sources |
| 2 | RUBRIC_DECODE | PASS | `SCORECARD.md` maps Walrus/Tatum 30%, technical 30%, creativity 20%, presentation 20% |
| 3 | RESEARCH | PASS | `DEPENDENCY_ATTACK.md`, `EVIDENCE.md` and competing debugger/workaround risks |
| 4 | IDEATION | PASS | Ecosystem finalists and discarded alternatives recorded |
| 5 | HUMAN_IDEA_GATE | PASS | User selected Incident Memory on November 3 |
| 6 | VALIDATION | PARTIAL | MODIFY accepted within thesis; track-fit and outside-engineer utility unconfirmed |
| 7 | PRODUCT_LOCK | PASS | `PRODUCT.md` rev 1, eight grouped P0 features and prohibited reframings |
| 8 | NAME_LOCK | PARTIAL | Casewake chosen, four candidates compared, preliminary collision search; broad adversarial naming check not conclusively recorded |
| 9 | DEMO_ARCHITECTURE | PASS (PLAN ONLY) | `DEMO.md` 2:35 shot structure, sponsor proof and reset plan; recording is later phase |
| 10 | EVIDENCE_PLAN | PARTIAL | `EVIDENCE.md` claim register exists; not every critical claim has owner, artifact, deadline and current proof |
| 11 | DEPENDENCY_ATTACK | PARTIAL | Tatum, Walrus, real digests proved; authentic confirmed repair remains unresolved |
| 12 | TECHNICAL_DERISK | BLOCKED | Existential actual repair + verified recommendation not proven; a narrowed simulation spike does not clear it |
| 13 | BUILD_VERTICAL_SLICE | PARTIAL, NOT PASSED | Tatum→Walrus observation recall works, but approved human resolution→blob→second failure magic moment does not |
| 14 | PRODUCT_REVIEW | FAIL / REOPEN | Earlier product checkpoints exist, but the latest work shifted toward DEX arbitrage and failed to correct focus |
| 15 | BRAND_KIT | PARTIAL | `BRAND.md` provides system and favicon, but final judged visual use not QA-verified |
| 16 | ART_DIRECTION | PARTIAL | Visual territory in `BRAND.md`, no dedicated implementable composition/art direction spec |
| 17 | REFERENCE_BOARD | NOT DONE | No purpose-by-purpose reference synthesis |
| 18 | VISUAL_ASSET_STRATEGY | NOT DONE | Screenshots exist; priority/usage/fallback asset strategy absent |
| 19 | MOTION_STORYBOARD | NOT DONE | No significant-motion specification or declared no-motion rationale |
| 20 | DESIGN_LOCK | NOT DONE | `DESIGN.md` does not exist |
| 21 | DESIGN_ENGINEERING | PARTIAL | Landing, workspace, proof page implemented, but not measured against locked design |
| 22 | VISUAL_QA | PARTIAL | Historical UI captures available; current post-repair desktop/mobile inspection not passed |
| 23 | BUILD_LOOP | BLOCKED | Core generalized verified-resolution write P0 has been replaced by one hardcoded DeepBook-only gate, and that gate is blocked; no approved case/recurrence. Success/unknown lookup and UI state matrix remain partial |
| 24 | PROOF_ENGINE | PARTIAL | Authentic API and Walrus proof exists; critical verified repair/recall claim remains BLOCKED, not passed |
| 25 | RED_TEAM | PARTIAL | Reviewer 403/security guards and regression tests; full user-journey/P0 red team missing |
| 26 | PRODUCT_HYGIENE | PARTIAL | `HYGIENE.md` fallback_used=true; installed canonical skill not invoked; issues/re-run unresolved |
| 27 | DEMO_PRODUCTION | PARTIAL | Timed script exists, final 2–3 minute MP4 absent |
| 28 | DEMO_QA | NOT DONE | No finished video to inspect |
| 29 | PITCH | PARTIAL | `README.md`, `SUBMISSION.md`, published in-app journal; final end-to-end truthful pitch unchecked |
| 30 | JUDGE_SIMULATION | NOT DONE | No four-lens product / technical / sponsor / 30-second score and attack recorded |
| 31 | PRIORITIZED_FIXES | PARTIAL | Blocking issues enumerated; priority fixes not all proven |
| 32 | FEATURE_FREEZE | NOT DONE | State says false; no date or verified gate |
| 33 | SUBMISSION_AUDIT | PARTIAL | Repo and production live; final video, form, fit and receipt missing |
| 34 | READY_TO_SUBMIT | NOT DONE | Package and audit incomplete |
| 35 | SUBMITTED | NOT DONE | No observed submission confirmation |

## Product coverage: what the actual user sees
- VERIFIED: authentic read-only failed-transaction Tatum lookup; honest observation/runbook evidence tier; Walrus Mainnet 10+ confirmed memories and authentic signed recall; separate landing/workspace; reviewer secret protection; independent negative control against unrelated MoveAbort.
- IMPLEMENTED / PARTIAL: candidate compatibility, protected reviewer case editor, completed blob receipt workflow in code, success/unknown and UI error/loading states. No completed verified case proves the full flow.
- REGRESSED: generic verified-case creation now restricted to the single DeepBook source digest, while prevention writes always fail. This blocks use by any other real engineer with a legitimately proven unrelated Sui incident; the narrow demo gate was promoted into the whole product.
- BLOCKED: case-specific successful fix reviewed by real person -> durable verified memory -> second analogous failure recalls exact Walrus receipt and suggests that reviewed procedure.
- NOT ALLOWED: shifting the product into a general arbitrage platform, calling a controlled prevention runbook a historical repair, fabricating reviewer signoff or Mainnet receipts, bypassing the user's strict three-gate requirement.

## Corrective sequence (no automatic user-strategy override)
1. Keep PRODUCT_LOCK rev 1 immutable. Repair the generalized case-specific evidence validation + protected human-reviewed Walrus write path; preserve the stricter DeepBook-only three-gate acceptance for the selected showcase case. The core product cannot reject every other legitimate verified failure.
2. Reconcile the outdated Operator checkpoint and reopen PRODUCT_REVIEW + BUILD_VERTICAL_SLICE. No more `full_product_verified` or `technical_risks_cleared` until actual acceptance.
3. Under the current strict Gate 1, either obtain repeatable independently passing corrected full-route simulation or keep that case blocked. Do not promote ephemeral partial-trade successes, borrowed reserves, or prevention-only evidence to reviewed fixes.
4. Execute the whole actual Casewake reviewer flow **only after proof and human signoff**: real failure diagnosis -> Walrus completed blob ID -> second real distinct matching failure retrieves same blob; verify negative control.
5. Complete unresolved P0 acceptance, then product review, visuals/design lock, visual QA, red team, Product Hygiene, final demo, judge simulation and submission audit. Explicit user approval is required for material scope reduction or replacing the DeepBook case.
6. Favor product value and authentic memory/reuse proof over optimizing profit of an arbitrary DEX route, except insofar as the user's explicit chosen acceptance gate requires that exact demonstration.

Competition: Total Recall; deadline **2026-11-10 17:00 UTC**, 10+ real Walrus Mainnet memories, Tatum RPC, published blog, public GitHub and 2–3 minute video. Source: https://thewalrussessions.wal.app/tatum-total-recall .


## 2026-11-07 addendum — prevent route substitution drift

The Cetus round-trip introduced during the latest technical-dersik attempt is an alternative route experiment, **not the historical route being repaired**. It does not reproduce the original upstream swaps and must never be counted as the selected DeepBook case's Gate 1 proof. Its fresh Tatum replay failed and its quoted economics were negative after the 50-bps handoff reserve and gas.

The selected historical PTB remains the exact path recorded in `evidence/context-BbRZD7YfTiiN.json`: DeepBook flashloan SUI → router `swap_b_a_with_return_` SUI/USDSUI → Bluefin CLMM `pool::swap` USDSUI/USDC → DeepBook `swap_exact_quote_for_base` USDC/SUI → merge returned SUI → split 65.265188650 SUI → return flashloan receipt. The latest changes add a GitHub Actions-only signature/object audit for those exact package calls. It must resolve output tuple order and every coin/balance remainder before any original-hop correction is authored.

Operator state is unchanged: phase 12 TECHNICAL_DERISK BLOCKED, phase 13 BUILD_VERTICAL_SLICE PARTIAL, phase 14 PRODUCT_REVIEW REOPEN. Phases 2 onward must not be claimed complete based on the alternative route, guard tests, or a successful isolated control. Gates 2–3 remain locked. Product thesis stays Incident Memory / Casewake; no DEX trading product substitution.

Execution environment: the user's Windows C: volume was confirmed at zero free bytes. Heavy installs, builds, quote sweeps and replays are moved to GitHub Actions; do not retry local dependency installation or broad disk cleanup.


## 2026-11-07 addendum — exact original-route economics

The live Sui Mainnet quote audit resolved the original three-hop PTB and its coin handoffs. The original `mergeCoins` is correctly wired: destination = DeepBook SUI output (command 12, subresult 0); source = Turbos SUI remainder (command 3, subresult 1). Both Turbos SUI remainder and Bluefin USDSUI remainder were zero at quote time. The original failure is not a missing merge.

Full-principal quote: Turbos 65.265188650 SUI → 56.659720 USDSUI; Bluefin → 56.649623 USDC; DeepBook → 65.000000000 SUI + 0.020470 USDC remainder. Required principal is 65.265188650 SUI, leaving a 0.265188650 SUI shortfall. The residual 0.020470 USDC produced zero SUI in a DeepBook quote. An 8-size reserve sweep (65.265188650 down to 63.5 SUI) found no repayable candidate; the best margin remained -0.265188650 SUI.

Therefore the original route is still economically unsafe. The next derisk is to find a better **SUI→USDSUI** upstream pool/path, while keeping the approved USDSUI→USDC Bluefin and USDC→SUI DeepBook legs intact. The earlier generic Cetus SUI/USDC round trip is a different route and cannot be used as evidence for this incident. No full corrected PTB has passed; Gate 1, human approval, Walrus write and exact-blob recall remain locked.

The original route's actual coin flow is now mapped and the size sweep is run in GitHub Actions, not on the user's full C: drive. Continue all quote scans and simulations remotely.
