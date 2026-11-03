# VALIDATION — Ecosystem Finalists (Incident Memory vs Indexer Recovery)
Checked: 2026-11-03 | Owner: Hackathon Operator + Research, Product Critic, Engineering
Status: ADVERSARIAL VALIDATION (both MODIFY, neither product locked)

## Verdict summary
- **Incident Memory: MODIFY / ADVANCE for targeted proof.** Credible ecosystem need, strong short demo, natural Tatum gRPC transaction evidence and Walrus incident memory. Differentiate from Sui Move replay debugger, generic AI explainers, and incident.io/Rootly past-incident recall by narrowly focusing on Sui execution cases with exact onchain evidence, human verification, version-aware resolution and optionally opt-in curated knowledge exchange. Current claim of unmet demand for another tool remains unvalidated.
- **Indexer Recovery: MODIFY / CONDITIONAL.** Operator pain is real and technical differentiation is possible, but Tatum only supplies network context. To claim diagnosis/recovery, an actual indexer must supply pipeline metrics. If no real indexer metrics are available promptly, do not build a dashboard with simulated metrics and claim a real infrastructure product. Prefer Incident Memory for competition.
- **User intent**: keep EchoLedger and Watchline PARKED (not discarded). The new two are being deeply explored, not yet selected.

## Shared constraints / correction
- Sui Foundation Mainnet JSON-RPC was disabled in July 2026, per current Sui docs. Use modern gRPC on Tatum where supported and confirmed with credentials. Do not rely on an old JSON-RPC snippet simply because it remains listed on a provider page.
- Walrus Memory is owner+namespace+app scoped, with async remember -> job -> waitForRememberJob -> blob_id. Search is semantic; every proposed resolution needs deterministic confirmation and provenance. A cross-team exchange is NOT built-in; implement moderated, consented, sanitized cases through one app-owned account/namespace, with server-side delegate key kept private. Namespace alone is not an authorization/security boundary.
- Hackathon submission: 10+ actual Mainnet memories, demonstrable Tatum calls, blog, 2–3 minute video, public repo; deadline 2026-11-10 17:00 UTC. B2B infrastructure workflow is *plausibly* Smart Agents for Real Life but no dedicated developer-infrastructure track exists: confirm with organizer if possible.
- Source correction: do not cite github.com/MystenLabs/sui/issues/28467 as a proven resolved onchain InsufficientGas case. The directly opened issue describes a network RTT test failure; no real failed onchain transaction digest has been collected from it.
- Source distinction: issue #27768 describes a **fullnode PRUNER**, not Sui general-purpose indexer pipeline. It provides genuine metrics and a maintainer-confirmed fix in 1.78.2 / 1.79.1, excellent as adjacent evidence for operator runbook memory, but NOT a real indexer-pipeline recurrence or proof of the Indexer Recovery MVP.

## A — Incident Memory
### Target customer / job
Sui smart-contract/dApp engineers and shared developer-support responders. Job: when an onchain execution case recurs, find an evidence-backed previously confirmed resolution rather than re-investigating from scratch.

### Existing alternatives / kill search
- Sui Move Trace Debugger: replay+trace, breakpoints and PTB command inspection.
- Sui error docs: execution vs transport taxonomy; gRPC transaction failure variants.
- Incident.io and Rootly: general incident history and prior similar incidents with AI. Claiming *general-purpose past-incident memory* is not novel.
- GitHub issue search / internal postmortems: free alternatives. Our wedge has to be onchain digest verification plus version-scoped human-confirmed fix, reusable across a curated Sui ecosystem.
Evidence: https://docs.sui.io/references/ide/debugger ; https://www.docs.sui.io/develop/testing-debugging/common-errors ; https://rootly.com/why-rootly ; https://help.incident.io/articles/2917814905-ai-feature%3A-assistant

