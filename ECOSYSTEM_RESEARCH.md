# RESEARCH — Ecosystem Problems (Alternative Thesis)
Checked: 2026-11-03 | Owner: Hackathon Operator / Research | Status: EXPLORATORY; not product lock.

## Research frame
User explicitly parked EchoLedger + Watchline, requested ecosystem problems (developers, protocols, infrastructure, coordination). This does NOT select or lock a new product. Hard constraints still apply: 10+ genuine Walrus Memory Mainnet writes, Tatum onchain integration, live learning loop, 2–3 minute judge demo; one submission per person. Track fit needs checking: Smart Agents for Real Life / Consumer Finance are the closest existing tracks, not a dedicated developer-tooling category.

## Observed pain 1 — Repeated transaction failures and disconnected fixes
User: Sui dApp engineers, protocol support staff, maintainers.
Problem: onchain transaction failures are observable but diagnosis is scattered among traces, versioned SDK docs, GitHub issues, human runbooks. An incident's *verified resolution* is often not carried forward to the next similar failure.
Evidence: official Sui error guidance catalogs transport vs execution errors; Sui Move Trace Debugger already supports transaction replay. Do not cite issue #28467 as an onchain InsufficientGas example: directly opening that URL on 2026-11-03 showed a network connectivity test failure, not a verified transaction-resolution case.
Current workarounds: Sui CLI traces, documentation, VS Code Move Trace Debugger, GitHub issues, generic AI explainers.
Opportunity: a human-confirmed incident memory that links chain-observed symptoms -> diagnosed resolution -> changed handling when a similar issue recurs.
Risk: do not claim universal root-cause accuracy or copy existing one-off debugger UX.
Sources: https://www.docs.sui.io/develop/testing-debugging/common-errors ; https://docs.sui.io/references/ide/debugger ; https://www.alchemy.com/docs/wallets/transactions/debug-transactions
Evidence: HIGH for error/debugging category; MEDIUM for unsatisfied shared-memory demand (needs interviews).

## Observed pain 2 — Indexer lag, watermarks, and historical data gaps
User: infrastructure operators, analytics, explorers, wallets/protocol backends.
Problem: growing apps need custom ingest and reliable indexed reads; polling and lag can cause delayed events and fragile backfills. Diagnosing an actual incident requires pipeline context (not just chain tip).
Evidence: Sui Feb 4 2026 blog states poll-heavy indexing creates latency, duplication and expensive custom pipelines. Official docs expose watermark and health checks. Aug 20 2026 issue #27768 reports fullnode pruning falling behind and approx 8GB/day growth on that operator's nodes (not representative of all operators).
Workaround: custom pipeline monitors, metrics, SQL watermark checks, manual runbooks, provider support.
Opportunity: remember how each team solved a class of lag or pipeline drift, and surface the verified runbook on recurrence.
Risks: instrumentation/integration overhead; Tatum reports network tip, not a customer's local indexer watermark; operator must connect metrics independently.
Sources: https://www.sui.io/blog/grpc-real-time-streaming-indexing-sui ; https://www.docs.sui.io/operators/data-management/indexer-stack-setup ; https://github.com/MystenLabs/sui/issues/27768
Evidence: HIGH for pain, MEDIUM for market gap.

## Observed pain 3 — Sui data API / SDK migration and version churn
User: Sui SDK-integrating developers, backend teams, infra providers.
Problem: Sui JSON-RPC -> gRPC/GraphQL and Mysten SDK 2.0 introduced schema, transport, error-handling and package-level changes; teams must validate migration on real chain, not just follow static documentation.
Evidence: official migration docs explicitly cover removed SuiClient, changed response shapes, ESM only, methods. Tatum published April 22 2026 deprecation notice and a gRPC guide. Tatum docs still list JSON-RPC methods alongside gRPC; advertised endpoints do not guarantee runtime functionality.
Workaround: official migration guides, scripts, manually mapped calls, team QA. Strong competition from documentation and generic code agents.
Opportunity: run migration checks against Tatum gRPC, record validated fix + SDK version + endpoint + symptom, reuse when the same regression returns.
Risk: demand may decrease after migration window; active Tatum gRPC availability requires a live authenticated spike.
Sources: https://github.com/MystenLabs/ts-sdks/blob/main/packages/docs/content/sui/migrations/sui-2.0/index.mdx ; https://docs.tatum.io/changelog/sui-json-rpc-migration-notice ; https://docs.tatum.io/oa/docs/sui-migration-guide-from-json-rpc-to-grpc ; https://docs.tatum.io/reference/rpc-sui
Evidence: VERY HIGH for change, MEDIUM for independent product need.

