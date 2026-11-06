# DeepBook flash-loan repayment guard — proof report

Date: 2026-11-06
Status: **PRE-FLIGHT PREVENTION GUARD VERIFIED IN TATUM MAINNET SIMULATION; HISTORICAL THREE-HOP ROUTE STILL BLOCKED; HUMAN APPROVAL PENDING.**

## Incident evidence

Two independent Sui Mainnet transactions failed at the repayment split:

- XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue borrowed 42,872,155,408 MIST (42.872155408 SUI).
- BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6 borrowed 65,265,188,650 MIST (65.265188650 SUI).

Both programmable transaction blocks follow the same three-hop flow:

1. DeepBook borrows SUI using borrow_flashloan_base.
2. A router swaps SUI into USDSUI.
3. A pool swaps USDSUI into USDC.
4. DeepBook swaps USDC back into SUI.
5. The SUI outputs are merged.
6. Command 16 splits the exact borrowed SUI principal.
7. Command 17 returns the coin and FlashLoan hot potato using return_flashloan_base.

Tatum reports InsufficientCoinBalance in command 16 for both original transactions.

The final DeepBook swap is swap_exact_quote_for_base with SUI as the base asset. Its min_base_out argument is zero in the historical transaction. DeepBook's source documents that this parameter is enforced against the returned base coin. The flash-loan return function also requires the exact borrowed amount and the FlashLoan object to be returned in the same PTB.

Official source references:
- https://www.docs.sui.io/onchain-finance/deepbook/deepbookv3/contract-information/flash-loans
- https://raw.githubusercontent.com/MystenLabs/deepbookv3/main/packages/deepbook/sources/pool.move

## Reproduction

The historical transaction BCS was replayed through Tatum Sui Mainnet simulation after clearing only the expired epoch constraint. The commands, inputs, package IDs and shared-object references were otherwise retained. Both replayed transactions again failed at command 16 with InsufficientCoinBalance.

For the second transaction, only the shared borrow/repayment amount input was changed. The following variants all still failed at command 16:

- 75% of the original principal
- 50%
- 25%
- 10%
- 1%

This shows that simply lowering the borrowed amount, without changing the route economics or its output constraints, is not a demonstrated correction.

## Guard tested

The proven prevention rule is:

**Do not allow a flash-loan PTB to proceed to signing unless a fresh, full-transaction Tatum Mainnet simulation returns a successful Transaction result with effects.status.success = true. Any failed, unknown, timed-out or degraded simulation blocks signing.**

The simulation must include the complete route, repayment split and return_flashloan_base call. Re-run it immediately before signing; do not rely on a cached quote or stale simulation.

Minimum-output changes are not part of this guard acceptance test. They remain follow-up hardening and are listed separately below.

## Tatum Mainnet guard acceptance results

Reproducible script: web/scripts/prove-deepbook-repayment-guard.mjs
Machine-readable result: evidence/deepbook-repayment-guard-proof.json

| Scenario | Tatum simulation | Guard decision |
|---|---|---|
| Original three-hop route | Failed at command 16: InsufficientCoinBalance | BLOCK |
| DeepBook control: borrow 0.01 SUI, split 0.02 SUI | Failed at command 1: InsufficientCoinBalance | BLOCK |
| DeepBook control: borrow 0.01 SUI, split and return exactly 0.01 SUI | Successful Transaction; all four commands completed | ALLOW |

The exact-repayment control used the real DeepBook Mainnet pool and its shared-object reference. It exercised borrow_flashloan_base, splitCoins, return_flashloan_base and transfer of the remainder.

All tests used Tatum Sui Mainnet gRPC simulation with mocked gas. No transaction was signed, submitted or executed onchain.

## What is and is not proven

**VERIFIED**
- Both historical Mainnet failures are real and fail at the repayment split.
- Replaying the original PTB data reproduces the same failure on current Mainnet state after removing only the expired epoch constraint.
- Reducing the principal alone down to 1% does not fix the route.
- The preflight guard blocks the unsafe route.
- A real DeepBook flash-loan control blocks an overdraw and allows an exact repayment.

**NOT VERIFIED**
- A profitable or successful corrected version of the historical three-hop swap route.
- The exact output shortfall contributed by each individual swap hop.
- The route's final min_base_out threshold on a corrected profitable route.
- An onchain execution or real gas-payment outcome; the tests are simulations with mocked gas.
- Human approval of this prevention resolution.

## Verified prevention resolution for reviewer approval

Classify this as a **verified prevention resolution**, not as a successful repair of the historical arbitrage route:

1. Before signing, run a fresh Tatum Mainnet simulation of the complete PTB, including every swap, the repayment split and return_flashloan_base.
2. Allow signing only when the simulation returns Transaction with effects.status.success=true.
3. If the simulation fails, is unknown, times out or is degraded — especially if it reports InsufficientCoinBalance at the repayment split — block signing and reject/re-quote the route. Do not retry by blindly shrinking the loan.
4. Re-simulate immediately before signing; never rely on a cached result.

This is the tested part of the resolution and is the only part proposed for the human-verified Casewake memory.

## Additional hardening — not yet proven

- Add non-zero, quote-derived minimum-output constraints to each swap hop.
- Set the final DeepBook min_base_out to cover the repayment shortfall after accounting only for any separately measured and guaranteed SUI remainder.
- Re-quote the route and prove a successful corrected three-hop simulation before describing the historical route as fixed or profitable.

These are recommended follow-up changes, not part of the verified claim yet.

The original three-hop route remains unsafe and must not be submitted as-is. A human reviewer must approve the tested prevention procedure before it is written as a human-verified Casewake memory.
