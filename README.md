# Casewake — evidence-backed Sui engineering memory

An evidence-backed agent for Sui dApp builders: a real failed transaction is observed through Tatum, related past failures are recalled from Walrus Mainnet, and only human-confirmed resolutions can become recommended fixes.

**Casewake is the release-candidate brand.** The underlying Incident Memory thesis was locked on 2026-11-03. Naming collision checks are preliminary, not trademark clearance. Deadline: November 10, 2026, 17:00 UTC.

## First reviewed resolution loop — November 7, 2026

ShalyX explicitly approved the duplicate-cancellation integration case. Casewake recorded one human-reviewed engineering-artifact resolution to Walrus Mainnet and recalled the exact completed blob for a distinct genuine Tatum-confirmed failure. Self-match and unrelated-failure controls were rejected; the namespace now contains 13 memories, including this one reviewed resolution.

Blob: `KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY`. Evidence and scope limits: [case review](evidence/real-case/REVIEW.md), [write receipt](evidence/real-case/reviewed-memory-receipt.json), [exact-blob recall](evidence/real-case/exact-blob-recall.json). The original operator's application deployment remains unknown; this is an independently validated integration reconciliation procedure, not an onchain contract repair.

The public production app now runs revision `35d28f3348b7a409c24daec38e4993aacd89f281`. [Open the reviewed recurrence](https://casewake.vercel.app/workspace?digest=HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV), or click “Recall reviewed resolution” in the workspace. Anonymous signed recall returned the exact existing blob; protected production verification returned `gate3=verified`; self/mismatch and unauthorized-write controls passed. No new memory was written during release verification. See [production acceptance](evidence/production-reviewed-case/acceptance.json).

## Historical verification snapshot — November 4, 2026
- Next.js 16.4.4 installed with pnpm; `pnpm lint` and `pnpm build` last executed during QA; see `PROJECT.md` for latest verified result.
- Real server-side Tatum Sui Mainnet gRPC `GetTransaction` works; 100 recent transactions inspected, 56 failed in that particular sample (NOT overall failure rate).
- Ten **distinct, real onchain failure observations** were independently re-fetched from Tatum and stored by the application to Walrus Memory Mainnet. Receipts saved in `evidence/observation-write-receipts.json`.
- MemWal listMemories confirmed 11 namespace records: the 10 observations plus one earlier connection smoke-test.
- Three real additional failed digests matched previous stored error memories through `POST /api/recall`. See `evidence/live-recall-proof.json`.
- Reviewer auth and verification gates tested: unauthorized 403, unverified reviewer submission 400.
- **ZERO genuine human-verified fixes have been confirmed or written.** Onchain failure observations are not fixes.

## Launch locally
```powershell
cd C:\Users\USER\Documents\Codex\2026-11-01\total-recall\web
pnpm install --frozen-lockfile
pnpm build
pnpm start --hostname 127.0.0.1 --port 4217
```

Open http://127.0.0.1:4217 for landing and http://127.0.0.1:4217/workspace for the app.

To experience the genuine repeat-failure recall, use:

http://127.0.0.1:4217/workspace?digest=5sc7kDbnaEASo8vBZnrM3j2ZauutQ96CXoNicM9E841U

This digest retrieves a previous observed onchain failure. The UI correctly says **resolution unverified**. It does not fake a fix.

## Server-only secrets
`web/.env.local` holds `TATUM_API_KEY`, `MEMWAL_PRIVATE_KEY`, `MEMWAL_ACCOUNT_ID`, relayer URL, namespace and a local randomly generated `WORKSPACE_WRITE_KEY`. The file is Git-ignored; never commit it, print keys, or paste them in chat. `web/.env.example` contains placeholders only.

For public deployment, upgrade the single reviewer key to real role-based auth and add rate limits and audit logging; do not expose this prototype as a production multi-tenant system.

## Product workflow
1. Enter a genuine Sui Mainnet transaction digest; the server fetches its effects via authenticated Tatum gRPC.
2. For a failed execution, Walrus semantic recall searches previous incident memories.
3. The app filters by deterministic error fingerprint, matching original error detail and excludes same-digest matches.
4. Previously observed failures are shown as **related onchain precedents, no confirmed fix**.
5. An authorized human reviewer with actual case-specific evidence can submit a diagnosed and confirmed procedure. The Walrus SDK confirms a completed Mainnet blob ID before counting it. No such reviewer-confirmed case has been recorded.
6. A later matching incident may show the reviewed procedure for human approval; the app does not automatically execute a fix.

## Tests and evidence
- `node --experimental-strip-types scripts/test-incidents.mjs` — 10 deterministic safety assertions using synthetic fixtures.
- `pnpm lint` and `pnpm build` — project compile checks.
- `python scripts/verify-live-recall.py` — 3 live Tatum→Walrus matched precedent cases plus negative same-digest control.
- `python scripts/ingest-real-observations.py` — idempotent (against local receipts) import of the chosen ten real onchain failure observations. Do **not** run again unnecessarily: Mainnet writes cost quota and duplicates are possible if a write completed without a returned local receipt.
- `evidence/failed-sui-transaction-candidates.json` — 100-trx sample, 56 actual failures.
- `evidence/observation-write-receipts.json` — ten distinct Mainnet receipt/blob records.
- `evidence/live-recall-proof.json` — three real repeated failure matches.
- `evidence/screenshots/live-recall-workspace.png` — captured actual rendered UI with genuine transaction and recalled precedent.
- `evidence/resolution-verification-queue.md` — source-documented InsufficientCoinBalance guidance that **cannot yet be described as a verified repair**.
- `EVIDENCE.md` — all material claim statuses.

## Current open blocker (do not fudge)
A confirmed successful engineering repair. The best first candidate is `InsufficientCoinBalance` with official Sui troubleshooting guidance. To submit it as *verified*, a developer must demonstrate a case-specific fix (successful corrected operation or independently documented engineering resolution), cite evidence, and intentionally approve via the protected reviewer form. Only then is it honest to present the later memory recall as a verified-resolution recommendation.

## Submission prerequisites not yet completed
Final product name/brand, UX/polish QA, real user validation, multi-tenant/shared access controls for public users, public deploy, public repository, blog, 2–3 min demo video, organizer track-fit confirmation and submission receipt. `DEMO.md` is a production plan, not a recording. Never call source code or a screenshot a completed submission.

## Recovery / runbook proof — November 4, 2026
The complete production app is verified locally after the Walrus read recovery.

Open `http://localhost:4217/workspace?digest=BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6` to inspect the live historical failed transaction and its **simulation-tested, not historical-repair-verified** Walrus runbook. The proof page at `http://localhost:4217/proof/splitcoins` displays the actual failed and successful controlled Tatum Mainnet simulations and Walrus blob receipt.

Technical fix: one semantic search from `src/lib/unified-recall.ts` rather than three parallel MemWal queries, bounded read-only retry for transient DNS/network errors, deterministic evidence-tier classification, and separate errors for chain lookup vs Walrus recall. Production Tatum→Walrus returned one runbook from 12 stored memories in 7.4s; unrelated `MoveAbort` control returned no runbook.

Regression check: `node --experimental-strip-types scripts/test-retry-reads.mjs`, `pnpm lint`, `pnpm build`, and app `POST /api/recall`. Never describe the simulated correction as a human-approved or onchain-executed repair.
