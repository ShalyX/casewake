# Incident resolution verification queue
Date: 2026-11-04. This is an **unverified draft**, not a human-approved or successfully reproduced fix.

## First useful candidate — InsufficientCoinBalance

- Failed Mainnet digest: `XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue`
- Later independent failed digest with same onchain error: `BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6`
- Tatum response: `InsufficientCoinBalance in command 16` for both.
- Blockchain source: https://suivision.xyz/txblock/XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue
- Official Sui documentation: https://www.docs.sui.io/onchain-finance/deepbook/deepbookv3/fees-and-funding (Troubleshooting)

### Candidate diagnosis from published docs
The error can occur when the transaction attempts to spend more of a coin than is available after reserving gas. In relevant use cases, official guidance recommends lowering the spend amount / reserving gas, explicitly sizing a gas budget, or funding the wallet.

### Verification STILL required before calling this a fix
1. Reproduce the failure in a controlled environment or obtain the original engineering team's incident report. Determine the exact command/coin that failed, not just the generic category.
2. Demonstrate the corrected transaction parameters and a successful dry-run, ideally a real successful execution with relevant command/package.
3. Document verifiable evidence URL (commit, reproduction transcript, test output or successful follow-up digest) and reviewer identity.
4. Only then mark `verified` in the app's "Save human-verified resolution" form. The API protects writes with WORKSPACE_WRITE_KEY.
5. Import the second matching failed digest and confirm the signed Walrus Mainnet resolution memory changes the recommendation. Check negative controls for unrelated error/version.

### Current status
- Two distinct real failed digests: VERIFIED by Tatum.
- Error class + published generic troubleshooting: DOCUMENTED.
- This specific incident's cause and successful fix: **NOT VERIFIED**.
- Human reviewer sign-off: **NOT GIVEN**.
- Walrus Mainnet human-verified resolution memory: **NOT WRITTEN**.
- Do not call this a completed product loop yet.

## Existing legitimate Mainnet proof
- Ten distinct Tatum-onchain failure observation memories, all with completed Walrus job/blob IDs: `observation-write-receipts.json`.
- One earlier smoke-test memory (separate from the ten).
- Three separate real analogous failures recalled the appropriate previous observed case: `live-recall-proof.json`.
- Total namespace inventory confirmed as eleven records using MemWal `listMemories`.


## 2026-11-06 — DeepBook repayment prevention guard proven; reviewer approval pending

- Candidate digests: XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue (borrow 42,872,155,408 MIST) and BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6 (borrow 65,265,188,650 MIST).
- Both real Mainnet PTBs borrow SUI, swap through USDSUI and USDC, merge SUI outputs, then fail at command 16 while splitting the exact borrowed principal.
- Tatum simulation of the original transaction data, after clearing only its expired epoch constraint, reproduced InsufficientCoinBalance at command 16 for both transactions.
- For the BbRZD7... transaction, changing only the borrow/repayment principal to 75%, 50%, 25%, 10%, and 1% still failed at command 16. Lowering size alone is not a fix.
- The final DeepBook swap_exact_quote_for_base call has min_base_out=0. The full-PTB simulation gate is the tested prevention procedure; non-zero quote-derived min-output constraints are follow-up hardening not yet proven.
- New acceptance proof: evidence/deepbook-repayment-guard-proof.json and web/scripts/prove-deepbook-repayment-guard.mjs. Original route -> BLOCK at command 16; actual DeepBook overdraw control (borrow 0.01 SUI, split 0.02) -> BLOCK at command 1; exact borrow/split/return control (0.01 SUI) -> ALLOW, full simulation successful with four command results.
- All tests used Tatum Sui Mainnet simulation with mocked gas. No transaction was signed, submitted or executed.
- Classification: PREVENTION GUARD VERIFIED; historical three-hop route NOT repaired or proven profitable; exact hop-by-hop shortfall NOT isolated; human approval NOT YET GIVEN; Walrus human-verified memory NOT WRITTEN.
- Verified resolution proposed for reviewer: only sign after a fresh full-PTB Tatum Mainnet simulation returns successful Transaction status; otherwise block signing and reject/re-quote the route. Re-simulate immediately before signing; do not blindly shrink the loan.
- Full report: evidence/deepbook-repayment-guard-report.md.

- Additional hardening not yet proven: add quote-derived non-zero minimum outputs per hop and prove a successful corrected three-hop route. Do not include these untested changes in the verified memory.
