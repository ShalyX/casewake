# Casewake: three-gate production acceptance (Nov 6, 2026)

This is an **enforced prevention-and-memory workflow**, not a claim that the strict full-route three-gate acceptance or the production memory write has already passed. The originally failed three-hop route still has no successful corrected simulation.

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
- Both diagnosis and resolution must describe a repayment-failure **prevention guard**, not a fictional repaired route.
- Walrus storage only begins **after** evidence validation.
- `rememberAndWait(..., {dedupe:true})` waits for a completed blob ID. The write response returns job ID, blob ID, namespace and stored record.
- The UI cannot label the historical route repaired, and it cannot claim a human verification until a real reviewer signs the checkbox.

**Current production evidence:** a human-approved prevention memory plus its Walrus job and blob ID has **not** yet been independently captured. Gate 2 must be reported as awaiting reviewer submission until it is.

## Gate 3 — recall from a distinct real failed transaction

- After Gate 2, `/api/verify-recall` retrieves the second real digest `XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue` from Tatum.
- It requires a compatible onchain failure, executes signed Walrus recall, rejects self-matches and incompatible human cases, and matches **the same completed blob ID** from Gate 2.
- Only then does the UI say **Prevention and recall verified · original route still unproven**. If Walrus cannot retrieve the match or Tatum is unavailable, the gate remains unproven.
- `web/src/lib/unified-recall.ts` attaches each recovered case's actual `blob_id` to the returned recommendation, not a fabricated receipt.

## Manual acceptance

1. Open [Casewake](https://casewake.vercel.app/workspace), enter the private reviewer access key, and inspect `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6`.
2. Independently inspect the pinned proof and actual reviewer diagnosis. Record only the verified prevention guard and approve the checkbox.
3. Store through Casewake. The backend verifies proof, completes a Walrus write, and runs the second-incident Tatum/Walrus acceptance check. Capture the exact job ID and blob ID.
4. Confirm the UI transitions to the *different* failure and presents the same blob ID next to the recalled reviewed procedure.
5. Check `Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp` as the negative control; it must not be eligible for this DeepBook resolution.

No arbitrary HTTPS evidence link, UI checkbox alone, merely accepted Walrus job, or simulation of a different route counts as completion.
