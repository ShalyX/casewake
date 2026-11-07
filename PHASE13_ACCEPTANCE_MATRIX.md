# Phase 13 — BUILD_VERTICAL_SLICE acceptance matrix

Product: Casewake / Incident Memory, Product Lock revision 1  
Status: IN PROGRESS — do not mark SLICE_VERIFIED until all P0s have real evidence.  
Active branch: fix/general-verified-resolution  
Rule: one complete, honest user journey; supporting spikes do not substitute for the product workflow.

| # | Locked P0 / acceptance | Test and required evidence | Current status |
|---:|---|---|---|
| 1 | Real Sui digest intake via Tatum with provenance | Live Mainnet failed and successful digests; show digest, network, source, outcome, chain timestamp and checkpoint | PASS for live failed/successful reads and provenance; NOT_FOUND now maps to an explicit unknown state; live retest pending |
| 2 | Failure/success/unknown distinction; no sign or submit | Live failed, successful and unavailable/pruned lookups; inspect API and UI outcomes | PARTIAL: failed + succeeded live; NOT_FOUND-to-unknown implemented and unit-tested; live endpoint retest and full UI state matrix remain |
| 3 | Deterministic compatibility and evidence tiers | Same network/error fingerprint and known package/version constraints; observed failure ≠ simulation runbook ≠ human-verified case; mismatches must not recommend a fix | PASS for existing observation/runbook positives and MoveAbort negative control; general human case needs live acceptance |
| 4 | Human-reviewed case record | Case-specific diagnosis, exact proof, named reviewer, reviewer key, explicit causal approval; server independently re-fetches source and later successor before storage | PARTIAL: code restored; live anonymous 403 and no-causal-approval 400 pass; strict later-checkpoint guard tested; no genuine case approved |
| 5 | Completed Walrus Mainnet write | Only after Gate 4: wait for completed remember job; capture exact blob ID, job ID, owner and namespace; no retry after uncertain write | NOT RUN for a human-verified case; no resolution write authorized |
| 6 | Later recurrence retrieves exact stored case | Different real failed digest; compatible fingerprint/package/version; signed Walrus recall returns the exact same blob ID and an eligible candidate | CODED in PR #1; no human-verified blob exists to test |
| 7 | Negative controls and fail-closed behavior | Unrelated MoveAbort; different fingerprint; different package/version when known; wrong sender; no matching operation; self-match; invalid evidence URL; missing reviewer attestation; unauthorized writes | PARTIAL: live 403/400 reviewer gates and synthetic chronology/tamper tests pass; full case-specific live abuse matrix remains |
| 8 | Saved count and workspace states | Count only completed Mainnet writes; test empty, missing keys, loading, live, timeout, failed lookup, no precedent, observation, runbook, verified case, write pending, write complete, recurrence pass/fail; desktop and mobile | PARTIAL: chain timestamp/checkpoint now visible; full desktop/mobile state matrix remains |

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


## 2026-11-07 — Live read-only acceptance update

- scripts/verify-phase13-readonly.mjs passed against the rebuilt local production server. Live Tatum controls distinguish a failed Mainnet transaction and a succeeded Mainnet transaction; both return chain timestamp and checkpoint.
- A historical public issue digest previously returned HTTP 422 `not found`. The current branch maps Tatum gRPC `NOT_FOUND` to `outcome: unknown`; the rebuilt local endpoint retest is pending. Unknown outcomes must not trigger Walrus recall.
- Anonymous POST /api/remember returns 403. Authenticated reviewer request with confirmedCausalLink=false returns 400 before Walrus storage. No Walrus write, signing or submission occurred.
- Successor evidence now requires both Tatum chain timestamps and a strictly later checkpoint. Synthetic tests reject equal/earlier/missing checkpoints and malformed successor evidence.
- Seven test scripts pass (17 TAP tests plus four assertion-based suites); `pnpm lint` exits 0. The production build for this updated head is pending GitHub Actions. These are supporting controls only, not the required representative human-reviewed case.
- The failed/successful transaction fixtures used for status checks are DeFi controls and are explicitly excluded from the general-case quality gate.

## Case-source quality gate

The first general human-reviewed case must not be selected solely because it shares the InsufficientCoinBalance substring. The current eight-digest candidate pool is clustered at checkpoint 341377758 and consists entirely of DeFi flashloan/swap PTBs. Do not use it as representative validation of the broad Sui engineering problem. Source a genuinely different developer incident and require a case-specific diagnosis plus independent proof before any human approval or Walrus write.


## 2026-11-07 — rebuilt live endpoint retest (supersedes pending items above)

- Rebuilt the isolated PR worktree and restarted its local production server before retesting.
- `node scripts/verify-phase13-readonly.mjs` **PASS**:
  - Live Tatum failed transaction returns `outcome=failed` with chain timestamp and checkpoint.
  - Live Tatum successful transaction returns `outcome=succeeded` with chain timestamp and checkpoint.
  - Tatum gRPC `NOT_FOUND` returns `outcome=unknown`.
  - Unknown transaction recall returns zero candidates and `walrusHitsExamined=0`; no Walrus read occurs.
  - Anonymous resolution write returns 403.
  - Authenticated reviewer request without explicit causal approval returns 400 before Walrus storage.
- Operator test suite: 7 scripts, 17 TAP tests plus 4 assertion-based suites — PASS.
- ESLint — PASS. Next.js production build — PASS (exit code 0; all 15 static pages generated).
- Exact machine-readable record: `evidence/phase13-readonly-acceptance-2026-11-07.json`.
- No resolution write, wallet signing or transaction submission occurred.
- This is supporting read-only acceptance only. Phase 13 remains IN PROGRESS because there is no representative non-flashloan, case-specific human-reviewed resolution with a completed Walrus receipt and exact-blob recurrence.

## Product-aligned proof-method correction

Product Lock revision 1 requires a **specific confirmation method and proof link**, followed by affirmative human approval. It does not require every valid fix to have a later same-sender onchain transaction. The current successor-only implementation is therefore too restrictive.

Phase 13 will support two explicit proof methods:
1. **Onchain successor** — Tatum verifies the later successful transaction, same sender, matching operation and chronology; the reviewer attests the causal change.
2. **Reviewed engineering artifact** — a case-specific, independently inspectable test/reproduction/commit/PR or maintainer-resolution artifact is fetched and fingerprinted; the reviewer records the verification method, exact change and explicit causal approval.

Both methods remain human-reviewed. A URL, AI explanation, generic documentation or prevention-only runbook cannot become a verified historical fix. Exact-blob recall against a different compatible failure remains mandatory. The DeepBook route gate remains separate and unchanged.
