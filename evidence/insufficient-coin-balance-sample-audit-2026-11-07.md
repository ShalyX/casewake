# InsufficientCoinBalance candidate-pool audit — 2026-11-07

## Purpose

A bounded check to determine whether the existing eight InsufficientCoinBalance candidates could provide a simple, non-DeFi case for Phase 13. This was not a new route-repair investigation and no transaction was signed or submitted.

## Result

All eight candidates are flashloan/DEX strategy PTBs clustered at Sui Mainnet checkpoint 341377758. The set is not representative of general Sui developer incidents and must not be used as proof of broad developer pain or as a generic human-reviewed case.

| Digest | Failure | Observed operation family |
|---|---|---|
| DZrXy9vpqkx6mQs226HYZ2PQXtCTULA4H98dwaRbRXBu | InsufficientCoinBalance, command 15 | DeepBook SUI/SUI_USDE flashloan with multi-hop DEX swaps |
| XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue | InsufficientCoinBalance, command 16 | DeepBook SUI/SUI_USDE flashloan with USDSUI/USDC/SUI route |
| BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6 | InsufficientCoinBalance, command 16 | DeepBook DEEP/SUI flashloan with DEX repayment route |
| 2LRGC1PSu2tqCWvYaQ6RBic9tKJxM9gjEMcGkF8hSxdX | InsufficientCoinBalance, command 14 | DeepBook SUI/SUI_USDE flashloan, COIN/SUI spot DEX and USDC route |
| 2bHBeTgGSrjKc2CMffXZ96U391iJQHyqs2WhwmdbrvE9 | InsufficientCoinBalance, command 16 | AFSUI/SUI and USDC/USDY flash swaps with AMM routing |
| GgELNFx396mCAtyMJRWKTzQrJ1PQZtCetAdA8yaMMzJi | InsufficientCoinBalance, command 14 | DeepBook SUI/SUI_USDE flashloan, COIN/SUI spot DEX and USDC route |
| GHh4Z7kxWJeYpnj5E1SYrt5x3UURjxuSPC7sfgCSfjMh | InsufficientCoinBalance, command 14 | AFSUI/SUI and USDC/USDY flash swaps with AMM routing |
| DkbaEH21SYTLpyJjUayT5gFenn71xByfH2FntYJ6btkc | InsufficientCoinBalance, command 16 | AFSUI/SUI and USDC/USDY flash swaps with AMM routing |

## Decision

- Keep this set only as route-specific negative evidence and compatibility-test material.
- Stop scanning this pool for a generic Casewake proof case.
- Do not treat same error text, same checkpoint, same sender, or shared DEX Move calls as causal evidence of a fix.
- Source the first general case from a different real Sui developer incident, ideally with a maintainer-backed issue, exact technical change and reproducible proof procedure.
- No Walrus resolution write was performed.