### Proposed distinct MVP (DO NOT expand)
1. Paste one **real, existing** Sui onchain transaction digest.
2. Tatum gRPC LedgerService.GetTransaction (read mask effects, transaction, events if useful), normalize status / error code / package / metadata; distinguish failed onchain execution from transport exceptions that leave no digest.
3. Show *evidence card* and candidate prior cases from Walrus, but never declare a likely resolution if error class or package/version differs; require confirmation of environment (SDK/package version).
4. Human engineer records and approves resolution. Store structured verified case in Walrus; wait for completed job and record blob_id + proof.
5. Import later genuine analogous digest. Display changed recommendation + source case; new resolution if user corrects it.
6. Require review/manual action; no automatic chain execution or code patch.

### Evidence checklist (kill gates)
- TWO real failure digests of same error class, with verified human remediation. **UNPROVEN**.
- Tatum gRPC on Mainnet responds with fields needed to normalize those digests. **UNPROVEN**.
- Mainnet Walrus job completion+recall after restart. **UNPROVEN**.
- At least one engineer / support maintainer validates usefulness and notes unmet need. **UNPROVEN**.
- 10+ genuine case memories (not artificial filler; a variety of verified failure classes). **UNPROVEN**.
- Track eligibility for developer operations. **UNCERTAIN**.

