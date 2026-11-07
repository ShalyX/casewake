# Phase 13 — BUILD_VERTICAL_SLICE acceptance matrix

Product: Casewake / Incident Memory, Product Lock revision 1  
Status: IN PROGRESS — do not mark SLICE_VERIFIED until all P0s have real evidence.  
Active branch: fix/general-verified-resolution  
Rule: one complete, honest user journey; supporting spikes do not substitute for the product workflow.

| # | Locked P0 / acceptance | Test and required evidence | Current status |
|---:|---|---|---|
| 1 | Real Sui digest intake via Tatum with provenance | Live Mainnet failed and successful digests; show digest, network, source, outcome, chain timestamp and checkpoint | PASS: rebuilt production-mode local app returned live failed and successful Mainnet evidence with timestamps/checkpoints; unavailable/pruned digest maps to unknown without fabricated execution details. |
| 2 | Failure/success/unknown distinction; no sign or submit | Live failed, successful and unavailable/pruned lookups; inspect API and UI outcomes | PASS for API outcome separation and fail-closed behavior; unknown outcome triggers no Walrus recall. UI matrix remains partial for missing-keys, timeout and post-write states. No signing or transaction submission path exists. |
| 3 | Deterministic compatibility and evidence tiers | Same network/error fingerprint and known package/version constraints; observed failure ≠ simulation runbook ≠ human-verified case; mismatches must not recommend a fix | PASS for existing observation/runbook positives and MoveAbort negative control; general human case needs live acceptance |
| 4 | Human-reviewed case record | Case-specific diagnosis, exact proof, named reviewer, reviewer key, explicit causal approval; server re-fetches the Tatum source and validates either (a) a distinct successful onchain successor with same sender, matching operation and later checkpoint, or (b) a merged public GitHub PR / immutable commit with changed-file diff. Reviewer must attest the causal link. | PARTIAL: both proof paths coded and covered by tamper/negative tests; live anonymous 403 and authenticated no-causal-approval 400 pass; no genuine general case has been approved or stored. |
| 5 | Completed Walrus Mainnet write | Only after Gate 4: wait for completed remember job; capture exact blob ID, job ID, owner and namespace; no retry after uncertain write | NOT RUN for a human-verified case; no resolution write authorized |
| 6 | Later recurrence retrieves exact stored case | Different real failed digest; compatible fingerprint/package/version; signed Walrus recall returns the exact same blob ID and an eligible candidate | CODED in PR #1; no human-verified blob exists to test |
| 7 | Negative controls and fail-closed behavior | Unrelated MoveAbort; different fingerprint; different package/version when known; wrong sender; no matching operation; self-match; invalid evidence URL; missing reviewer attestation; unauthorized writes | PARTIAL: 27 automated TAP tests across eight scripts cover tampering, chronology, invalid/unmerged proof, self-match, package/version mismatch and unknown outcomes; live anonymous 403 and authenticated no-causal-approval 400 pass. Full case-specific live abuse matrix remains. |
| 8 | Saved count and workspace states | Count only completed Mainnet writes; test empty, missing keys, loading, live, timeout, failed lookup, no precedent, observation, runbook, verified case, write pending, write complete, recurrence pass/fail; desktop and mobile | PARTIAL: empty and simulation-runbook result states inspected at 1440px desktop and 390px mobile; no horizontal overflow at either route; inventory remains 12 completed Mainnet memories. Missing-keys, timeout, observation, human-write, receipt and exact-recurrence states still require acceptance. |

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


## 2026-11-07 — Live read-only and responsive acceptance update

- `scripts/verify-phase13-readonly.mjs` passed against the rebuilt local production server. Live Tatum controls distinguish failed, succeeded and NOT_FOUND/unknown outcomes; failed/succeeded responses include chain timestamps and checkpoints. Unknown outcomes do not trigger Walrus recall.
- Anonymous `POST /api/remember` returns 403. An authenticated reviewer request with `confirmedCausalLink=false` returns 400 before Walrus storage. No Walrus write, signing or transaction submission occurred.
- The onchain-successor proof route requires Tatum timestamps and a strictly later checkpoint. The separate reviewed-evidence route accepts only a merged public GitHub PR or immutable commit with a server-retrieved changed-file diff. Both require a case-specific human causal attestation; synthetic tests reject unmerged PRs, missing diffs, missing attestations and incomplete provenance.
- All eight `test-*.mjs` scripts pass: 27 TAP tests, zero failures. `pnpm lint` and `pnpm build` both exit 0 on the isolated PR worktree.
- Chrome DevTools Protocol visual checks at an actual 390×844 mobile viewport report `scrollWidth === clientWidth === 390` for both landing and workspace, including a real simulation-runbook result. 1440px desktop captures were also inspected. Fresh screenshots are recorded under `evidence/screenshots/`.
- The live /api/memories inventory remains 12 completed Mainnet memories. No new memory was written during this acceptance pass.
- The current failed/successful controls are DeFi fixtures and are explicitly excluded from the general-case quality gate. Phase 13 remains IN PROGRESS because no representative non-DeFi human-reviewed resolution has completed a Walrus write and exact-blob recurrence.

## Case-source quality gate

The first general human-reviewed case must not be selected solely because it shares the InsufficientCoinBalance substring. The current eight-digest candidate pool is clustered at checkpoint 341377758 and consists entirely of DeFi flashloan/swap PTBs. Do not use it as representative validation of the broad Sui engineering problem. Source a genuinely different developer incident and require a case-specific diagnosis plus independent proof before any human approval or Walrus write.
