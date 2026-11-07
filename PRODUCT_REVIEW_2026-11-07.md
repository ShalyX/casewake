# Product Critic — Casewake review

Date: 2026-11-07  
Operator phase: 14 / PRODUCT_REVIEW (early corrective review; phase exit not yet earned)  
Product lock: Incident Memory revision 1  
Verdict: MODIFY — retain the thesis; complete the human-reviewed case loop before claiming a full product.

## Is this still worth building?

The product thesis remains coherent: Sui engineers and ecosystem support responders repeatedly investigate failed onchain executions; useful diagnosis and remediation knowledge gets scattered across transactions, docs and conversations. Casewake links real Tatum transaction evidence to durable Walrus memory and resurfaces a compatible, human-reviewed precedent later.

The strongest differentiation is not transaction lookup, generic error explanation or persistence alone. It is evidence-tiered, human-approved engineering memory: observed failures, simulation-tested procedures and human-verified historical fixes remain visibly distinct, and a mismatch must not produce a confident recommendation.

## Adversarial assessment

| Test | Verdict | Finding |
|---|---|---|
| Problem reality | MODIFY | Repeated Sui failures are real in the sampled Mainnet evidence, but a sample of failed transactions is not proof that engineers want a separate product. External engineer interviews are missing. |
| User specificity | PASS | Sui dApp/protocol engineers and ecosystem support responders are specific enough for a first product. |
| Product clarity | PASS | The next failure shouldn't start from zero is clear when paired with the evidence-tier explanation. |
| Workflow credibility | MODIFY | Tatum intake, Walrus observation/runbook recall and negative control are real. The human-reviewed case write and exact-blob recurrence remain unproven. |
| Differentiation | MODIFY | Durable reviewed resolution memory is differentiated from explorers/debuggers, but the key human-verified resolution moment is not yet demonstrated. |
| Unnecessary complexity | MODIFY | The DeepBook route-economics investigation had become an implementation distraction. It is now isolated as a separate evidence case, not the product shell. Do not add more route tooling. |
| Technical takeover | PASS after correction | Generic workspace now foregrounds chain evidence → human review → Walrus recall. The previous Featured DeepBook / three-gate panel was removed. |
| Scope creep | PASS | No multi-chain, arbitrage, autonomous repair, signing or funds movement added. |
| Magic moment | BLOCKED | No human-verified resolution memory has been written and recalled for a distinct compatible failure. The simulation-tested runbook is not that claim. |
| Hackathon fit | UNCERTAIN | Smart Agents for Real Life plausibly includes workflow agents that resume memory across sessions; organizer has not confirmed B2B Sui incident-response eligibility. |

## Required modifications

1. Finish the general reviewer workflow using a genuinely case-specific proof; require same-source evidence, exact transaction provenance, explicit reviewer causal attestation and completed Walrus receipt.
2. Prove exact-blob recall for a second distinct compatible failed digest, plus a negative control. Do not use the rejected DZrXy3... / G7yGEr... pairing.
3. Complete live success/unknown transaction outcome tests and the workspace state matrix.
4. Keep the DeepBook strict route gate in the acceptance appendix. It must not dominate the public workspace or delay unrelated product implementation.
5. Complete the design and demo phases only after the user workflow is stable; do not substitute visual polish for the missing product claim.

## What must not change

- Product Lock revision 1 and its eight P0 groups.
- Human approval before any resolution is stored.
- No claim that a simulation repaired a historical transaction.
- No autonomous repair, wallet signing, submission or funds movement.
- Separate evidence tiers and fail-closed mismatch behavior.

## Phase verdict and handoff

MODIFY / Phase 14 remains open. This review is an early corrective check because the previous implementation drifted into the DeepBook route. The product shell is now corrected, but Phase 13 must pass before the formal Product Review phase can close.

Completed: general case path restored in draft PR #1; generic progress panel; latest CI pass; Preview READY.
Remaining: human-reviewed case write + exact-blob recurrence; success/unknown and UI state matrices; external user/organizer validation.
Blocking issues: no genuine human-approved resolution record; no live write/recall acceptance in the PR branch.
Requires operator decision: only if no credible case-specific proof can be obtained before the deadline and the team wants to submit with the human-verified case claim explicitly marked incomplete.
Recommended next action: Phase 13 acceptance matrix; do not resume DeepBook route economics by default.

Environment: ShalyX/casewake, branch fix/general-verified-resolution, commit 5da03e89de0705deb3e51f2ee8c2e9605ea16f90; GitHub Actions run 42335361421 PASS; Vercel Preview dpl_89ZRTrWrJ3UzmVAqQa4gaRh2LJHF READY. Preview secrets are absent; no Walrus write was performed.


## Evidence-source quality correction — 2026-11-07

A bounded command-level review of all eight InsufficientCoinBalance candidates in the current evidence pool found that every candidate is a DeFi flashloan/DEX strategy PTB (DeepBook, Turbos/spot DEX, or AFSUI/USDC/USDY flash swaps), clustered at checkpoint 341377758. This sample is useful for testing route-specific failure handling, but it is not representative evidence of general Sui developer incidents or of the broader Casewake user problem. Do not keep mining this pool for a generic case. A valid next case must come from a different, genuine developer incident with case-specific evidence supplied by an engineer/maintainer or a documented public issue.
