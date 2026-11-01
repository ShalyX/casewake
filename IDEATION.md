# IDEATION — Total Recall

## Eliminated early
- Generic chatbot with persistent memory — sponsor primitive, weak product insight.
- Generic expense tracker — crowded; memory could be decorative.
- Cross-tool memory dashboard — too close to Walrus Memory's own MCP/plugin value proposition.
- Pure onchain explorer — Tatum fit strong but Walrus learning loop weak.
- Generic prediction dashboard — track fit but weak differentiation unless source trust actually learns.

## Candidate 1 — EchoLedger
Track: Consumer Finance Apps
Thesis: A personal transaction intelligence app that learns what wallet activity means to *you*. Tatum reads real Sui activity; Walrus Memory stores durable counterparty labels, category corrections, recurring-payment meaning, and personal rules. Correct something once and the next related transaction is automatically explained/categorized using recalled memory.

Magic moment:
1. Raw Sui transaction appears as an opaque address/amount.
2. User says: “That address is my rent wallet; transfers around 12 SUI are Housing.”
3. EchoLedger writes the correction/rule to Walrus Memory Mainnet.
4. A later transaction to the same/related counterparty arrives from Tatum RPC and is automatically labeled Housing, with “learned from your prior correction” visible.

Why memory is essential: without durable personal memory the chain cannot know semantic meaning or user preference.
Why Tatum is essential: it supplies the real onchain transaction/balance state being interpreted.
Scope: one wallet, recent transactions, correction/teach UI, memory-backed reclassification, memory proof panel.
Kill condition: if Sui RPC data cannot be queried reliably or Mainnet remember/recall cannot be proven quickly.

Scores (1–5): severity 4, evidence 5, rubric 5, tech fit 5, differentiation 4, demo 5, feasibility 5, evidence potential 4, time-to-magic 5. Total: 42/45.

## Candidate 2 — Watchline
Track: Smart Agents for Real Life
Thesis: An adaptive wallet-monitoring agent that learns *your* escalation rules instead of blasting static alerts. Tatum watches Sui wallet events; Walrus remembers which counterparties, amounts, patterns, and prior dispositions are normal, suspicious, or ignorable.

Magic moment:
1. Agent sees two transfers that look equally unusual from raw chain data.
2. Memory recalls that one counterparty was previously approved and one is new.
3. Known transfer is suppressed/low-priority; new transfer is escalated with reasoning.
4. User corrects the agent; the next similar event changes behavior.

Why memory is essential: alert policy is personalized and learned from prior dispositions.
Why Tatum is essential: real wallet events and balances drive the agent.
Scope: one wallet, polling/manual refresh, rule memory, explainable alert ranking, correction loop.
Kill condition: if the demo drifts into unsupported “fraud detection” claims rather than personalized anomaly/escalation behavior.

Scores: severity 4, evidence 4, rubric 5, tech fit 5, differentiation 4, demo 5, feasibility 4, evidence potential 4, time-to-magic 4. Total: 39/45.

## Candidate 3 — Signalbook
Track: Markets & Sports Prediction
Thesis: A prediction journal that learns which sources deserve trust for which topics. Users log picks and cited sources before events; Walrus remembers outcomes and topic-specific credibility, then future forecasts weight sources based on their actual history rather than follower count.

Magic moment:
1. User records two sources making conflicting picks.
2. Past outcome memories show Source A is strong on football but weak on macro; Source B is the reverse.
3. Signalbook changes its source weighting for the current topic and explains why.
4. New outcomes update those memories over time.

Why memory is essential: credibility is longitudinal and topic-specific.
Why Tatum is essential: must be tied to real onchain/prediction-market data or Sui proof; currently less natural than candidates 1/2.
Scope: pick capture, source profiles, remembered outcome score, one external/onchain market feed.
Kill condition: if Tatum integration remains bolted on.

Scores: severity 3, evidence 3, rubric 4, tech fit 3, differentiation 4, demo 4, feasibility 4, evidence potential 3, time-to-magic 4. Total: 32/45.

## Operator recommendation
Choose Candidate 1 — EchoLedger.
Reason: strongest combined sponsor fit, clearest learning loop, easiest judge-visible before/after, strong real pain evidence, and smallest reliable vertical slice. Candidate 2 is the best higher-drama alternative if we want an agent-first story.
