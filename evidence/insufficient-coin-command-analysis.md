# Mainnet command-level investigation: InsufficientCoinBalance

Status: **VERIFIED CHAIN ERROR + COMMAND**, **UNVERIFIED REPAIR**.
Checked Nov 4, 2026 via Tatum Mainnet LedgerService.GetTransaction.

## Two real failed transactions
1. `XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue`
2. `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6`

Both Tatum responses report:
- `effects.status.success=false`.
- `InsufficientCoinBalance in command 16`.
- `transaction.kind` is a programmable transaction with 19 commands.
- Command **index 16**, read from actual `programmableTransaction.commands[16]`, is a `splitCoins` call.
- Its target is a coin value produced by an earlier transaction command (nested result). The split amount argument is a pure input.
- The senders are **different addresses**, so these are analogous independent failures, not a demonstrated repair by the same person.
- Both occurred in checkpoint `341377758` in the sampled dataset.

Read-only evidence JSON:
- `evidence/context-XkAz3VrtFLpv.json`
- `evidence/context-BbRZD7YfTiiN.json`
- `evidence/failed-sui-transaction-candidates.json`.

Official Sui docs: https://www.docs.sui.io/develop/transactions/ptbs/prog-txn-blocks — `SplitCoins` takes a coin and one or more amounts; transactions execute commands in order; failure of a command fails the transaction.

## Hypothesis requiring engineer verification
The amount requested by `splitCoins` may exceed the coin value available at that point in the programmable transaction. An engineering review should trace previous coin inputs/results and amounts, then try a corrected amount or balance provision in a controlled environment and capture successful execution or dry-run evidence.

**No one has independently reproduced and demonstrated the correction to these transactions.** A plausible error explanation and official docs are NOT a human-verified repair.

## Honest next action
- Capture a real successful corrected execution or independently published engineering resolution, including method and source.
- Have an authorized reviewer evaluate the exact command/input amounts.
- Only then store a `human-verified` incident case via `POST /api/remember`.
- Replay another genuine matching failed digest via `POST /api/recall` and show the saved case with source evidence, then negative controls for mismatch.
- Do not sign or submit anyone else's transaction; no automatic financial operation is part of this product.

## Investigation limitations
The provider's sender-filtered `ListTransactions` attempt returned `INTERNAL`; no successful follow-up transaction could be established with that query. Authenticated Tatum service checks later succeeded but some GetTransaction calls were intermittently `UNAVAILABLE` or `DEADLINE_EXCEEDED`. This does not invalidate the two previously saved response proofs but it prevents new confirmation until the endpoint responds reliably.
Walrus relayer public `/health` returned HTTP 200, while authenticated `listMemories` returned HTTP 504 after the PC restart. No duplicate memories were written in this recovery session.


## 2026-11-06 — Mainnet replay and repayment guard acceptance

The two saved transaction BCS payloads were replayed through Tatum Mainnet simulation after clearing only the expired epoch constraint. The original command sequences, input amounts, package IDs and shared-object references were retained. Both replayed as FailedTransaction with InsufficientCoinBalance in command 16.

Decoded command 16 splits the exact SUI principal borrowed in command 0. The preceding route swaps SUI through USDSUI and USDC, then merges the returned SUI coin with any SUI remainder before attempting repayment. The final DeepBook swap_exact_quote_for_base call has min_base_out set to zero.

For the BbRZD7... transaction, only the shared borrow/repayment amount was reduced. Variants at 75%, 50%, 25%, 10% and 1% of the original 65,265,188,650 MIST all still failed at command 16. Do not present size reduction alone as a fix.

A read-only Tatum Mainnet control then exercised the actual DeepBook pool:
- Borrow 10,000,000 MIST and attempt to split 20,000,000 MIST: simulation blocked at command 1.
- Borrow 10,000,000 MIST, split exactly 10,000,000 MIST, return the FlashLoan hot potato and transfer the remainder: simulation succeeded, all four commands completed.

The tested preflight guard permits signing only when the complete fresh simulation returns Transaction with effects.status.success=true. It blocks the historical route and the overdraw control, while allowing the exact repayment control. All simulations used mocked gas; no signatures, submissions or onchain execution occurred.

This verifies a prevention guard, not a profitable correction of the historical three-hop route. The exact shortfall contributed by each hop and a corrected successful route remain unproven. Reviewer approval is still required before this prevention procedure can be stored as a human-verified Casewake memory.
