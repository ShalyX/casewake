# Rouse

Rouse helps Sui engineers find an earlier reviewed case when a transaction fails. Search the error, inspect your transaction, and compare the procedure with its evidence before deciding what to reuse.

[Open Rouse](https://tryrouse.vercel.app) · [Browse reviewed cases](https://tryrouse.vercel.app/cases) · [Watch the demo](https://shalyx.github.io/rouse/) · [Read the evidence](PROOF.md)

![Rouse reviewed-case library](docs/images/reviewed-cases.png)

## Use it

1. Inspect your Sui Mainnet transaction digest. No reviewer key is needed. Rouse distinguishes failed, successful and unknown outcomes from unavailable reads.
2. Compare recalled procedures, matching reasons, reviewer, evidence, SDK uncertainty and exact Walrus blob.
3. Search error text, a module or a procedure in **Reviewed cases**. Search results are related reading; inspect your transaction to check compatibility.
4. Recording requires an operator-issued reviewer key, case-specific evidence and explicit human causal review. An accepted storage job stays pending until a completed receipt is returned.
5. After reload, saved receipt metadata requires a protected check of the original job before completion or recurrence can be claimed. Uncertain writes must not be resubmitted.

Tatum provides read-only chain evidence. Walrus Memory retains the reviewed procedure. The engineer decides what to reuse. Rouse does not sign wallet transactions, execute repairs or move funds.

## Run locally

Use Node.js 24 and pnpm 10. Copy `web/.env.example` to `web/.env.local` and supply server credentials privately. The local file is ignored by Git.

```powershell
cd web
pnpm install --frozen-lockfile
pnpm build --webpack
pnpm start --hostname 127.0.0.1 --port 4242
```

Open `http://127.0.0.1:4242`. Use `pnpm dev` for development. The webpack build is the verified production build on Windows and CI.

|Variable|Purpose|
|---|---|
|`TATUM_API_KEY`|Server-side Sui Mainnet gRPC reads|
|`MEMWAL_PRIVATE_KEY`|Private delegate key for the operator's Walrus Memory account|
|`MEMWAL_ACCOUNT_ID`|Account matching that delegate|
|`MEMWAL_SERVER_URL`|Mainnet relayer endpoint supplied in the template|
|`MEMWAL_NAMESPACE`|Shared namespace; defaults to `incident-memory-v1`|
|`WORKSPACE_WRITE_KEY`|Random private reviewer token; absent disables recording|

Inspection can work with Tatum alone. Recall and discovery need the configured Walrus account. A new account does not inherit the public application's records. Configuration presence does not prove connectivity; missing configuration, unavailable reads and incomplete inventories are shown explicitly.

## Verify

From `web`, run `pnpm test`, `pnpm lint` and `pnpm build --webpack`. Tests cover compatibility, chronology, evidence validation, credential rejection, paged inventory, request uncertainty, receipts and discovery.

From the repository root, run `node web/scripts/replay-reviewed-case.mjs` to replay recorded history without network access or writes. Run `node web/scripts/check-public.mjs` for bounded anonymous reads and rejected recording requests. Set `ROUSE_BASE_URL` to check another deployment.

Use the read-only checks above to verify your setup. Creating a Mainnet record consumes quota and requires an authorized reviewer. Sponsor credentials stay on the server; the reviewer token stays in page memory. Each deployment uses one shared case workspace. Recording rejects common credential patterns; reviewers should check case content before publishing.

## The demonstrated case

The demo follows a duplicate DeepBook order cancellation. A reference procedure checks an earlier authenticated cancellation and stops duplicate retries. ShalyX reviewed it, and recorded-history replay tested it against two genuine failed transactions. A distinct failure then recalled the exact reviewed Walrus record. [See the test method and case scope](PROOF.md).

[Case report](evidence/real-case/REVIEW.md) · [Completed receipt](evidence/real-case/reviewed-memory-receipt.json) · [Exact-blob recall](evidence/real-case/exact-blob-recall.json)

The November 9 inventory contains 13 completed memories, including one reviewed resolution. Other records include incident observations and simulation runbooks, which are kept separate from the reviewed-case library.

Rouse was submitted to the Tatum × Walrus Total Recall hackathon. Stored schemas and older evidence retain the former Casewake name so existing records remain verifiable. Historical article screenshots are dated and labelled. See [third-party asset notices](NOTICE.md).
