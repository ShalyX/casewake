# Phase 13 — BUILD_VERTICAL_SLICE acceptance matrix

Product: Casewake / Incident Memory, Product Lock revision 1  
Status: IN PROGRESS — do not mark SLICE_VERIFIED until all P0s have real evidence.  
Active branch: fix/general-verified-resolution  
Rule: one complete, honest user journey; supporting spikes do not substitute for the product workflow.

| # | Locked P0 / acceptance | Test and required evidence | Current status |
|---:|---|---|---|
| 1 | Real Sui digest intake via Tatum with provenance | Live Mainnet digest; show digest, network, source, outcome and actual execution effects | PASS for failed examples; success/unknown branches still need explicit live tests |
| 2 | Failure/success/unknown distinction; no sign or submit | Live failed, successful and unknown/pruned lookup cases; inspect all UI labels and API outcomes | PARTIAL |
| 3 | Deterministic compatibility and evidence tiers | Same network/error fingerprint and known package/version constraints; observed failure ≠ simulation runbook ≠ human-verified case; mismatches must not recommend a fix | PASS for existing observation/runbook positives and MoveAbort negative control; general human case needs live acceptance |
| 4 | Human-reviewed case record | Case-specific diagnosis, exact proof, named reviewer, reviewer key, explicit causal approval; server independently re-fetches source and successor before storage | CODED in PR #1; no genuine approved case accepted yet |
| 5 | Completed Walrus Mainnet write | Only after Gate 4: wait for completed remember job; capture exact blob ID, job ID, owner and namespace; no retry after uncertain write | NOT RUN for a human-verified case; no resolution write authorized |
| 6 | Later recurrence retrieves exact stored case | Different real failed digest; compatible fingerprint/package/version; signed Walrus recall returns the exact same blob ID and an eligible candidate | CODED in PR #1; no human-verified blob exists to test |
| 7 | Negative controls and fail-closed behavior | Unrelated MoveAbort; different fingerprint; different package/version when known; wrong sender; no matching operation; self-match; invalid evidence URL; missing reviewer attestation; unauthorized writes | PARTIAL: existing API/security tests pass; full live human-case matrix remains |
| 8 | Saved count and workspace states | Count only completed Mainnet writes; test empty, missing keys, loading, live, timeout, failed lookup, no precedent, observation, runbook, verified case, write pending, write complete, recurrence pass/fail; desktop and mobile | PARTIAL |

## End-to-end happy path

1. Engineer pastes a real failed Sui digest.
2. Tatum confirms the exact Mainnet execution failure and source evidence.
3. Casewake recalls observations, simulation-tested procedures and human-reviewed cases as separate tiers.
4. Engineer reviews a genuinely case-specific diagnosis and proof; explicitly approves the documented change.
5. Server independently validates evidence, then writes the sanitized case to Walrus Mainnet.
6. UI displays the completed Walrus job and exact blob receipt.
7. A distinct compatible failed transaction is inspected; Casewake recalls the same exact blob and explains the compatibility basis.
8. A mismatching failure returns no confident resolution; a human remains responsible for any action.

## Stop conditions

- No Walrus resolution write if case-specific evidence is mismatched, incomplete, or only a prevention claim for a different failure.
- No human approval inferred from an AI summary, checkbox default, same sender alone, shared generic Move call alone, CI pass, or a Preview build.
- No automatic transaction signing, submission, wallet funding, funds movement or route execution.
- The strict DeepBook three-gate route remains a separate evidence case; it is not a prerequisite for building the general workflow and must not be silently weakened.

## Exit criteria

Phase 13 passes only when all eight P0s have acceptance evidence and one complete general Casewake user journey reaches a completed Walrus receipt and exact-blob recurrence on a different compatible real failure, with a human reviewer explicitly approving the case. Until then the phase remains IN PROGRESS.


## Case-source quality gate

The first general human-reviewed case must not be selected solely because it shares the InsufficientCoinBalance substring. The current eight-digest candidate pool is clustered at checkpoint 341377758 and consists entirely of DeFi flashloan/swap PTBs. Do not use it as representative validation of the broad Sui engineering problem. Source a genuinely different developer incident and require a case-specific diagnosis plus independent proof before any human approval or Walrus write.
