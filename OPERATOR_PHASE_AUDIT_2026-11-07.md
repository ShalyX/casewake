# Casewake — Hackathon Operator 35-phase audit
Audited: 2026-11-07. Controlling brief: `PRODUCT.md` revision 1. Current checkpoint: `.hackathon/state.json` revision 19, `BUILD_VERTICAL_SLICE`.
**Source of truth:** Incident Memory for Sui dApp/protocol engineers: Tatum-confirmed transaction evidence → compatible Walrus memory → case-specific human-reviewed fix → completed Walrus receipt → exact-blob recall on a distinct compatible failure. No wallet signing, automatic remediation, DEX/arbitrage product pivot, or fabricated approval.
Status: PASS = exit evidence present; PARTIAL = evidence exists but exit condition incomplete; BLOCKED = downstream work cannot be accepted; NOT DONE = no qualifying evidence yet.

| # | Operator phase | Status | Exit evidence / remaining condition |
|---:|---|---|---|
| 1 | INTAKE | PASS | `HACKATHON.md`: official Total Recall rules, dates, sponsor requirements and submission requirements. |
| 2 | RUBRIC_DECODE | PASS | `SCORECARD.md`: Tatum/Walrus 30%, technical quality 30%, creativity 20%, presentation 20%, mapped to visible proof. |
| 3 | RESEARCH | PASS | `EVIDENCE.md`, dependency and competitor notes: Sui incident pain, alternatives, risks and sponsor APIs. |
| 4 | IDEATION | PASS | Ecosystem research/shortlist; alternatives evaluated before the user selected Incident Memory. |
| 5 | HUMAN_IDEA_GATE | PASS | User explicitly selected Incident Memory on 2026-11-03. |
| 6 | VALIDATION | PARTIAL | MODIFY accepted within thesis; Smart Agents for Real Life is plausible, but organizer track-fit confirmation and independent Sui-engineer utility validation are unobserved. |
| 7 | PRODUCT_LOCK | PASS | `PRODUCT.md` revision 1; eight grouped P0s; read-only chain inspection, human-owned causal judgment, no autonomous execution. |
| 8 | NAME_LOCK | PASS | `BRAND.md`: 18 naming candidates/territories, genericity and collision attack; Casewake retained. No legal trademark clearance claimed. |
| 9 | DEMO_ARCHITECTURE | PASS — PLAN ONLY | `DEMO.md`: 2:35 shot list, narration, real digests, reset and proof sequence. No video implied. |
| 10 | EVIDENCE_PLAN | PARTIAL | `EVIDENCE.md` claim register exists; final owner/date/artifact/status reconciliation remains. |
| 11 | DEPENDENCY_ATTACK | PARTIAL | Tatum Mainnet, Walrus Mainnet, Vercel, credentials and read resilience proven; external user utility and organizer track fit remain open. |
| 12 | TECHNICAL_DERISK | PASS — DISPOSITION | Tatum reads, Walrus observations/runbook writes and recall, error classification, auth and failure handling have explicit PROVEN/BLOCKED dispositions. DeepBook route remains separately blocked. |
| 13 | BUILD_VERTICAL_SLICE | IN PROGRESS | `PHASE13_ACCEPTANCE_MATRIX.md`: 8 P0s. Eight test scripts/27 TAP tests, lint/build, live failed/success/unknown controls, reviewer 403/400 and responsive checks pass. No representative human-approved case, resolution blob receipt or exact-blob recurrence yet. |
| 14 | PRODUCT_REVIEW | PARTIAL / HELD | 2026-11-07 product-integrity review restored the general reviewer path and separated DeepBook evidence. Formal close waits for Phase 13 acceptance. |
| 15 | BRAND_KIT | PARTIAL / HELD | `BRAND.md` defines name, descriptor, voice, mark, palette, type and usage; final asset set and small-size/social QA still required. |
| 16 | ART_DIRECTION | DOCUMENTED / NOT YET ACCEPTED | `DESIGN.md` selects Trace Instrument and records product-specific composition; formal phase acceptance follows Phase 14/15. |
| 17 | REFERENCE_BOARD | DOCUMENTED / NOT YET ACCEPTED | `DESIGN.md` Gate C maps Linear, Sentry, Raycast, GitHub PRs and Sui docs to specific borrow/avoid decisions. |
| 18 | VISUAL_ASSET_STRATEGY | DOCUMENTED / NOT YET ACCEPTED | `DESIGN.md` Gate E defines mark, favicon, evidence diagram, screenshots and demo-frame constraints. |
| 19 | MOTION_STORYBOARD | DOCUMENTED / NOT YET ACCEPTED | `DESIGN.md` Gate F defines six evidence-triggered beats, truth conditions and reduced-motion behavior. |
| 20 | DESIGN_LOCK | NOT DONE | Requires final composition, actual product states, screenshot scoring and visual sign-off; no lock claimed. |
| 21 | DESIGN_ENGINEERING | PARTIAL | Landing, workspace, field notes and proof surfaces exist; general reviewer workflow and mobile layout improved; final locked-spec implementation remains. |
| 22 | VISUAL_QA | PARTIAL | 1440px desktop and true 390×844 mobile captures inspected for landing, empty workspace and runbook result; no horizontal overflow. Missing-key, timeout, reviewer-form, write/receipt and recurrence states plus rubric scoring remain. |
| 23 | BUILD_LOOP | BLOCKED | Cannot pass until Phase 13 human-reviewed resolution → completed Walrus receipt → exact-blob recurrence works end to end. |
| 24 | PROOF_ENGINE | PARTIAL | Real Tatum/Walrus observations and simulation runbook proof exist; human-reviewed resolution proof and exact recurrence remain missing. |
| 25 | RED_TEAM | PARTIAL | 27 automated tests, evidence tamper/chronology/mismatch tests and live 403/400 gates pass; full live case-specific abuse matrix remains. |
| 26 | PRODUCT_HYGIENE | NOT DONE | Installed public-project-launch-hygiene skill is located; current end-to-end execution and tracked-history secret scan still required. |
| 27 | DEMO_PRODUCTION | PARTIAL | `DEMO.md` script and shot list exist; final 2–3 minute MP4 not recorded. |
| 28 | DEMO_QA | NOT DONE | No finished MP4 to inspect for truth, legibility, audio, pacing and duration. |
| 29 | PITCH | PARTIAL | `README.md`, `SUBMISSION.md` and published journal exist; final concise pitch not rehearsed/locked. |
| 30 | JUDGE_SIMULATION | NOT DONE | No recorded four-lens product, technical, sponsor and 30-second judge attack. |
| 31 | PRIORITIZED_FIXES | PARTIAL | Product drift and mobile overflow were corrected; remaining P0/P1 fixes are not all verified. |
| 32 | FEATURE_FREEZE | NOT DONE | No freeze date or accepted Phase 13/20/25/26/28 gates. |
| 33 | SUBMISSION_AUDIT | PARTIAL | Public repo, Vercel app and blog exist; external fit, user form fields, final video and submission receipt remain. |
| 34 | READY_TO_SUBMIT | NOT DONE | Cannot pass while mandatory video, human-reviewed memory loop and final audit are incomplete. |
| 35 | SUBMITTED | NOT DONE | No submission action or organizer receipt observed. |

## No-skip execution rule
Phases 1–12 are accepted only to the extent shown above. Phase 13 remains the active gate. Later-phase artifacts are recorded as preparatory evidence, not falsely promoted to PASS; they will be accepted in order after Phase 13 and Phase 14 close. The strict historical DeepBook three-gate experiment is a separate evidence track and is not a prerequisite for building the general Casewake product.

## Current Phase 13 gate
The eight-digest candidate pool was inspected and found to be DeFi flashloan/swap-biased; it is excluded from representative general-case validation. The generic reviewer implementation supports either a Tatum-verified later onchain successor or a server-re-fetched merged GitHub PR/immutable commit diff; both require named human causal approval. No Walrus resolution write was performed. Next: source one representative non-DeFi Sui developer incident with a genuine failed Mainnet digest and case-specific proof, obtain explicit reviewer approval, then verify one completed Walrus receipt and exact-blob recall on a distinct compatible failure.
