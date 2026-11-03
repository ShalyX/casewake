# PROJECT — Total Recall / Incident Memory

## Current milestone
PRODUCT_LOCK completed at thesis level. DEPENDENCY_ATTACK and BUILD_VERTICAL_SLICE in progress. No completed, real end-to-end sponsor proof.

## Selected thesis
User explicitly selected Incident Memory on 2026-11-03. PRODUCT.md revision 1 is source of truth; product *brand name* remains unselected. No merge with Indexer Recovery or personal finance candidates.

## Completed
- Intake, rubric decode and ecosystem research/ideation, plus deep competitive validation.
- Human idea gate: Incident Memory chosen on 2026-11-03.
- Locked user/problem/workflow/magic moment/non-goals in PRODUCT.md revision 1.
- Wrote DEMO.md architecture, DEPENDENCY_ATTACK.md, and root README.
- First implementation scaffold written in web/: separate Next landing and /workspace; server-side Tatum gRPC, Walrus memory and protected review routes; explicit configuration/missing-proof states.
- Previous synthetic safety spike: 13/13 Python tests passed (2026-11-03).
- Current TypeScript incident fingerprint/matching/serialization logic: 8/8 synthetic assertions passed using Node 24 (2026-11-03). This is NOT Mainnet integration proof.

## Active work
- Dependency installation on connected Windows PC via npm, which is taking unusually long. The scaffold may not be fully installable/buildable yet; do not call the UI compiled or deployed without test evidence.
- Technical proof needed: Tatum authenticated Sui gRPC, authentic failed digest pair, human-confirmed fix, real Walrus rememberAndWait and recall.
- Naming, design lock, actual visual QA, demo video, blog and submission remain future milestones.

## External blockers
- TATUM_API_KEY not configured in observed Windows process environment.
- MEMWAL_PRIVATE_KEY and MEMWAL_ACCOUNT_ID not configured in observed environment.
- No verified compatible pair of genuine failed Sui transaction digests and real resolved diagnosis.
- No organizer confirmation yet that B2B engineering incidents fit the Smart Agents track.
- Write gateway disabled until WORKSPACE_WRITE_KEY configured.

## Technical risks / caveats
- Tatum official gRPC endpoint uses x-api-key metadata, not old Sui JSON-RPC.
- Walrus remember acceptance is asynchronous; only completed blob_id proves storage.
- Walrus namespace is owner-scoped; shared case catalog requires careful operator-mediated access.
- Sui SDK/client version is not encoded in a chain digest and must be reviewer-supplied. Never infer it from transaction alone.
- Source error/status normalization must be confirmed with live Tatum output, not only assumed from SDK generated types.
- Current reviewer token is a local MVP guard, not a production auth system. Do not publicly enable writes without more security.

## Evidence gaps
No authenticated Tatum call, Walrus Mainnet blob, 10 completed memories, live screenshot review, public deployment, independently validated user demand, verified incident pair, or completed demo. See EVIDENCE.md.

## Product and design risks
- Never become a generic AI error-explainer. The product must reuse verified cases, not merely summarize failures.
- Must distinguish transport errors, onchain failures and successful transactions.
- Nonmatches must be explicitly rejected, and matching only offers review recommendations.
- Name and brand kit deliberately postponed until a collision-checked shortlist exists.
- Visual QA still required after dependency installation; CSS/JSX existing is not proof of UI quality.

## Deployment / submission
Deployment: NOT STARTED. Submission: NOT STARTED. Official deadline 2026-11-10 17:00 UTC.

## Next action
1. Finish dependency installation, run `npm run build`, inspect actual UI and fix errors.
2. Obtain Tatum API key and MemWal Mainnet delegate/account securely; never commit or paste credentials in chat.
3. Fetch real failed digests from Tatum and test Walrus completed write+recall. Capture proof in EVIDENCE.md.
4. Until then, use synthetic tests only for engineering checks, never judge-facing claims.

## Evidence register
- HACKATHON.md, RESEARCH.md, IDEATION.md
- VALIDATION_1_2.md (parked original finalists)
- ECOSYSTEM_RESEARCH.md, ECOSYSTEM_IDEATION.md, VALIDATION_ECOSYSTEM_FINALISTS.md
- PRODUCT.md (locked thesis), DEMO.md, DEPENDENCY_ATTACK.md
- EVIDENCE.md, SCORECARD.md
- spikes/ (previous synthetic tests), web/scripts/test-incidents.mjs (8 synthetic assertions)

## Decision log
- 2026-11-01: Original three ideas assessed, EchoLedger initially recommended.
- 2026-11-01: EchoLedger + Watchline deepened, kept alive.
- 2026-11-03: User parked two personal finalists, requested ecosystem research.
- 2026-11-03: Incident Memory vs Indexer Recovery validated; both MODIFY, Incident Memory recommended.
- 2026-11-03: User explicitly selected Incident Memory; thesis lock revision 1. Product brand is not yet locked.
- 2026-11-03: Never fabricate an incident, Tatum response, Walrus Mainnet write or video.

## Specialist handoffs
Research: evidence-backed ecosystem need; real case pair still missing.
Product Critic: MODIFY inside approved incident-memory thesis; no auto-fix.
Engineering: code scaffold present; deterministic tests pass; actual sponsor integrations blocked.
Demo Director: early architecture specified but no recording or verified demo.
Proof: EVIDENCE.md records gaps; no real integration proof.
HQ: continue build/technical gate; do not advance to product review or submission.

## Checkpoint
Revision 5 — 2026-11-03. Final git SHA to be recorded after implementation commit.
