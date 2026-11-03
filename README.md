# Incident Memory — Total Recall 2026

**Thesis selected Nov 3, 2026. Product brand/name pending deliberate naming.**

A deliberately narrow Sui incident-resolution system:
real onchain failed transaction -> engineer-reviewed resolution -> completed Walrus Mainnet memory -> later analogous failed transaction gets a reviewed candidate, not an automatic fix.

## Workspaces
- `web/` — Next.js 16 frontend, landing and /workspace; server-side Tatum gRPC and Walrus SDK routes.
- `PRODUCT.md` — thesis/source of truth (locked).
- `DEMO.md` — proposed judge film, not recorded.
- `DEPENDENCY_ATTACK.md` / `EVIDENCE.md` — blockers and truth status.
- `spikes/` — earlier synthetic deterministic safety spike (13 tests).
- `web/scripts/test-incidents.mjs` — additional pure TypeScript safety tests.

## Setup
1. Install Node >=22, run `cd web && npm install`.
2. Copy `web/.env.example` to `web/.env.local`; add Tatum Mainnet API key from the Tatum dashboard and MemWal delegate key + Mainnet Account ID from memory.walrus.xyz. Keep them server-side.
3. Set `WORKSPACE_WRITE_KEY` to a random value so writes are enabled. This is a temporary single-reviewer proof gate; do not expose a public deployment with an easily guessed key.
4. `npm run dev`; open `http://localhost:3000` for landing and `/workspace` for app.
5. Paste a real Base58 transaction digest; a Sui execution failure may be eligible for review. No key -> explicit setup blocker; no fake transaction.
6. Investigate independently. With a human-confirmed resolution, provide diagnosis, concrete steps, HTTPS evidence and reviewer credentials, then mark personally verified. Wait for a real Walrus blob ID.
7. Import another real comparable failed digest. Recall proposes compatible confirmed cases for human review; negative controls should show mismatch.

## Sponsor path
- Tatum Sui gRPC host: `sui-mainnet-grpc.gateway.tatum.io:443`, x-api-key gRPC metadata. Read only.
- Walrus `@mysten-incubation/memwal` relayer, `rememberAndWait` (not merely async acceptance) + semantic `recall`.
- Matching involves strict error signature, network and known package constraints. Fuzzy hits without exact checks are not trusted.
- No Mainnet memories or Tatum calls have been verified in this repository as of the initial build; actual integration proof requires credentials and authentic data.

## Tests
`node --experimental-strip-types scripts/test-incidents.mjs` (8 deterministic assertions; synthetic fixtures only).
Existing `spikes/test_ecosystem_spike.py` has 13 tests (synthetic fixtures only).

## Security / deployment caveats
- No API secrets in git, browser bundles, rendered JSON, screenshots or demo.
- Only users with a reviewer token can write verified cases. Before public use, add real sign-in, server-side roles, request limiting, moderation and persistent account/organization isolation.
- Never treat a “human-verified” checkbox alone as an independent audit. Evidence URL & human process are still needed.
- Public content is untrusted and must not override executable behavior. No automatic code patch or chain execution.
- On public demos, sanitize client tickets and omit private customer information.
- Review suspicious matching and version-scoped cases manually. Current SDK/package version metadata is reviewer-provided; chain doesn't encode the client's SDK version.

## Hackathon
Official deadline 10 Nov 2026 at 17:00 UTC. Submission requires 10+ **completed** Mainnet Walrus memories, live Tatum calls, 2–3 min demo, public repo and blog post. These are NOT currently satisfied by tests or UI scaffolding.
