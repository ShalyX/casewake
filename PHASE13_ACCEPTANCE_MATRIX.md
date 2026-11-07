# Phase 13 acceptance matrix — reconciled by Phase 14

Updated2026-11-07. Core vertical slice PASS; product review PASS after corrections. These are the original eight grouped P0 requirements, not replacement tests.

| Original P0 group | Verdict | Evidence and limits |
|---|---|---|
| 1. Real read-only Sui lookup with provenance | PASS | Actual Tatum Mainnet outcomes, digest, provider, checkpoint, time and explorer. Transport errors remain lookup errors. |
| 2. Failure / success / unknown; no signing | PASS | Live outcome controls; browser transitions clear stale suggestions, no recall for success/unknown. No execution path added. |
| 3. Human-confirmed case and completed receipt | PASS, bounded | ShalyX-approved integration case has real completed blob. New async/pending/reload/failure UI fixture-tested; protected recovery reads existing real job. No new Mainnet write in this review. |
| 4. Transparent recall and exact/mismatch reasoning | PASS | Real signed recall returns exact approved blob for distinct failure; self/unrelated rejected. Positive rationale, mismatch warnings and unavailable/no-match distinction visible. |
| 5. Count completed real Mainnet memories | PASS | Fresh list: 13 active unique blobs. Tested counter excludes pending/failed/duplicates. Label includes all types, not 13 verified resolutions. |
| 6. Empty / no keys / loading / live / failed / missing / results | PASS, bounded | 26 controlled browser checks, desktop1440/mobile390 inspection and real readback. Functional QA does not equal final design acceptance. |
| 7. Separate landing and workspace routes | PASS | Distinct / and /workspace; source/build/public route checks. Field notes distinguish current case from historical work. |
| 8. Server-only keys and protected writes | PASS, bounded | Actual anonymous write/job403 and approval/secret-pattern400 controls. Reviewer key stays in page memory, absent from saved receipt. Shared operator scope, not multitenancy or exhaustive DLP. |

## Real accepted loop

- Source failure: 8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA
- Distinct recurrence: HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV
- Reviewer: ShalyX, explicit case-specific approval
- Completed Mainnet job: edfdbf0f-931b-464f-a5e7-f009de08498c
- Exact blob: KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY
- Namespace: incident-memory-v1
- Method: reviewed-evidence / integration-test
- Evidence: evidence/real-case/, evidence/production-reviewed-case/, evidence/phase14/

Actual failed/success/unknown controls are read-only. The26 browser checks intercept responses with clearly labelled fixture content; three fixture submissions never reached Walrus. No new Mainnet write was made to exercise delay/failure paths.

External validation, final brand/design, hygiene, demo, judge simulation and submission remain open. This case does not prove representative non-DeFi utility or a final name.
