# Casewake �?" upstream repayment repair and independent replay audit

Date: 2026-11-06 | Network: Sui Mainnet | Classification: **REAL REPAIR STILL BLOCKED**

## Approved incident and hard acceptance
- Locked source digest: `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6`
- Original DeepBook loan: **65,265,188,650 MIST = 65.265188650 SUI**.
- Original three-hop Turbos �+' Bluefin �+' DeepBook route returned too little SUI; the final `SplitCoins` at command 16 failed with `InsufficientCoinBalance`.
- Gate 1 requires a **repeatable successful simulation of the complete corrected flashloan** (borrowing, all swaps, exactly repaying principal and returning the FlashLoan), no wallet-funded swap/repayment coins and an economically defensible outcome including gas. A quote alone, prevention-only control, positive gross before gas, or incomplete PTB does not pass.
- No signatures, execution, approvals or Walrus resolution writes were performed.

## Actual code repair
1. `web/scripts/repayment-safety.mjs` now distinguishes untouched loan reserve from traded SUI. Quote slippage applies to the traded output **only**, not the entire 65.265 SUI principal. Also requires confirmed successful atomic simulation and prohibits wallet-funding.
2. `web/scripts/simulate-route-repair-v2.mjs` borrows the unchanged loan, splits only the portion used by swaps, feeds forward SUI->USDC from that borrowed coin, explicitly splits a buffered USDC amount for the second USDC->SUI swap, transfers residual USDC, merges the returned SUI with the untouched borrowed reserve, splits the exact original repayment and returns the FlashLoan hot potato.
3. Default handoff reserve is **5,000 ppm / 50 bps** matching the SDK swap tolerance. The conservative route screen applies separate return-swap slippage and a minimum **1,000,000 MIST** economic floor. If no quote passes, it records `BLOCK_NO_FINANCIALLY_SAFE_ROUTE` and **does not simulate or authorize** a known-unsafe route. `FORCE_DIAGNOSTIC_SIMULATION=1` is an explicitly diagnostic read-only override, never a production authorization.
4. Tests: `node --test web/scripts/test-repayment-safety.mjs` �?" **8/8 PASS**, including reserve-accounting and fail-closed cases. `node --check web/scripts/simulate-route-repair-v2.mjs` �?" PASS.

## Genuine replay evidence
All simulations used **Tatum Sui Mainnet gRPC**, mocked gas, no signing and no wallet-funded swap coins.

| Case | Trade size | Handoff buffer | Quote gross net (MIST) | Full simulation | Gas balance cost (MIST) | Gate 1 |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| Broad route, before buffered USDC split | 1,250,000,000 | 0 | +274,634 | FAIL at repayment split command 17 | ~1,090,943 | BLOCK |
| Improved handoff | 1,250,000,000 | 10 ppm | +120,748 | FAIL at USDC input split command 9 | ~1,090,754 | BLOCK |
| Slippage-safe handoff | 1,250,000,000 | 5,000 ppm | **-6,225,960** | FAIL at repayment split command 18 | **1,090,754** | BLOCK |
| Smaller handoff diagnostic | 500,000,000 | 10 ppm | -12,455 | FAIL at repayment split command 19 | 1,091,118 | BLOCK |
| Conservative fresh quote, strict automatic screen | 1,250,000,000 | 5,000 ppm | **-5,630,941** | NOT simulated (rejected by quote safety screen) | N/A | BLOCK |

The last screen calculated conservative total **65,253,335,863 MIST** versus required **65,266,188,650 MIST** (principal + 1M MIST safety floor): an **absolute shortfall of 12,852,787 MIST** under that risk budget. The market quotes are point-in-time and fluctuate; no positive result is inferred from them. Positive gross quote variants also fail the post-gas criterion or actual atomic repayment simulation.

Evidence:
- `evidence/route-repair-v2-1250000000-mainnet.json`: last full slippage-safe replay, explicitly failed command 18.
- `evidence/route-repair-v2-500000000-mainnet.json`: full smaller replay, explicitly failed command 19.
- `evidence/route-screen-v2-1250000000.json`: fail-closed economic-screen rejection.
- `web/scripts/simulate-route-repair-v2.mjs` and `web/scripts/repayment-safety.mjs`: reproducible code.

## Financial and product boundaries
The route cannot be made profitable by adjusting JavaScript bookkeeping: fresh Mainnet swap prices, slippage limits and gas costs must be sufficient. A 50-bps forward handoff cushion on 1.25 SUI costs about 0.00625 SUI before the second swap and gas. The observed best small-route gross advantages in earlier scans were below gas alone. Shrinking the loan, injecting wallet coins or bypassing return checks does not qualify as a repair.

**Operator state:** `TECHNICAL_DERISK` remains blocked for the selected historical DeepBook route. Human approval, verified Walrus resolution write and exact-blob recall are **not unlocked**. The original general incident-memory product remains the goal; do not replace it with a DEX trading feature.

Next valid step: find a materially viable new upstream price route and demonstrate repeatable complete atomic success with actual gas-aware economics; otherwise treat this original historical route as provably unsafe and prove Casewake's full approved incident-memory workflow using a separate, genuinely corrected engineering incident, without mislabeling the DeepBook case.
