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
- Public GitHub repository: **PENDING verification**.
- Public live demo URL: **PENDING verification**.
- 2–3 minute video URL: **NOT RECORDED / NOT PUBLISHED**.
- Published blog URL: **NOT PUBLISHED** (`BLOG_DRAFT.md` exists).

## Judge-proof sequence
1. `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6` — observed InsufficientCoinBalance at splitCoins command 16; retrieves 1 controlled runbook and 1 prior observation from 12 stored memories.
2. `/proof/splitcoins` — Tatum Mainnet read-only simulation: 20M MIST requested from 10M coin fails; 5M split succeeds, gas mocked, no executed transaction.
3. Mainnet memory blob `keORrsffV8gLkXG8smus_plmk1qUnXC2m2Gv9gyBwAw`, evidence SHA-256 `bb08e026fddaebfb1167484755cd088236cab4ed232966f6b706376e2b9aac0e`.
4. `XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue` — second genuine analogue retrieves runbook.
5. `Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp` — unrelated MoveAbort gets **zero** coin-split runbook suggestions.
6. `/api/memories` — namespace stored count measured live; ten real observations, one test runbook, one smoke record (as of Nov 4).

## Final submission gate
- [x] Real Tatum Mainnet gRPC integration / genuine transaction failure.
- [x] 10+ Walrus Mainnet writes (12 total; only 10 are true onchain failure observations, one simulated runbook, one smoke).
- [x] Actual runbook recall in public-mode local test, correct negative control.
- [x] Public-mode hard blocks writes and unknown digests.
- [x] Script and blog draft are prepared.
- [ ] GitHub repository publicly accessible.
- [ ] Live deployed app publicly accessible and functioning, no secret leakage.
- [ ] Video recorded and reviewed at 2–3 minutes.
- [ ] Blog **published** with real URLs and screenshot proof.
- [ ] Organizer track fit optionally confirmed.
- [ ] Required user identity/account form fields filled.
- [ ] Submission sent and receipt captured.

**Do not submit early as complete or invent a response from the organizers.**
