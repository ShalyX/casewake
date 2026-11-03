# EVIDENCE REGISTRY — Total Recall
Checked 2026-11-03. Statuses describe facts independently of a proposal.

| Claim | Status | Method/source | Limitation/next proof |
|---|---|---|---|
| Deadline Nov 10 2026 17:00 UTC; 10+ Walrus Mainnet memories, Tatum RPC, blog, demo, repo required | VERIFIED (DOCUMENT) | https://thewalrussessions.wal.app/tatum-total-recall | Check for organizer updates |
| Sui supports onchain tx effects/status through gRPC LedgerService.GetTransaction | VERIFIED (DOCUMENT) | https://www.docs.sui.io/develop/accessing-data/grpc/using-grpc | Not executed through Tatum |
| Tatum advertises Sui Mainnet gRPC endpoint | VERIFIED (DOCUMENT) | https://docs.tatum.io/changelog/sui-grpc-available-tatum | Authenticated request not yet completed |
| Walrus remember accepted job -> waitForRememberJob -> blob_id -> recall | VERIFIED (DOCUMENT) | https://docs.wal.app/walrus-memory/sdk/examples | Actual Mainnet write/recall not performed |
| Cross-team Walrus memory requires application-mediated access (owner+namespace scoped) | VERIFIED (DOCUMENT) | https://docs.wal.app/walrus-memory/sdk/cookbook-multi-tenant | Shared permissions/redaction not designed |
| Existing Sui Move debugger can replay onchain transactions | VERIFIED (DOCUMENT) | https://docs.sui.io/references/ide/debugger | No competitive differentiation from one-off explanation |
| Sui indexer exposes watermarks/lag monitoring | VERIFIED (DOCUMENT) | https://www.docs.sui.io/operators/data-management/indexer-stack-setup | Actual local indexer feed missing |
| Fullnode pruning complaint #27768 resolved in Sui 1.78.2/1.79.1 per maintainer | VERIFIED (PUBLIC REPORTED RESOLUTION) | https://github.com/MystenLabs/sui/issues/27768 | This is fullnode *pruner*, not indexer pipeline, and no recurrence proof |
| Incident Memory needs two genuine analog failed digests | UNPROVEN | planned Tatum gRPC acquisition | No digests yet |
| Incident Memory gives a better verified fix with Walrus recall | UNPROVEN | proposed before/after live demo | Cannot claim without proof |
| Indexer Recovery is connected to real operator watermark data | UNPROVEN | planned read-only metrics/scrape integration | No actual connected indexer |
| Either product has 10+ Mainnet memories | UNPROVEN | planned Walrus job receipts + blob IDs | Zero verified |
| Both safety filtering algorithms reject stale/mismatched/unverified sample memories | VERIFIED (LOCAL TEST ONLY) | spikes/ecosystem_spike.py + test_ecosystem_spike.py; 13 tests passed, 2026-11-03 | Synthetic fixtures, no external API or LLM recall tests |
| Organizer permits B2B Sui developer operations under Smart Agents for Real Life | UNCERTAIN | published tracks are broad | Ask organizer; no confirmed approval |
| Ecosystem users want a new product despite existing debuggers, docs, Rootly | UNPROVEN | proposed 1–2 engineer/operator interviews | No user interviews |

Never describe synthetic test cases as real chain events, verified incident resolutions, production metrics, or sponsor integrations.
