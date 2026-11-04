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
