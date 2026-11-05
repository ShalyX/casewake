# Casewake — Total Recall submission readiness

Status checked: 2026-11-04. Submission deadline: **2026-11-10 17:00 UTC**.

## Suggested final entry
**Project name:** Casewake

**Track:** Smart Agents for Real Life — engineering workflow memory. Organizer has not explicitly confirmed B2B developer incident-management track fit; describe as a persistent workflow assistant with onchain evidence, not a consumer finance/prediction app.

**One-line description:** Casewake remembers past Sui transaction failures and simulation-tested troubleshooting procedures, so repeated incidents start with evidence rather than speculation.

**Description draft:** Casewake reads genuine Sui transaction effects through Tatum Mainnet gRPC, retrieves matching prior incidents from Walrus Memory Mainnet, and classifies each memory as onchain-observed, simulation-tested, or independently human-verified before suggesting a next investigation. Ten real failed transactions plus a controlled simulation-tested splitCoins correction and a connectivity test have been stored as twelve completed Mainnet memories. Two separate historical failures retrieve the runbook; an unrelated MoveAbort does not. Casewake is read-only and never claims to have repaired the original historical transaction.

## Required form fields
- Email: **USER TO FILL** (never put private contact details into public repo).
- Discord handle: **USER TO FILL**.
- LinkedIn URL: **USER TO FILL**.
- How heard about event: **USER TO FILL**.
- First Web3 project?: **USER TO FILL**.
- Tatum dashboard ID: **USER TO FILL**, retrieve from account (not the API key).
- SUI address and SUI account ID: **USER TO VERIFY FROM WALLET / DASHBOARD**.
- `MEMWAL_AGENT_ID`: **delegate public key**, *not* the Walrus MemWalAccount object ID. Official event site explains this. User already has the public key in the Walrus dashboard; **do not use the delegate private key or seed phrase**.
- Experience building with Walrus: mention durable Mainnet memory, completed write receipts, semantic recall, SEAL-session compatibility workaround.
- Experience with Tatum AI Builder: indicate accurately if not used; do not claim bonus.
- Public GitHub repository: **VERIFIED** — https://github.com/ShalyX/casewake (public, master commit 40e93fd).
- Public live demo URL: **LIVE END-TO-END VERIFIED** — https://casewake.vercel.app. Production deployment dpl_EBnwaqjqjDm4UFhGe9oovHwkKTym READY on commit 40e93fd; Tatum real transaction lookup and Walrus semantic recall work in Vercel production.
- 2–3 minute video URL: **NOT RECORDED / NOT PUBLISHED**.
- Published blog URL: **LIVE** — https://casewake.vercel.app/journal/casewake (HTTP 200; actual captured workspace and simulation screenshots both HTTP 200).

## Judge-proof sequence
1. `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6` — observed InsufficientCoinBalance at splitCoins command 16; retrieves 1 controlled runbook and 1 prior observation from 12 stored memories.
2. `/proof/splitcoins` — Tatum Mainnet read-only simulation: 20M MIST requested from 10M coin fails; 5M split succeeds, gas mocked, no executed transaction.
3. Mainnet memory blob `keORrsffV8gLkXG8smus_plmk1qUnXC2m2Gv9gyBwAw`, evidence SHA-256 `bb08e026fddaebfb1167484755cd088236cab4ed232966f6b706376e2b9aac0e`.
4. `XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue` — second genuine analogue retrieves runbook.
5. `Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp` — unrelated MoveAbort gets **zero** coin-split runbook suggestions.
6. `/api/memories` — namespace stored count measured live; ten real observations, one test runbook, one smoke record (as of Nov 4).

## 2026-11-05 — Live Vercel production verification

- Both TATUM_API_KEY and MEMWAL_PRIVATE_KEY are present in Vercel as sensitive/secret environment variables, scoped to Production. Values were never retrieved or logged. MEMWAL_ACCOUNT_ID, relayer URL, namespace and PUBLIC_DEMO_MODE=true remain configured.
- Production deployment dpl_EBnwaqjqjDm4UFhGe9oovHwkKTym is READY on commit 40e93fdf8191ff74da36deb926c870fb89ccec9b.
- /api/status: publicDemoMode=true, reviewerWritesEnabled=false, tatumConfigured=true, walrusConfigured=true.
- Approved real failed digest BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6: Tatum transaction lookup returned failed; Walrus recall returned 1 simulation-tested runbook + 1 observed precedent from 12 hits; recallDegraded=false.
- Second distinct matching failure XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue: 1 runbook, no degradation.
- Unrelated MoveAbort Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp: 0 runbooks, no degradation.
- Unlisted digest: 403. Public observation writes: 403. Public verified-memory writes: 403.
- /api/memories: 12 records, complete=true, namespace incident-memory-v1.
- Landing, workspace, simulation proof, field-notes article and both screenshots: HTTP 200.

## 2026-11-05 — Live Vercel production verification

- Both TATUM_API_KEY and MEMWAL_PRIVATE_KEY are present in Vercel as sensitive/secret environment variables, scoped to Production. Values were never retrieved or logged. MEMWAL_ACCOUNT_ID, relayer URL, namespace and PUBLIC_DEMO_MODE=true remain configured.
- Production deployment dpl_EBnwaqjqjDm4UFhGe9oovHwkKTym is READY on commit 40e93fdf8191ff74da36deb926c870fb89ccec9b.
- /api/status: publicDemoMode=true, reviewerWritesEnabled=false, tatumConfigured=true, walrusConfigured=true.
- Approved real failed digest BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6: Tatum transaction lookup returned failed; Walrus recall returned 1 simulation-tested runbook + 1 observed precedent from 12 hits; recallDegraded=false.
- Second distinct matching failure XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue: 1 runbook, no degradation.
- Unrelated MoveAbort Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp: 0 runbooks, no degradation.
- Unlisted digest: 403. Public observation writes: 403. Public verified-memory writes: 403.
- /api/memories: 12 records, complete=true, namespace incident-memory-v1.
- Landing, workspace, simulation proof, field-notes article and both screenshots: HTTP 200.

## Final submission gate
- [x] Real Tatum Mainnet gRPC integration / genuine transaction failure.
- [x] 10+ Walrus Mainnet writes (12 total; only 10 are true onchain failure observations, one simulated runbook, one smoke).
- [x] Actual runbook recall in public-mode local test, correct negative control.
- [x] Public-mode hard blocks writes and unknown digests (unknown digest 403; /api/observations 403; /api/remember 403).
- [x] Script and blog draft are prepared.
- [x] GitHub repository publicly accessible.
- [x] Vercel production deployment publicly accessible; Tatum and Walrus production integrations verified end-to-end. Public mode remains read-only by design.
- [ ] Video recorded and reviewed at 2–3 minutes.
- [x] Blog published with public app links, chain explorer links, actual UI screenshots, simulation proof and Walrus blob receipt.
- [ ] Organizer track fit optionally confirmed.
- [ ] Required user identity/account form fields filled.
- [ ] Submission sent and receipt captured.

**Do not submit early as complete or invent a response from the organizers.**
