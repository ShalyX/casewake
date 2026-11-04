# SCORECARD

## Official rubric source and checked-at time
Formal Event Rules + live event page, checked 2026-11-01.

## Criterion entries

### Walrus and Tatum Integration
weight: 30%
what judges likely mean: both sponsor technologies are essential to the product rather than decorative integrations
strong visible proof: live Tatum Sui RPC data enters the workflow; the user corrects/teaches something; Walrus Memory writes it on Mainnet; a later equivalent event is handled differently because that memory is recalled
weak proof: logo badges, a hidden API call, or generic chat memory
current predicted score: N/A — product not selected
maximum score: 30
missing evidence: selected product, live Mainnet memory writes, reproducible Tatum RPC calls, visible recall effect
risk: highest
highest-value improvement: design the magic moment around behavior changing after remembered user feedback
confidence: high

### Technical Quality
weight: 30%
what judges likely mean: reliable end-to-end implementation, clean code, successful Tatum Sui RPC integration, defensible state/error handling
strong visible proof: real Mainnet RPC response + successful memory write/recall + deterministic handling of pending/failure states + tests/logs
weak proof: mocked blockchain data or screenshots only
current predicted score: N/A
maximum score: 30
missing evidence: vertical slice, tests, logs, public repo
risk: high until technical spike passes
highest-value improvement: prove Tatum Sui RPC and Walrus Mainnet remember/recall before broad UI build
confidence: high

### Creativity
weight: 20%
what judges likely mean: distinctive product insight and an interaction that goes beyond the examples in the brief
strong visible proof: a crisp user problem plus a memory loop that creates a new capability rather than merely persistence
weak proof: generic chatbot, expense tracker, or prediction dashboard with memory bolted on
current predicted score: N/A
maximum score: 20
missing evidence: selected thesis and competitor differentiation
risk: medium
highest-value improvement: choose a product where durable personal interpretation changes future automation
confidence: medium-high

### Presentation
weight: 20%
what judges likely mean: working demo, clear documentation, understandable architecture, polished judge-facing story
strong visible proof: 2–3 minute demo with before/teach/after sequence, visible Mainnet memory proof, public repo, clear README/blog
weak proof: long narration, hidden tech, no visual confirmation of learning
current predicted score: N/A
maximum score: 20
missing evidence: finished product/demo/blog
risk: medium
highest-value improvement: preserve a simple three-beat learning story from product lock onward
confidence: high

## Bonus / special awards
- Best Walrus Memory: targetable; deepest visible learning loop.
- Best Tatum AI Builder: only target if project is genuinely built primarily with ai.tatum.io.
- Third $500 award: unresolved discrepancy between event page and formal rules; do not optimize until clarified.
- Social share bonus: cheap late-stage upside after product proof.

## Evidence freshness and limitations
Rules and event surfaces checked 2026-11-01. No project implementation exists yet. All predicted project scores intentionally left N/A.

## Prioritized actions
1. Select thesis at HUMAN_IDEA_GATE.
2. Validate selected user problem and differentiation.
3. Spike Walrus Mainnet remember/recall + Tatum Sui RPC.
4. Lock a demo where remembered feedback visibly changes later behavior.


## Ecosystem finalist assessment — 2026-11-03 (concept-stage, NOT awarded judge scores)
Official 30/30/20/20 weights above remain unchanged. Because no judged product has been implemented, none of the ecosystem concepts has earned a verified technical/integration score.

| Criterion | Incident Memory | Indexer Recovery | Required visible proof |
|---|---|---|---|
| Walrus + Tatum integration (30%) | UNPROVEN: genuine digest -> memory -> later digest | UNPROVEN: live chain tip + genuine local watermark -> memory -> later recurrence | Authenticated Tatum Sui gRPC, 10+ completed MemWal Mainnet jobs, after-before recall |
| Technical quality (30%) | 13 synthetic-fixture tests shared; live inputs missing | Same; production metrics missing | Reproducible end-to-end path, no false match on mismatch/stale inputs |
| Creativity (20%) | CONDITIONAL: narrow Sui verified resolution exchange vs existing debugger/SRE tools | CONDITIONAL: context-aware versioned Sui pipeline remediation vs ordinary metrics | Evidence of unique workflow and real user benefit |
| Presentation (20%) | Clear narrative, script-only | Clear narrative if metrics are real | Finished 2–3min video, source-visible proof, public working demo |

Concept feasibility recommendation: Incident Memory first; Indexer Recovery only if authentic metrics are accessible. Original EchoLedger and Watchline remain parked. Product Critic verdicts: MODIFY, MODIFY/CONDITIONAL. Details: VALIDATION_ECOSYSTEM_FINALISTS.md and EVIDENCE.md.

## Implementation evidence checkpoint — 2026-11-04 (not a judge score)
- **Walrus + Tatum integration (30% official weight):** VERIFIED: 100 authentic transactions read via Tatum Sui Mainnet gRPC; 10 distinct true failed-transaction observations stored on Walrus Mainnet with completed blob receipts; 11 memories listed incl. 1 smoke. Three genuine later failure digests recalled matching earlier errors. **Human-confirmed repair loop remains unverified.**
- **Technical quality (30%):** VERIFIED: pnpm dependency installation, Next.js build + TypeScript, ESLint, local app HTTP 200, black-box real API calls, protected reviewer 403/400 controls, 10 deterministic TypeScript synthetic assertions and 13 previous Python synthetic tests. Not production-ready shared auth.
- **Creativity (20%):** Thesis differs from generic explorer/debugger through repeated-failure memory; value of engineer-approved resolution remains only a product hypothesis until a verified correction is stored.
- **Presentation (20%):** Real screenshot in `evidence/screenshots/live-recall-workspace.png`; landing and app separated. Final 2–3 minute recording, blog, brand lock and public demo NOT DONE.
- **Hard gate before judging:** Engineer-reviewed, case-specifically successful repair plus second real digest showing remembered verified recommendation. Do not score the app as if this already happened.

Evidence register: `EVIDENCE.md`; source receipts: `evidence/observation-write-receipts.json`; matching proof: `evidence/live-recall-proof.json`.
