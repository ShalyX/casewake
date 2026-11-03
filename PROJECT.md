# PROJECT

## Current milestone
HUMAN_IDEA_GATE — expanded ecosystem-idea exploration (no product lock).

## Completed work
- INTAKE: official event page and formal rules verified.
- RUBRIC_DECODE: all four weighted criteria mapped to judge-visible proof.
- RESEARCH: real pain, workarounds, sponsor fit, risks, and opportunity strengths documented.
- IDEATION: weak concepts eliminated; three materially different candidates ranked.

## Active work
2026-11-03: User intentionally PARKED both EchoLedger and Watchline and directed research toward ecosystem-wide problems. Completed exploratory ecosystem research in ECOSYSTEM_RESEARCH.md and ideation in ECOSYSTEM_IDEATION.md. Top exploratory candidates: Incident Memory; Indexer Recovery; Compatibility Desk. Existing personal-product validation remains intact, no merge, no lock. Technical spike remains unproven.

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
No Mainnet memory writes, RPC calls, tests, screenshots, deployment, or user evidence yet.

## Deployment state
Not started.

## Submission state
NOT_STARTED.

## Next recommended action
Discuss ecosystem candidates with user. Recommend Incident Memory and Indexer Recovery for next adversarial comparison (Compatibility Desk fallback), while keeping EchoLedger and Watchline parked. Test Tatum Sui gRPC + Walrus Mainnet write/recall when credentials are available. Before lock, verify B2B developer-ops suitability for the Smart Agents track and acquire authentic incident/metrics proof.

## Evidence register
- HACKATHON.md: official rules/requirements, checked 2026-11-01.
- SCORECARD.md: rubric decode, checked 2026-11-01.
- RESEARCH.md: web evidence + technology opportunity map, checked 2026-11-01.
- IDEATION.md: scored candidates and eliminations, 2026-11-01.
- VALIDATION_1_2.md: deep finalist comparison, sponsor-fit risks, shared derisk plan, 2026-11-01.
- ECOSYSTEM_RESEARCH.md: six sourced ecosystem-level pain areas, competitor coverage, caveats, 2026-11-03.
- ECOSYSTEM_IDEATION.md: five ecosystem product opportunities, eliminations, ranking, demo and kill tests, 2026-11-03.

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
Type: idea selection (expanded, not yet resolved).
Question: Which, if any, ecosystem thesis should receive deeper validation: Incident Memory, Indexer Recovery, or Compatibility Desk? EchoLedger and Watchline remain parked, selectable later.
Recommendation: deepen Incident Memory first; Indexer Recovery second. No product is locked.
Independent research/ideation done; real integration proof requires credentials.

## Freeze time and deadline buffer
To set after product lock and technical spike. Absolute submission deadline: 2026-11-10 17:00 UTC.

## Checkpoint revision and last verified time
Revision 3 — 2026-11-03. Research-based exploration, no live integration claims.
