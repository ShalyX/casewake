# Real Sui case: an already-cancelled order retried

Status: **human-reviewed memory stored and exact-blob cross-incident recall VERIFIED**. ShalyX explicitly approved this case and its procedure in chat. This is an independently validated reference integration correction, not evidence of a fix deployed by the original operator.

Scope decision: the existing Phase 13 plan asked for a representative **non-DeFi** incident. ShalyX explicitly accepted this DeepBook order-management integration case as the first reviewed case, including the original-operator limitation. This approval applies to this case; it does not establish broader user representativeness. The original flashloan repair remains blocked and separate.

## Product purpose

Casewake should let a Sui engineer recognize a previously diagnosed failure and reuse the resolution with its evidence. This case supplies real transaction history, a concrete diagnosis, a reproducible integration correction and a separate compatible failure. The reference code is supporting evidence, not a new Casewake trading feature.

## Exact evidence

All four transactions were independently read through authenticated Tatum Sui Mainnet gRPC. The raw responses are beside this document. The sender, package, balance manager, pool, asset types and order ID are compared; a shared error message alone is insufficient.

| Role | Digest | Checkpoint | Outcome |
|---|---|---:|---|
| First order actually cancelled | `3QJhtjcFZ5oL7K7Ge4nP5yjPccibmHVfZE29ChtZY8Tx` | 342680906 | succeeded |
| Same order cancellation retried | `8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA` | 342680912 | failed |
| Another order actually cancelled | `CRCdTJpQaMwa2AdhjE61neubu1Jz4v35NH1B7sMA7ULM` | 342680920 | succeeded |
| That second order cancellation retried | `HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV` | 342680926 | failed |

Both failures report `big_vector::leaf_remove`, abort code 5, in `pool::cancel_order` at command 1. They are simple two-command cancellations, with no loan or swap route. For each failed retry, an earlier successful cancellation has the exact same cancellation identity, including the 16-byte BCS order ID. Tatum also returns the earlier `OrderCanceled` event matching its pool, manager, trader and decimal order ID; the reference adapter requires that event.

Explorer links:

- https://suivision.xyz/txblock/3QJhtjcFZ5oL7K7Ge4nP5yjPccibmHVfZE29ChtZY8Tx
- https://suivision.xyz/txblock/8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA
- https://suivision.xyz/txblock/CRCdTJpQaMwa2AdhjE61neubu1Jz4v35NH1B7sMA7ULM
- https://suivision.xyz/txblock/HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV

Official contract guidance: https://www.docs.sui.io/onchain-finance/deepbook/deepbookv3/contract-information/orders

## Resolution to review

On this exact duplicate-cancellation pattern, reconcile the cancellation intent against independently confirmed earlier successful effects for the **same sender, package, pool, balance manager, asset types and order ID**. If that exact earlier cancellation succeeded, mark the local order as already cancelled and do not retry it. Otherwise keep the incident open and investigate. An arbitrary later successful cancellation is not a correction of the failed order.

`web/examples/reconcile-cancel.mjs` implements this independently authored reference correction. `web/scripts/prove-cancel-reconciliation.mjs` replays the four real chain records. It resolves both failed retries to the proper earlier success; a later success for a different order and missing history remain unresolved. Seven synthetic tamper controls are explicitly labelled separately.

This procedure resolves the integration's interpretation and retry behavior. It does **not** change the failed transaction's onchain outcome, resurrect an order, prove the original operator deployed our code, or prove the operator's intent. Do not describe it as a historical smart-contract repair or a successful corrected re-execution of the same cancellation.

## Casewake baseline

The actual application's Tatum reader independently confirmed both failed digests and their matching package/error fingerprint. Its signed Walrus recall examined 12 memories and returned zero eligible cases, zero observed precedents and zero runbooks for this recurrence. See `app-preflight.json`. The new resolution has not been stored.

A live-read check exposed overescaped whitespace matching in Tatum package extraction. The one-line correction now captures the actual MoveLocation package; both live provenance assertions pass.

## End-to-end verification procedure (now completed)

1. Publish the correction and evidence at an immutable public commit; use that commit as the case artifact.
2. A named human reviews this exact procedure and explicitly approves its relevance to the incident. Record it as `reviewed-evidence` / `integration-test`, with the limitations above. Never substitute an unrelated successful transaction under `onchain-successor`.
3. Start the current general Casewake application revision with server credentials. The production baseline does not yet include this general reviewed-evidence path; this work does not release production.
4. Save the reviewed resolution through the protected `/api/remember` route once. Require HTTP 201 and a completed Walrus blob ID; an accepted job is insufficient. On ambiguous timeout, inspect storage before any retry.
5. Call `/api/verify-recall` for `HvDzt...` with the stored blob ID. Require the exact same blob and an eligible human-reviewed case.
6. Self-match must be rejected; an unrelated MoveAbort must not retrieve the resolution as eligible. Capture receipts and update product acceptance only after the checks actually pass.

`web/scripts/finish-cancel-case.mjs` executed these API steps after the explicit approval was recorded in `human-approval.json`. It defaults to showing the review payload and never retries a write automatically. The immutable engineering artifact is commit `fa78ff8a458dd9d61855b43f67ff9fd575fba215`.

Observed result: `/api/remember` returned HTTP 201, completed job `edfdbf0f-931b-464f-a5e7-f009de08498c`, namespace `incident-memory-v1`, blob `KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY`. `/api/verify-recall` returned HTTP 200, `gate3=verified`, `eligible-for-review` and that exact same blob for `HvDzt...`. Self-match returned 400; unrelated MoveAbort returned 409. The live inventory increased from 12 to 13. No other memory write was attempted.

Environment: locally built Casewake at `http://127.0.0.1:4220` using real Tatum Sui Mainnet and Walrus Mainnet. These results do not claim that the public production deployment has been updated.

## Research dispositions

- MystenLabs/sui#28448: current real gas-estimation engineering report; no source digest or successful correction supplied, so unsuitable for immediate chain-linked acceptance.
- MystenLabs/sui#24532: same-shaped transactions with different gas outcomes; maintainer explicitly warns that they can execute different code paths. Not evidence of a correction.
- MystenLabs/sui#22785: historical wallet staking report with a digest and workaround discussion; no independently verified corrected pair established here.
- Fresh general Mainnet scan: 500 transactions; then 89 transactions for the selected cancellation sender. Targeted staking and balance-send scans examined 500 each. These are bounded discovery samples, not estimates of chain-wide failure rates.

## Honest acceptance status

Real incident and exact cause: VERIFIED by finalized history comparison.

Independent reference integration correction: VERIFIED by recorded real-history replay, with separate synthetic negative controls.

Original operator application deployment: UNKNOWN.

Human review: explicitly APPROVED by ShalyX. Completed Walrus write and exact-blob cross-incident reuse: VERIFIED. This case's full API integration loop is complete; this does not mark every product P0 or submission prerequisite complete.
