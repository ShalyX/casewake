# Duplicate cancellation of an already-cancelled DeepBook order

Two genuine Sui failures retried orders that had already been cancelled. The reviewed integration procedure reconciles each intent against the exact earlier authenticated cancellation and stops duplicate retries. It leaves the incident unresolved when that history cannot be established.

Reviewer: ShalyX, November 7, 2026. Method: integration-test replay against recorded genuine history. Original operator application changes/deployment: **unknown**. No historical onchain repair is claimed.

## Recorded chain evidence

|Role|Digest|Checkpoint|Outcome|
|---|---|---|---|
|First order cancelled|`3QJhtjcFZ5oL7K7Ge4nP5yjPccibmHVfZE29ChtZY8Tx`|342680906|Succeeded|
|First cancellation retried|`8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA`|342680912|Failed|
|Second order cancelled|`CRCdTJpQaMwa2AdhjE61neubu1Jz4v35NH1B7sMA7ULM`|342680920|Succeeded|
|Second cancellation retried|`HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV`|342680926|Failed|

All four recorded responses were read through authenticated Tatum Sui Mainnet gRPC. The JSON files beside this report preserve those responses. Both failures report `big_vector::leaf_remove`, abort code 5, in `pool::cancel_order` at command 1. Each earlier successful cancellation matches the exact cancellation identity, including the 16-byte BCS order ID and `OrderCanceled` event. A shared error string alone is insufficient.

## Reviewed procedure

Reconcile the intent against an earlier successful execution for the same sender, package, pool, balance manager, asset types and order ID. Require the corresponding cancellation event. If confirmed, mark the local order as already cancelled and stop retrying. Otherwise investigate; a later success for a different order does not resolve this intent.

The [reference adapter](../../web/examples/reconcile-cancel.mjs) implements this procedure. Run `node web/scripts/replay-reviewed-case.mjs` from the repository root. The replay resolves both failed retries to their respective earlier success. Missing/wrong-order history and seven synthetic mutations remain unresolved.

## Storage and reuse

The [completed receipt](reviewed-memory-receipt.json) records the approved resolution, original immutable GitHub artifact/hash, reviewer and completed Walrus Mainnet blob. The [recall result](exact-blob-recall.json) records a distinct compatible failure returning that same blob. This is retained reviewed judgment, not execution of a repair.

Exact blob: `KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY`.

The reference adapter was authored and tested for this evidence. It does not establish the original operator's intent, deployment or an external team's measured benefit. The failed executions remain failed onchain.
