# PROJECT

## Current milestone
HUMAN_IDEA_GATE

## Completed work
- INTAKE: official event page and formal rules verified.
- RUBRIC_DECODE: all four weighted criteria mapped to judge-visible proof.
- RESEARCH: real pain, workarounds, sponsor fit, risks, and opportunity strengths documented.
- IDEATION: weak concepts eliminated; three materially different candidates ranked.

## Active work
User narrowed the field to EchoLedger and Watchline and asked to take both further. Deep validation is complete in VALIDATION_1_2.md. Operator recommendation remains EchoLedger, with Watchline retained as the live alternate. Shared existential spike is prepared conceptually: same Tatum transaction normalizer + Walrus structured-memory adapter should test both behaviors before final lock.

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
Run the shared real integration spike as soon as Tatum + Walrus credentials are available, then choose between EchoLedger and Watchline based on recall reliability and judge-visible behavior. If a product decision must be made before the spike, lock EchoLedger.

## Evidence register
- HACKATHON.md: official rules/requirements, checked 2026-11-01.
- SCORECARD.md: rubric decode, checked 2026-11-01.
- RESEARCH.md: web evidence + technology opportunity map, checked 2026-11-01.
- IDEATION.md: scored candidates and eliminations, 2026-11-01.
- VALIDATION_1_2.md: deep finalist comparison, sponsor-fit risks, shared derisk plan, 2026-11-01.

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
Type: idea selection.
Question: Which thesis do we lock after deepening — EchoLedger or Watchline?
Recommendation: EchoLedger.
Independent work completed while gate is open: deep validation and shared integration-spike design. Real integration proof now requires external credentials.

## Freeze time and deadline buffer
To set after product lock and technical spike. Absolute submission deadline: 2026-11-10 17:00 UTC.

## Checkpoint revision and last verified time
Revision 1 — 2026-11-01.
