# Casewake — Hackathon Operator v0.5.0 phase audit

Updated: 2026-11-07  
Project: Tatum × Walrus Total Recall  
Approved thesis: Incident Memory, Product Lock revision 1 (2026-11-03)  
Brand: Casewake (NAME_LOCK PASS)  
Current phase: 13 / BUILD_VERTICAL_SLICE  
Working branch: fix/general-verified-resolution, draft PR #1  
Latest code commit: 5da03e89de0705deb3e51f2ee8c2e9605ea16f90

## Executive decision

The approved product is Casewake, an evidence-backed memory for recurring Sui transaction failures. Its job is to retain an engineer-reviewed, evidence-linked resolution and safely surface it when a compatible failure recurs. It is not a DEX arbitrage product, a flashloan optimizer, a generic explorer or an autonomous repair bot.

The previous technical investigation allowed the DeepBook route to become the centre of the product. That was a product-focus error. The correction is now in draft PR #1: a general reviewer-approved case path has been restored, and the workspace foregrounds chain evidence → human review → Walrus recall. The strict DeepBook three-gate acceptance remains intact as a separate evidence case; it is not a prerequisite for building the general product.

Important distinction: Phase 12 is closed only because every existential technical assumption now has an explicit disposition (PROVEN, BLOCKED or UNCERTAIN). This is not a claim that every technical claim passed or that the full product is complete. The human-reviewed case write and exact-blob recurrence remain blocked.

## Source of truth and current proof

- PRODUCT.md revision 1 is unchanged; its eight grouped P0 capabilities remain authoritative.
- BRAND.md completes the 18-candidate naming attack and locks Casewake for the hackathon; no trademark clearance is claimed.
- EVIDENCE.md contains the claim register and owner/method/artifact/target/judge-surface plan.
- Tatum Mainnet transaction reads are proven. Walrus Mainnet observation writes, simulation-runbook storage and signed recall are proven. The namespace contains 12 memories: ten authentic observations, one simulation runbook and one integration smoke record.
- No human-verified resolution memory exists. No new Walrus resolution write was made in this checkpoint.
- Draft PR #1 restores a generic onchain-successor workflow: same independently observed sender, matching operation, exact explorer evidence, reviewer-documented technical change and explicit human causal attestation. Exact-blob recurrence requires a different compatible failed transaction.
- GitHub Actions run 42335361421 passed deterministic tests, ESLint and production build. Vercel Preview dpl_89ZRTrWrJ3UzmVAqQa4gaRh2LJHF is READY at https://casewake-1840fh0xz-shalyxs-projects.vercel.app. Preview has no sponsor credentials; no live write was attempted.
- Production remains on master commit 94194282650a217c67adcecf0df559abdbcf713b. The draft PR is not merged or promoted.
- The prior proposed pairing of DZrXy3... with G7yGEr... is explicitly rejected: different borrowed assets/routes; same sender and chronology do not establish causality.

## All 35 phases

Status key: PASS = exit evidence present; PARTIAL = real work exists but exit proof is incomplete; BLOCKED = a required core claim is not proven; NOT DONE = no qualifying artifact yet. A PASS for Phase 12 means risk disposition is complete, not that the product is accepted.

