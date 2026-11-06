# Casewake: three-gate production acceptance (Nov 6, 2026)

This is a **strict fail-closed three-gate workflow**, not a claim that production acceptance has passed. The original three-hop route still has no corrected successful simulation.

## Gate 1 — simulation-based repayment prevention

Source: `evidence/deepbook-repayment-guard-proof.json` at Git revision
`f9d3ea32e24f84f2306cd2533d92dbfd0cb62f2e`.

- Confirmed Mainnet failed source: `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6`.
- Original historical three-hop transaction: rejected at repayment split, command 16.
- Control with insufficient borrowed coin: rejected at split command 1.
- Exact borrowed/returned principal control: complete four-command simulation succeeded.
- **Validated proof scope:** pre-signing prevention **only**. The historical three-hop swap route was *not* corrected or proven profitable. Gas was mocked; no signing or onchain execution.
- `web/src/lib/guard-evidence.ts` fetches the immutable proof and fails closed on inconsistent results.

## Gate 2 — human review, independent test evidence, completed Walrus write

- `/api/remember` checks the private workspace key, the failed transaction from Tatum, a reviewer's explicit signoff, and the exact Git-commit-pinned machine-readable Tatum proof.
- A prevention-only proof remains a **simulation runbook**, not a human-verified repair. A corrected full-route repair may be submitted only as raw Sui transaction BCS. The server verifies the original flashloan principal, pool and repayment, forbids wallet-owned coin inputs, and independently simulates the complete correction using Tatum Mainnet. Any failure blocks Walrus writes.
- Walrus storage only begins **after** evidence validation, including proof of successful correction of the same full route. The present evidence fails that requirement, so verified-memory storage is blocked.
- `rememberAndWait(..., {dedupe:true})` waits for a completed blob ID. The write response returns job ID, blob ID, namespace and stored record.
- The UI cannot label the historical route repaired, and it cannot claim a human verification until a real reviewer signs the checkbox.

**Current production evidence:** the original full-route repair has **not** passed self-funded Mainnet simulation. Gate 2 remains blocked; no repaired transaction, completed verified case write or independent recall has been confirmed.

## Gate 3 — recall from a distinct real failed transaction

- After Gate 2, `/api/verify-recall` retrieves the second real digest `XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue` from Tatum.
- It requires a compatible onchain failure, executes signed Walrus recall, rejects self-matches and incompatible human cases, and matches **the same completed blob ID** from Gate 2.
- Only when the same independently simulation-verified full-route memory is recalled from the exact blob ID does the UI report the simulation and recall gates as verified. If Walrus cannot retrieve the match or Tatum is unavailable, Gate 3 remains unproven. No onchain execution of a repair is claimed.
- `web/src/lib/unified-recall.ts` attaches each recovered case's actual `blob_id` to the returned recommendation, not a fabricated receipt.

## Manual acceptance

1. After proving a corrected successful original-route simulation and registering immutable evidence, open [Casewake](https://casewake.vercel.app/workspace), enter the private reviewer access key, and inspect `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6`.
2. Supply the corrected full-route transaction BCS, actual independent evidence URL and diagnosis. A reviewer approves the verified repair; the server independently re-simulates it and blocks submission unless the full original principal is repaid without wallet coin funding.
3. Store through Casewake. The backend verifies proof, completes a Walrus write, and runs the second-incident Tatum/Walrus acceptance check. Capture the exact job ID and blob ID.
4. Confirm the UI transitions to the *different* failure and presents the same blob ID next to the recalled reviewed procedure.
5. Check `Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp` as the negative control; it must not be eligible for this DeepBook resolution.

No arbitrary HTTPS evidence link, UI checkbox alone, merely accepted Walrus job, or simulation of a different route counts as completion.
