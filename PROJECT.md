# PROJECT

## Current milestone
HUMAN_IDEA_GATE — ecosystem finalists deepened with adversarial validation (no thesis locked).

## Completed work
- INTAKE: official event page and formal rules verified.
- RUBRIC_DECODE: all four weighted criteria mapped to judge-visible proof.
- RESEARCH: real pain, workarounds, sponsor fit, risks, and opportunity strengths documented.
- IDEATION: weak concepts eliminated; three materially different candidates ranked.

## Active work
2026-11-03: User deliberately PARKED EchoLedger and Watchline and asked to deepen ecosystem finalists. Incident Memory and Indexer Recovery were evaluated adversarially in VALIDATION_ECOSYSTEM_FINALISTS.md. Both received MODIFY verdicts; Incident Memory is the stronger competition candidate, Indexer Recovery contingent on real indexer telemetry. Ran 13 deterministic safety-filter tests with SYNTHETIC fixtures; all passed. No real Tatum gRPC, Walrus Mainnet, or operator metrics are verified; no concept locked.

## Known blockers
- Product thesis is not yet locked; user is comparing two finalists.
- Shared real integration spike is blocked on local credentials: `TATUM_API_KEY`, `MEMWAL_PRIVATE_KEY`, `MEMWAL_ACCOUNT_ID`, and relayer/server URL are not currently present in the environment.
- This does not block product comparison, only proof of the sponsor integrations.

## Technical risks
- Walrus Memory Mainnet remember/recall must work with real credentials/account.
- Tatum Sui RPC must return usable real data for the selected workflow.
- Never store private keys/secrets as memories.

## Design risks
Do not polish before vertical slice. Judge-facing learning effect must be visually obvious.

## Demo risks
If the before/teach/after behavior change is not visible, the strongest award path is lost.

## Evidence gaps
No Mainnet memory writes, no authenticated Tatum RPC calls, no genuine matched pair of failed Sui transaction digests, no connected real indexer metrics, no user validation, no screenshots, deployment, or submission. 13 synthetic-fixture unit tests passed on 2026-11-03; they establish only the deterministic review filters.

## Deployment state
Not started.

## Submission state
NOT_STARTED.

## Next recommended action
Lead with Incident Memory: find two authentic analog failed onchain Sui digests plus an independently confirmed human fix; then prove Tatum Sui gRPC status/effects and MemWal Mainnet remember-job-complete/recall with own account. If impossible, do not fake the demo: compare the conditional Indexer Recovery path only if real metrics are available, or revisit parked EchoLedger/Watchline. Confirm B2B operations fit to Smart Agents track before product lock.

## Evidence register
- HACKATHON.md: official rules/requirements, checked 2026-11-01.
- SCORECARD.md: rubric decode, checked 2026-11-01.
- RESEARCH.md: web evidence + technology opportunity map, checked 2026-11-01.
- IDEATION.md: scored candidates and eliminations, 2026-11-01.
- VALIDATION_1_2.md: deep finalist comparison, sponsor-fit risks, shared derisk plan, 2026-11-01.
- ECOSYSTEM_RESEARCH.md: six sourced ecosystem-level pain areas, competitor coverage, caveats, 2026-11-03.
- ECOSYSTEM_IDEATION.md: five ecosystem product opportunities, eliminations, ranking, demo and kill tests, 2026-11-03.
- VALIDATION_ECOSYSTEM_FINALISTS.md: adversarial finalist analysis, MVP/demo, source corrections, kill gates, 2026-11-03.
- EVIDENCE.md: source-checked vs unproven claim registry, 2026-11-03.
- spikes/ecosystem_spike.py and test_ecosystem_spike.py: 13 passed synthetic-fixture tests, 2026-11-03.

## Decision log and lock revisions
- 2026-11-01: Do not optimize around the disputed third $500 special award until clarified.
- 2026-11-01: Generic memory chatbot eliminated.
- 2026-11-01: EchoLedger recommended; not yet selected.
- 2026-11-01: User narrowed idea gate to EchoLedger + Watchline for deeper validation; Signalbook dropped from active consideration.
- 2026-11-01: After deepening, EchoLedger remains recommended because Watchline overlaps an explicit sponsor example and therefore carries a creativity deduction risk.

## Specialist handoffs
Research: completed; recommended adaptive finance/wallet semantics.
Judge/Rubric: completed; strongest proof is real RPC -> teach -> Mainnet memory -> changed later behavior.
Product Critic/Ideation: completed; EchoLedger 42/45, Watchline 39/45, Signalbook 32/45.

## Pending human gate
Type: final idea selection; NOT resolved. The user chose to deepen both ecosystem finalists, not to lock either.
Question: Once their critical proof gates are attempted, which thesis (Incident Memory, Indexer Recovery, or an earlier parked finalist) should receive PRODUCT_LOCK?
Recommendation: Incident Memory only if authentic failure/resolution pair and sponsor integrations can be proven; otherwise revisit existing alternatives instead of inventing demo evidence.
Independent comparative validation and synthetic deterministic-spike completed.

## Freeze time and deadline buffer
To set after product lock and technical spike. Absolute submission deadline: 2026-11-10 17:00 UTC.

## Checkpoint revision and last verified time
Revision 4 — 2026-11-03. Source-backed comparison + 13 synthetic tests; no live integration claims.
