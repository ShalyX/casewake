# PROJECT — Total Recall / Incident Memory

## Current milestone
BUILD_VERTICAL_SLICE — authentic onchain-observation and cross-transaction Walrus recall are **VERIFIED**. Human-verified repair/recommendation loop is **NOT VERIFIED** and remains an open high-priority proof gate.

## Selected product / boundaries
- Thesis explicitly selected by user on 2026-11-03: Incident Memory (name remains a descriptive working title; final brand name not locked).
- User/problem/primary loop: PRODUCT.md revision 1; real Sui transaction → human-approved fix → persistent Walrus memory → safe later recommendation, always reviewed by a person.
- EchoLedger, Watchline and Indexer Recovery are parked, not discarded. No feature merge.
- No autonomous repair, blockchain signing or automatic financial action. No fake cases, fake transaction data or unverified "fixed" claims.

## Completed and verified — 2026-11-04
1. Recovered failed npm setup using `pnpm`; installed Next.js 16.4.4, React 19.3, Sui SDK 2.39, native gRPC, MemWal 0.1.12; `pnpm-lock.yaml` generated.
2. Next.js production build and TS compilation passed; app runs locally via `pnpm start --hostname 127.0.0.1 --port 4217`. `GET /workspace` returned HTTP 200. Separate landing and app.
3. Tatum gRPC authentication HTTP 200/gRPC 0; live `POST /api/transaction` returned a true Sui Mainnet `MoveAbort` failed transaction. `web/scripts/discover-failures.mjs` sampled 100 recent executed tx and found 56 failures (24 distinct error strings IN THIS SAMPLE, not network-wide rates). Candidates in `evidence/failed-sui-transaction-candidates.json`.
4. MemWal SDK signed auth, completed Mainnet storage job and later recall proven. One older smoke-test blob `fxqZ53GnDXBT3YR37npywnvxNdJF6Bb27giTaF9iKYA`.
5. `POST /api/observations` (reviewer-key protected) independently re-fetched ten **distinct real failed Sui transactions from Tatum**, then completed ten separate Walrus Mainnet writes; job IDs and blob receipts in `evidence/observation-write-receipts.json`.
6. `GET /api/memories` independently listed 11 stored memories (10 authentic onchain observations + prior smoke), with complete pagination.
7. `POST /api/recall` retrieved matching onchain observations for **three different later genuine failed digests**, while returning ZERO human-verified resolutions. Exact matches and negative self-match checks saved in `evidence/live-recall-proof.json`.
8. Unauthenticated reviewer request rejected 403; authenticated request without human verified checkbox rejected 400. `WORKSPACE_WRITE_KEY` generated privately and kept in ignored `web/.env.local`.
9. Pure deterministic TS safety tests now 10/10 (synthetic fixtures); earlier Python spike 13/13 (synthetic). Production app screenshot `evidence/screenshots/workspace.png` captured on real local host.
10. Web app proof panel distinguishes observed failure precedents from human-reviewed resolutions, shows Mainnet namespace inventory, and hides reviewer keys from git/browser persistent storage.

## Active work / required verification
- Final build and lint QA after last changes (source is written; check new command results before passing).
- Reviewer-approved resolution still **UNPROVEN**: two genuine analogous failure digests exist, and official Sui docs provide generic troubleshooting, but NO demonstrated successful fix and NO human signoff. See `evidence/resolution-verification-queue.md`.
- The required ten Mainnet memories are genuine **observations**, not ten verified repairs. Do not count smoke or observations as human-verified fixes.
- Brand naming, Product Hygiene, Demo Production/QA, public repository, deployment, blog, organizer track-fit clarification and submission remain NOT DONE.
- Read-only Sui chain lookup works; no automatic repair, notifications or transfers.

## Source-of-truth / proof artifacts
- `PRODUCT.md` thesis, `HACKATHON.md` rules, `DEMO.md` planned film, `DEPENDENCY_ATTACK.md`.
- `EVIDENCE.md` claim statuses and proof register.
- `evidence/failed-sui-transaction-candidates.json`: real Tatum sample, only onchain execution failures.
- `evidence/observation-write-receipts.json`: 10 authentic Mainnet observation writes, one job and blob ID each.
- `evidence/live-recall-proof.json`: 3 repeat-failure matches plus self-match rejection.
- `evidence/resolution-verification-queue.md`: pending documented `InsufficientCoinBalance` candidate, not a verified fix.
- `web/scripts/discover-failures.mjs`, `ingest-real-observations.py`, `verify-live-recall.py`, `test-incidents.mjs`.
- `evidence/screenshots/workspace.png`: initial local UI capture; additional real-data screenshot recommended.

## Highest-value next move
1. Collect an independently verified engineering repair for at least one failure class: reproduce failure → apply fix → confirm succeeded test/chain action or maintainer-backed issue resolution → reviewer signs off → `POST /api/remember`.
2. Import another genuinely compatible failed digest and prove a previously verified resolution is recalled and recommended with evidence; the existing three onchain-observation pairs are ready to use for validation but cannot substitute for an actual confirmed fix.
3. Complete visual review, Product Hygiene, demo production, narrative, blog, source publication and submission. Keep actual evidence, not placeholders.
4. Confirm Sui developer-ops workflow fits Smart Agents for Real Life track with organizer if feasible. Deadline: 2026-11-10 17:00 UTC.

## Constraints / safeguards
- SDK versions of a failed transaction cannot be inferred from chain evidence; version-scoped fixes require manual confirmation.
- A fuzzy Walrus hit without deterministic exact matching is a related observation, not an eligible fix.
- Walrus owner+namespace isolation does NOT automatically provide multi-tenant access control. Current reviewer-key protection is local MVP, not a production user auth system. Production public deployment needs real roles/rate limits.
- Never leak private API key, delegate key, reviewer secret, or wallet seed. `web/.env.local` is gitignored and was checked.

## Decisions and handoffs
- 2026-11-01: Generic memory bot killed; original personal finalists EchoLedger and Watchline compared.
- 2026-11-03: User directed exploration to ecosystem problems; both personal finalists parked.
- 2026-11-03: Incident Memory selected over Indexer Recovery; PRODUCT_LOCK revision 1.
- 2026-11-04: User instructed five-point execution; 10 genuine onchain observations completed, 3 real cross-transaction recall paths verified, actual repair approval blocked on missing successful-remediation proof.
- Research: sources and public issue context.
- Engineering: build/live Tatum/Walrus observation path passed; reviewed repair gate open.
- Proof: EVIDENCE.md statuses reconciled.
- Demo Director: early architecture only; final recording not made.
- Operator: persist true status; no submission-ready claims.

## State checkpoint
Revision 7 (pending state-json sync), 2026-11-04. Previous git commit `f924f07`; new commit after QA.
