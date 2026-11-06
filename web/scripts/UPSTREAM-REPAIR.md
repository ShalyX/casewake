# Casewake: upstream flashloan route repair spike

**Scope:** Reconstruct only an alternative, read-only repair candidate for the historical Sui Mainnet failure `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6`. This is not a trading feature in Casewake.

The original DeepBook flashloan principal is **65.265188650 SUI**. The original final DeepBook conversion returned **65.100000000 SUI**, leaving a **0.165188650 SUI shortfall**.

The replay script compares a route through SUI → USDSUI → USDC → SUI and a shorter SUI → USDC → SUI route, retaining the exact original principal. It calls Cetus Aggregator's **`routerSwap`** with coin objects created by the flashloan; it does not use wallet-owned SUI coins to subsidize the repayment. It does not sign or execute transactions, or write to Walrus.

## Run locally

From `web`, install `@cetusprotocol/aggregator-sdk@1.7.5` as a development dependency before running on a fresh checkout; its SDK availability is not currently in the project's committed lockfile. Then run:

```powershell
node --test scripts/test-repayment-safety.mjs
node scripts/replay-upstream-route-repair.mjs
```

A `.env.local` `TATUM_API_KEY` is used when available for read-only Mainnet gRPC simulation. To use the public Sui Mainnet endpoint instead, set `USE_PUBLIC_GRPC=1`. The optional `RESERVE_PPM` (default 200) reserves output when sizing the next leg. `FORCE_REPLAY=1` is **diagnostics only**: it tries a Mainnet simulation even when the quote guard blocks. It does not authorize signing.

## Admission rule

The `repayment-safety.mjs` guard requires both a slippage-protected quote (50 basis points, matching the swap's 0.5% slippage setting) above the full principal and a successful **atomic full-route Mainnet simulation**, with no wallet coin funding. Passing is only **eligible for manual review**, never automatic authorization.

## Current evidence

See `../../evidence/upstream-route-repair-observations-2026-11-06.json` for observed quote and simulation results. Attempts include a very small briefly positive gross quote, but actual route replays failed with `InsufficientCoinBalance` in commands #9, #11, and #12. Later quote refreshes were also interrupted by DNS failures. There is **no confirmed self-funding repaired route**. Gate 2, human review, Walrus writing, and recurrence/recall remain locked.