## Observed pain 4 — Ecosystem incidents where reads appear healthy but writes fail
User: operators of apps and services that must explain downtime and keep incident context.
Problem: superficially similar symptoms may have different causes; point-in-time RPC read success does not prove a chain is advancing.
Evidence: Jan 14 2026 Sui Mainnet certification stall lasted around six hours while RPC reads could continue serving the last certified state.
Opportunity: compare latest checkpoint progress with app symptoms, preserve the last verified incident resolution and prevent stale reads being falsely marked healthy.
Sources: https://www.sui.io/blog/sui-mainnet-network-stall-resolution
Risk: correctly distinguish a full chain stall from a single provider fault; no fake real-time alert claims.
Evidence: HIGH for concrete incident; LOW/MEDIUM for need for new product.

## Observed pain 5 — Protocol treasury accountability and rationale
User: DAO treasuries, ecosystem grant councils, multisig teams, grant recipients.
Problem: onchain funding shows amounts and parties, but not fully the governance rationale, original promises, review evidence, exceptions, or later milestone status.
Evidence: 2025 research on blockchain treasury governance identifies opportunism/trust challenges; onchain Sui governance proposals exist but this is not proof of unmet grant workflow demand.
Current workarounds: forums, spreadsheets, governance proposals, multisig dashboards, reports.
Opportunity: connect real Tatum-observed disbursements with Walrus Memory of reviewed approvals, milestones, historical warnings; use older learnings on future proposals.
Risk: accessing real milestone/approval data; sourcing independent people to validate; privacy/permission.
Sources: https://onlinelibrary.wiley.com/doi/10.1111/rego.12659 ; https://suigovernance.com/
Evidence: MEDIUM (real general problem, Sui-specific demand unproven).

## Observed pain 6 — Multi-party bridge issue diagnosis
User: protocol support and bridge integrators.
Problem: failed cross-chain settlement often spans contracts/attestation and multiple operators; easy to lose case history.
Evidence: Oct 26 2026 Sui GitHub issue #28448 reports Base -> Sui USDC transfer stuck after Circle attestation. Single reported incident, not an ecosystem-wide estimate.
Opportunity: chain-proof incident cases with resolved sequence and later analogous symptom matching.
Risks: matching across chains, complex statuses/partial failures, required Tatum calls on both networks; too heavy for deadline.
Source: https://github.com/MystenLabs/sui/issues/28448
Evidence: LOW/MEDIUM.

## Technical constraints learned
- Walrus MemWal is encrypted, account/namespace-scoped semantic memory, not a public cross-organization query service by default. An ecosystem-shared app would need a moderated shared account/namespace + app-mediated access. Never store credentials or unredacted customer tickets. Structured, verified resolution summaries should be recalled and validated against deterministic fields.
- Walrus remember() acceptance is asynchronous; complete wait / status + recall proof are required before claiming Mainnet persistence.
- Tatum publishes both Sui gRPC + legacy JSON-RPC documentation, while Sui itself has deprecated JSON-RPC. Prefer the modern Tatum Sui gRPC for new builds; check real live availability with authenticated requests. Do NOT assume JSON-RPC will function based on an API list alone.
Sources: https://docs.wal.app/walrus-memory/sdk/usage/memwal ; https://docs.tatum.io/reference/rpc-sui ; https://www.docs.sui.io/develop/accessing-data/graphql/graphql-rpc

## Specialist research handoff
Completed: evidence-backed six ecosystem pain areas, workarounds, competitor categories, sponsor fit, caveats.
Remaining: real Tatum gRPC + Walrus Mainnet proof; 1–2 practitioner validation interviews for any selected thesis; track eligibility confirmation for B2B developer/infra agent.
Requires operator decision: generate/rank product concepts and keep original personal finalists parked.
