# Rouse — resolution memory for Sui engineers

Keep an evidence-linked, human-reviewed resolution and recover it when a compatible Sui failure recurs. Rouse reads chain evidence through Tatum and retains reviewed procedures in Walrus Memory. The engineer decides whether to reuse them. Rouse does not sign transactions or execute repairs.

Rouse is the user-locked name. Historical Casewake names in stored records, URLs and evidence retain their original provenance.

## Use Rouse

1. Open the workspace and inspect your Sui Mainnet transaction digest. No reviewer key is needed. Failure, success and unknown outcomes are distinct; a gateway error is not an onchain failure.
2. For a confirmed failure, compare recalled procedures, matching reasons, uncertainty, reviewer, source evidence and the exact Walrus blob.
3. If you have error text instead, open **Reviewed cases** and search an error name, module or procedure. These results are related reading. Inspect your own transaction to check compatibility; a text match does not establish that your incident is resolved.
4. To record a resolution, use **Reviewer access** with the operator-issued key. Choose a reviewed engineering artifact or a corroborated successful follow-up, explain the specific change, and approve both statements. Editing review details requires fresh approval.
5. Accepted storage is pending. Keep the existing attempt and check its status; completion requires a real blob receipt. An uncertain response must not be resubmitted. The receipt stays attached to its source across later inspections and reloads when browser session storage is available. A reviewer can verify a distinct compatible recurrence without another write.

Public app: [casewake.vercel.app](https://casewake.vercel.app). Release status and source revision are recorded in [PROJECT.md](PROJECT.md); local acceptance is separate from public acceptance.

## Run locally

Use the `web` directory in your checkout. Copy `web/.env.example` to `web/.env.local` and supply your server credentials privately. Next.js loads this file; it must remain ignored by Git.

```powershell
cd web
pnpm install --frozen-lockfile
pnpm build --webpack
pnpm start --hostname 127.0.0.1 --port 4242
```

Open [landing](http://127.0.0.1:4242), [workspace](http://127.0.0.1:4242/workspace), or [reviewed cases](http://127.0.0.1:4242/cases). The webpack option is used by the verified Windows build. Use `pnpm dev` for development.

| Variable | Purpose |
|---|---|
| `TATUM_API_KEY` | Server-side Sui Mainnet gRPC reads |
| `MEMWAL_PRIVATE_KEY` | Private delegate key for the operator's Walrus Memory account |
| `MEMWAL_ACCOUNT_ID` | Account matching that delegate |
| `MEMWAL_SERVER_URL` | Mainnet relayer; template supplies the endpoint |
| `MEMWAL_NAMESPACE` | Shared operator namespace; default `incident-memory-v1` |
| `WORKSPACE_WRITE_KEY` | Random private reviewer token; absent means writes are disabled |

Inspection can work with Tatum alone. Recall/discovery needs the configured Walrus account; a new account does not inherit the operator's records. Configuration presence is not proof of connectivity. Missing configuration, unavailable reads and incomplete inventories are displayed explicitly. The library uses bounded retrieval and discloses incomplete coverage.

Sponsor credentials stay on the server. The reviewer token stays in page memory and is not saved with browser receipts. This is one operator-managed shared case space, not a multitenant account service. Recognized credential patterns are rejected before storing; this is not exhaustive data-loss prevention.

## The reviewed example

ShalyX approved one independently tested duplicate-cancellation integration procedure. A prior authenticated cancellation establishes that the identical order was already cancelled; the procedure reconciles local state and stops duplicate retries. The original operator's code change/deployment is unknown. No onchain repair is claimed.

Source: `8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA`. Distinct recurrence: `HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV`. Reviewed Walrus blob: `KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY`.

[Case review](evidence/real-case/REVIEW.md), [human approval](evidence/real-case/human-approval.json), [completed receipt](evidence/real-case/reviewed-memory-receipt.json), [exact-blob recall](evidence/real-case/exact-blob-recall.json).

The last accepted namespace count was 13 completed memories of all types, including one reviewed resolution. Observations and simulation runbooks remain separate tiers and do not enter the reviewed-case library. Fresh counts appear in dated audit evidence; this is not a claim of 13 verified fixes or customer traction.

## Inspect the proof

Start with [the judge proof packet](PROOF.md) and [the current claim registry](EVIDENCE.md). They distinguish the pinned deployed source, immutable reviewed artifact, actual integration reads, controlled tests and blocked requirements. The default repository branch is not the released source snapshot.

## Verify and contribute

From `web`, run `pnpm lint`, `pnpm test` and `pnpm build --webpack`. Tests exercise compatibility, chronology, proof validation, credential rejection, inventory pagination, request timeouts and receipt handling. Browser suites in `web/scripts/phase22-*.mjs` and `phase23-*.mjs` distinguish actual integration reads from labelled controlled storage/failure responses.

From the repository root, `python scripts/verify-design-lock.py` checks the immutable design contract. `python scripts/verify-phase22-qa.py` checks historical acceptance against its reviewed source; later source changes require a scoped successor audit rather than rewriting that record.

Do not run ingestion, publication or memory-writing scripts as setup or a smoke test. Existing evidence already exists. New Mainnet writes require authorized human review and consume quota. Read-only scripts requiring reviewer access load environment credentials without printing them; inspect their scope before running.

## Remaining work

The [operator audit](OPERATOR_PHASE_AUDIT_2026-11-07.md) tracks the current phase. External Sui-engineer utility validation and organizer track-fit confirmation remain open. Final proof registry, red team, product hygiene, demo film, pitch, judge simulation and submission gates remain separate. QA recordings are not the final 2–3 minute submission film. No submission receipt is claimed.