### Judge demo architecture (2–3 mins; intended, not recorded)
00:00-00:20: two engineering tickets with similar symptoms, no shared resolution.
00:20-00:45: first real digest -> fetched Tatum status/effects -> inspect.
00:45-01:10: engineer verifies fix (don't fake resolution) -> Walrus async Mainnet write completion (blob proof).
01:10-01:40: second real digest -> Walrus recall -> matching checks -> recommended reviewed playbook, provenance.
01:40-02:05: mismatching case explicitly NOT matched; show why + uncertainty.
02:05-02:30: proof drawer with Tatum call, memory blob, 10+ memory inventory; product payoff.

### Narrow scope
No general debugging engine, public error-feed crawler, autonomous repair, cross-chain support, GitHub bot, unrestricted shared access, or 'AI always knows root cause'. One incident type, two real digests, verified case lifecycle, memory provenance.

### Product Critic
- Real pain: YES for troubleshooting and repeated incidents; cross-team willing participation unproven.
- Differentiation: CONDITIONAL; if only 'AI explains failed tx', FAIL.
- User value: credible if someone actually reuses a verified case.
- Technical: feasible with gRPC and MemWal if credentials and two digests exist.
- Verdict: MODIFY. Advance as #1 ecosystem candidate, contingent on collecting authentic cases and proving sponsor tech.

## B — Indexer Recovery
### Target customer / job
Operators of Sui general-purpose indexer pipelines or custom checkpoint consumers. Job: interpret stalled / lagging pipelines and retrieve version-aware *human-approved* recovery playbooks.

### Alternatives / kill search
- Sui official indexer metrics, watermark SQL, Prometheus and health endpoint already identify lag and aid troubleshooting.
- General incident/SRE tools already recall past operational incidents, so memory alone doesn't establish product novelty.
- New claim needs constrained Sui data-pipeline diagnosis context and integration with actual operator metrics.
Evidence: https://www.docs.sui.io/operators/data-management/indexer-stack-setup ; https://www.docs.sui.io/operators/observability ; https://rootly.com/why-rootly

### Proposed distinct MVP
1. Use Tatum gRPC for live network tip (e.g. checkpoint from LedgerService).
2. Connect a real running indexer scrape endpoint / read-only SQL watermark or actual monitored pipeline endpoint; display freshness and lag, not just a static number.
3. Compute pipeline lag and distinguish stale telemetry, a caught-up pipeline, and an actual lag trend. Never attribute cause from lag alone.
4. Operator records symptom fingerprint, environment, pipeline name, version, confirmed cause, corrective action (human only), and evidence. Persist via Walrus Mainnet.
5. On later recurrence, recall cases and filter for exact pipeline/version/symptom; show a suggested runbook for human review.
6. Confirm after-action checkpoint movement with new real measurements; avoid claiming 'auto recovery'.

### Evidence checklist (kill gates)
- Real accessible indexer metrics or read-only watermark data: **UNPROVEN**.
- Tatum Mainnet checkpoint response: **UNPROVEN**.
- A real observed indexer lag recurrence and verified fix: **UNPROVEN**.
- Walrus Mainnet memory persists across sessions: **UNPROVEN**.
- A replay/safe test scenario that is clearly labeled as test data, not fake production: **UNPROVEN**.

### Judge demo architecture
00:00-00:20: live tip vs local indexer watermark (real sources separately labeled).
00:20-00:45: monitor lag and show affected pipeline + freshness.
00:45-01:10: operator reviews cause, records verified runbook, waits for Walrus blob proof.
01:10-01:40: later genuine recurrence / reproducible controlled local pipeline lag -> same runbook retrieved, exact version checks.
01:40-02:00: stale metrics or unrelated pipeline does NOT get unsafe recommendation.
02:00-02:30: checkpoint recovery evidence + memories inventory + operator benefit.

### Narrow scope
One pipeline/one metric source; no Kubernetes integrations, autonomous shell repair, full log ingestion, validator cluster monitoring, anomaly ML, real-time on-call system, invented uptime metrics. A real local indexer is the biggest setup cost.

### Product Critic
- Real pain: YES for operators; developer population much smaller than Incident Memory.
- Differentiation: moderate with real telemetry and verified runbooks, weak otherwise.
- Technical: pipeline metric feed + recurrence are substantial additional dependencies.
- Verdict: MODIFY / CONDITIONAL; do not call it validated until telemetry exists.

## Comparative decision
| Factor (qualitative, provisional) | Incident Memory | Indexer Recovery |
|---|---|---|
| Pain and evidence | High | High |
| Sponsor tech fit | High if Tatum confirms errors | High if live tip and metrics |
| Track fit | Uncertain B2B agent | Uncertain B2B agent |
| Distinctiveness | Medium after Sui-specific wedge | Medium |
| 2–3 minute demo | Strong | Strong with real ops setup |
| Feasibility in remaining days | Medium | Low-medium |
| Evidence availability | Failure digests currently missing | Real indexer metrics currently missing |
| Operator recommendation | #1 | #2 contingent |

Prior consumer finalists remain parked; not implicitly outperformed. Engineering spike in spikes/ validates deterministic safety filters only, against *synthetic* fixtures. Sponsor integrations NOT PROVEN.

## Sources, checked 2026-11-03
- https://thewalrussessions.wal.app/tatum-total-recall
- https://www.docs.sui.io/develop/accessing-data/grpc/using-grpc
- https://www.docs.sui.io/develop/testing-debugging/common-errors
- https://www.docs.sui.io/operators/data-management/indexer-stack-setup
- https://docs.tatum.io/changelog/sui-grpc-available-tatum
- https://docs.wal.app/walrus-memory/sdk/usage/memwal
- https://docs.wal.app/walrus-memory/sdk/cookbook-multi-tenant
- https://github.com/MystenLabs/sui/issues/27768
- https://rootly.com/why-rootly

## Specialist handoff
Completed: source-backed competition kill-search, narrower products and demo films, dependency attack, safety filter spike (13 synthetic-fixture tests pass).
Remaining: actual Tatum gRPC + Walrus Mainnet calls, authentic case pair, operator access, domain user validation, official track-fit clarification.
Blocking issues: absent credentials; no confirmed authentic cases or local indexer metrics.
Recommended next action: try to obtain 2 authentic Sui failed tx digests and Tatum/MemWal account credentials; if incident proof fails promptly, reevaluate against parked EchoLedger/Watchline instead of shipping fiction.
requires_operator_decision: true (human idea/product thesis lock when real options are ready).
