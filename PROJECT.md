# PROJECT — Total Recall / Incident Memory

## Current milestone
PRODUCT_LOCK completed at thesis level. DEPENDENCY_ATTACK is partially cleared: live Tatum authenticated Mainnet service read and a real Walrus Mainnet write/recall succeeded. The complete incident-resolution vertical slice remains UNPROVEN.

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
- 2026-11-04: Tatum authenticated Mainnet gRPC `LedgerService/GetServiceInfo` returned HTTP 200 / gRPC 0, 118-byte protobuf response. Proof: web/scripts/probe-tatum-grpc.cjs.
- 2026-11-04: Walrus Mainnet relayer health, authenticated recall, one accepted/completed memory job, and exact-marker recall ALL succeeded. Job: c05c5968-9aef-4c6f-af02-fd71100bcb7e; blob: fxqZ53GnDXBT3YR37npywnvxNdJF6Bb27giTaF9iKYA. It is ONLY an explicitly labeled integration-test memory, not a verified case.

## Active work
- Dependency installation on connected Windows PC via npm, which is taking unusually long. The scaffold may not be fully installable/buildable yet; do not call the UI compiled or deployed without test evidence.
- Remaining end-to-end proof: Tatum GetTransaction against a genuine failed digest, authentic comparable failed digest pair, human-confirmed fix, and the APP's Walrus remember/recall route with validated data. The isolated sponsor credential probes already succeeded.
- Naming, design lock, actual visual QA, demo video, blog and submission remain future milestones.

## External blockers
- The Tatum and Walrus secrets are now configured privately in web/.env.local; never copy or log them. Both were verified by live isolated probes on 2026-11-04.
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
Authenticated Tatum service-read and ONE completed Walrus Mainnet smoke memory have been verified. Still missing: actual Tatum failed-transaction lookup, ten verified incident memories, integrated production routes, app build and visual QA, public deployment, independently validated user demand, real incident pair, and completed demo. See EVIDENCE.md.

## Product and design risks
- Never become a generic AI error-explainer. The product must reuse verified cases, not merely summarize failures.
- Must distinguish transport errors, onchain failures and successful transactions.
- Nonmatches must be explicitly rejected, and matching only offers review recommendations.
- Name and brand kit deliberately postponed until a collision-checked shortlist exists.
- Visual QA still required after dependency installation; CSS/JSX existing is not proof of UI quality.

## Deployment / submission
Deployment: NOT STARTED. Submission: NOT STARTED. Official deadline 2026-11-10 17:00 UTC.

## Next action
1. Install the Next.js/SDK dependencies cleanly (initial npm and pnpm attempts were interrupted); run build, inspect the actual UI, and fix type/API errors.
2. Use verified Tatum credentials to query an authentic onchain FAILED transaction (GetTransaction), then find a second comparable genuine failure with independently documented resolution.
3. Run the app's complete reviewer-confirmation → Walrus write → second-case recall loop, not just the successful standalone SDK smoke test.
4. Collect at least 10 distinct completed Mainnet memories with documented provenance. Never pretend the one integration smoke memory represents a real incident.
5. Capture timestamps and proof in EVIDENCE.md; no fabricated demo activity.

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
Engineering: code scaffold present; deterministic tests pass; isolated live Tatum/Walrus credential probes VERIFIED. Integrated product routes and real incident-case workflow still unproven.
Demo Director: early architecture specified but no recording or verified demo.
Proof: EVIDENCE.md now records real authenticated Tatum service read and first Walrus Mainnet smoke blob+recall, with remaining integration gaps.
HQ: continue build/technical gate; do not advance to product review or submission.

## Checkpoint
Revision 6 — 2026-11-04. Previous implementation commit 836331c; new evidence checkpoint to be recorded.