| # | Operator phase | Status | Evidence / remaining exit condition |
|---:|---|---|---|
| 1 | INTAKE | PASS | Official Total Recall rules, deadline and required deliverables recorded in HACKATHON.md. |
| 2 | RUBRIC_DECODE | PASS | SCORECARD.md maps Walrus/Tatum 30%, technical 30%, creativity 20%, presentation 20%. |
| 3 | RESEARCH | PASS | DEPENDENCY_ATTACK.md and EVIDENCE.md cover user pain, alternatives and technical risks. |
| 4 | IDEATION | PASS | Ecosystem candidates compared; Incident Memory selected over Indexer Recovery. |
| 5 | HUMAN_IDEA_GATE | PASS | User explicitly selected Incident Memory on 2026-11-03. |
| 6 | VALIDATION | PARTIAL | Track language plausibly supports a workflow agent; external Sui engineer utility and organizer confirmation remain unobserved. |
| 7 | PRODUCT_LOCK | PASS | PRODUCT.md revision 1; eight grouped P0s, non-goals and no-auto-execution constraints retained. |
| 8 | NAME_LOCK | PASS | BRAND.md records 18 candidates across territories, genericity/collision attack, pronunciation and Casewake rationale; no legal clearance claimed. |
| 9 | DEMO_ARCHITECTURE | PASS (PLAN ONLY) | DEMO.md contains a timed 2:35 narrative and evidence/recording plan; no video yet. |
| 10 | EVIDENCE_PLAN | PASS (PLAN ONLY) | EVIDENCE.md assigns critical claims, status, owner, method, artifact target, internal target and judge surface. Proof is separately tracked. |
| 11 | DEPENDENCY_ATTACK | PARTIAL | Tatum and Walrus Mainnet integrations proven; human-reviewed case availability and live general write remain unproven; external track fit uncertain. The eight existing InsufficientCoinBalance candidates are all flashloan/DEX PTBs and are not a representative general-incident sample. |
| 12 | TECHNICAL_DERISK | PASS (DISPOSITION COMPLETE; BLOCKERS RETAINED) | Every existential assumption has a disposition. Tatum/Walrus read, observation and simulation-runbook path proven. Generic reviewer path passes CI/Preview. Human case write/recall BLOCKED; DeepBook full-route gate separately BLOCKED. No claim promoted. |
| 13 | BUILD_VERTICAL_SLICE | PARTIAL — ACTIVE | Authentic Tatum intake, Walrus observations/runbook recall and negative control work. Generic reviewer UI/API restored. Missing live human-approved case → completed blob receipt → distinct compatible failure recalls exact blob. The current eight-candidate error sample is DeFi flashloan-heavy; source a genuinely different developer incident. See PHASE13_ACCEPTANCE_MATRIX.md and evidence/insufficient-coin-balance-sample-audit-2026-11-07.md. |
| 14 | PRODUCT_REVIEW | MODIFY — OPEN | Thesis remains intact and DeepBook focus removed from product shell. Full magic moment still missing; repeat Product Critic after Phase 13 passes. See PRODUCT_REVIEW_2026-11-07.md. |
| 15 | BRAND_KIT | PASS | BRAND.md includes wordmark concept, logo mark, colors, type, voice, vocabulary and usage rules. Rendered 24px/mobile QA belongs to Phase 22. |
| 16 | ART_DIRECTION | PARTIAL | Trace-instrument territory selected; dedicated implementable composition and screen-by-screen art direction still needed. |
| 17 | REFERENCE_BOARD | NOT DONE | No purpose-by-purpose reference synthesis with transferable design decisions. |
| 18 | VISUAL_ASSET_STRATEGY | NOT DONE | No complete asset inventory, priority, placement, fallback and provenance strategy. |
| 19 | MOTION_STORYBOARD | NOT DONE | No motion storyboard or explicit motion-minimal rationale. |
| 20 | DESIGN_LOCK | NOT DONE | DESIGN.md does not exist; design system and page compositions are not locked. |
| 21 | DESIGN_ENGINEERING | PARTIAL | Landing, workspace, proof page and generic progress panel exist; final implementation still needs the design lock. |
| 22 | VISUAL_QA | PARTIAL | Preview HTTP/HTML and responsive CSS checked; no current desktop/mobile rendered screenshot matrix or 24px mark QA. |
| 23 | BUILD_LOOP | PARTIAL — NOT PASSED | General reviewer path restored in code, but no live human-verified case and no completed exact-blob recurrence. Success/unknown and UI state matrices incomplete. |
| 24 | PROOF_ENGINE | PARTIAL | Real Tatum/Walrus observation and runbook proof exists; human-reviewed resolution claim remains blocked. |
| 25 | RED_TEAM | PARTIAL | Anonymous write denial, reviewer auth, synthetic compatibility/tamper tests exist; full live human-case journey and complete P0 abuse matrix remain. |
| 26 | PRODUCT_HYGIENE | PARTIAL | Installed public-project-launch-hygiene skill located; prior HYGIENE.md has stale fallback_used=true and must be rerun on release candidate, including history secret scan. |
| 27 | DEMO_PRODUCTION | PARTIAL | 2:35 script and shot list exist; final MP4 not recorded. |
| 28 | DEMO_QA | NOT DONE | No final video file to watch and inspect end-to-end. |
| 29 | PITCH | PARTIAL | README, SUBMISSION draft and in-app journal exist; final concise pitch and external blog requirement/publication need verification. |
| 30 | JUDGE_SIMULATION | NOT DONE | No four-lens product, technical, sponsor and 30-second judge simulation report. |
| 31 | PRIORITIZED_FIXES | PARTIAL | Blocking issues known; current ordered release backlog and proof closure not complete. |
| 32 | FEATURE_FREEZE | NOT DONE | No approved freeze date or verified freeze gate. |
| 33 | SUBMISSION_AUDIT | PARTIAL | Public repo and production exist; final video, external blog if required, track fit, final package and receipt missing. |
| 34 | READY_TO_SUBMIT | NOT DONE | Submission package and audit incomplete. |
| 35 | SUBMITTED | NOT DONE | No observed submission confirmation/receipt. |

## Phase 13 acceptance — non-negotiable P0 matrix

The eight grouped P0s in PRODUCT.md remain locked. Phase 13 cannot pass until the matrix in PHASE13_ACCEPTANCE_MATRIX.md is satisfied. In particular:

1. Real Tatum transaction intake must distinguish failed, succeeded and unknown outcomes.
2. Walrus recall must classify observations, simulation-tested procedures and human-reviewed cases separately; mismatch/negative control must not suggest a resolution.
3. A real, case-specific proof and named human reviewer must authorize the exact case; no generic checkbox or unrelated same-sender success can substitute.
4. A successful reviewer write must return a completed Walrus Mainnet job and blob ID.
5. A distinct compatible failed transaction must retrieve the exact same blob; a mismatch must not.
6. No signing, submission, funds movement or autonomous repair.
7. Complete workspace states and responsive UI must be tested.
8. Saved count must reflect completed Mainnet writes, not observations mislabeled as fixes.

## Current execution rules

- No more DeepBook route-economics investigation as the default next step. Keep its strict three-gate evidence case blocked and separate; do not weaken or falsely pass it.
- Do not write any human-verified resolution to Walrus until case-specific evidence passes independently and an authorized human explicitly approves it.
- Work on PR #1 and Preview; preserve the local Windows workspace and its untracked diagnostic artifacts. No Production promotion until live acceptance and release checks pass.
- Do not claim full product, demo or submission readiness from CI, screenshots, a preview build, a simulation runbook or an observation receipt.

Next action: continue Phase 13 with the general user workflow and complete P0 acceptance matrix. Source one genuine, non-flashloan Sui incident with case-specific evidence from an engineer/maintainer or public issue. Do not continue mining the current eight-digest flashloan sample. If no legitimate case can be independently supported, stop at the human gate and request an explicit product/submission decision rather than inventing one.

Competition deadline: 2026-11-10 17:00 UTC.
