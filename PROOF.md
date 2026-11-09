# Rouse evidence

Rouse retains an evidence-linked, human-reviewed Sui resolution and recalls it for a compatible failure. These sources distinguish actual integrations, recorded-history replay and controlled tests.

## Try the real case

1. [Browse or search reviewed cases](https://tryrouse.vercel.app/cases). Text matches are related reading, not compatibility verdicts.
2. [Inspect the distinct recurrence](https://tryrouse.vercel.app/workspace?digest=HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV). Read the failure, matching reasons, reviewer, SDK uncertainty and exact Walrus blob.
3. Inspect the [case report](evidence/real-case/REVIEW.md), [reference adapter](web/examples/reconcile-cancel.mjs), recorded transaction responses and [replay result](evidence/real-case/cancel-reconciliation-proof.json).

Source failure: `8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA`.

Distinct recurrence: `HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV`.

Reviewed Walrus blob: `KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY`.

Completed job: `edfdbf0f-931b-464f-a5e7-f009de08498c`, namespace `incident-memory-v1`.

[Review attestation](evidence/real-case/human-approval.json) · [Completed receipt](evidence/real-case/reviewed-memory-receipt.json) · [Recorded exact-blob recall](evidence/real-case/exact-blob-recall.json)

## What this establishes

|Evidence|What it establishes|Limit|
|---|---|---|
|Recorded authenticated Tatum Mainnet responses|Two real failed cancellation retries and their exact earlier successful cancellations|Replay does not fetch new chain data|
|Reference adapter and replay|Reconciliation checks sender, package, pool, manager, asset types, order and cancellation event|Original operator application changes/deployment are unknown|
|Named review and completed Walrus receipt|One approved procedure was stored as a reviewed resolution|Accepted or pending jobs are not completed memories|
|Distinct exact-blob recall|A different compatible failure recalled the reviewed blob|No automatic execution or historical onchain repair|
|Public library and error-text search|Engineers can discover reviewed material before inspecting a digest|Compatibility still needs transaction inspection|
|Unit tests and controlled service responses|Failure, malformed-response, uncertain-write and recovery behavior|Controlled responses are not new Mainnet writes or real storage failures|

The original immutable engineering artifact and its hash are recorded in the stored receipt. Earlier Casewake identifiers retain historical provenance.

## Reproduce

```powershell
node web/scripts/replay-reviewed-case.mjs
node web/scripts/check-public.mjs
```

The offline replay checks four recorded transaction hashes, two positive cases, missing/wrong-order history controls and seven synthetic mutations. It never signs, executes or stores anything. The public checker makes bounded reads and guaranteed anonymous recording rejections; it never submits a valid recording.

## Test context and user feedback

The reviewed procedure was tested by this project against recorded transaction history. We do not know whether the original operator deployed the same procedure. The failed transactions remain part of chain history; the procedure reconciles the application’s order state and stops duplicate retries.

We have not yet collected feedback from Sui engineers outside this project or measured time saved during their investigations.

The November 9 snapshot has 13 completed memories of all types, including one reviewed resolution. The older [coin-split runbook](https://tryrouse.vercel.app/proof/splitcoins) is a read-only simulation with mocked gas and no executed transfer. The separate strict flashloan repair remains unproven and blocked by its existing acceptance rules.

Counts and service availability are dated observations. Refresh before relying on a current value. Public access checks and automated Chromium/Axe checks are bounded tests, not exhaustive penetration testing, data-loss prevention or screen-reader certification.
