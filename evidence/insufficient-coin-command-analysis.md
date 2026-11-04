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
