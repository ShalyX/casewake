# RESEARCH — Total Recall

Checked: 2026-11-01

## A. Observed Pain Points

### 1. Transaction meaning decays quickly
user: people reviewing personal/crypto transaction histories
problem: raw transaction descriptions and wallet addresses often do not preserve human meaning; users repeatedly re-label or re-categorize the same activity
severity: medium-high because bad categories make budgeting/insights untrustworthy
frequency: recurring monthly and whenever a known counterparty reappears
current workaround: manual categories, static transaction rules, notes, spreadsheets
existing solutions: PocketGuard transaction rules, wallet notes/labels, finance trackers
evidence: recent budgeting discussions repeatedly describe wrong categories and manual corrections; crypto wallet users ask for persistent transaction labels
hackathon fit: excellent Consumer Finance fit
technology fit: Tatum supplies Sui wallet activity; Walrus Memory stores user-specific labels, corrections, spending rules, and remembered counterparty meaning
demo potential: very high — correct once, then visibly classify/explain a new transaction differently
implementation risk: low-medium

### 2. AI assistants lose project context across sessions/tools
user: AI builders, researchers, operators
problem: decisions and preferences must be re-explained after context loss or tool switching
severity: high for repeated work
frequency: frequent across long projects and multi-tool workflows
current workaround: copy/paste old chats, markdown handoffs, manual notes
existing solutions: built-in memories, RAG stores, project docs, Walrus Memory MCP itself
evidence: recent user reports mention repeated 10–20 minute context rebuilding and resurrected rejected decisions
hackathon fit: direct Smart Agents fit
technology fit: Walrus excellent; Tatum weaker unless the agent workflow is inherently onchain
demo potential: high, but differentiation risk is high because portable memory is already the sponsor primitive
implementation risk: low; product originality risk: high

### 3. Wallet monitoring systems know events, not owner intent
user: crypto users/teams watching wallet activity
problem: monitoring tools can show transfers but do not know which counterparties are trusted, which amounts are normal, or which recurring patterns are expected for this specific user/team
severity: high when alerts are noisy or genuine anomalies are buried
frequency: every monitoring cycle
current workaround: manual address books, static allowlists, dashboards, human review
existing solutions: explorers, security APIs, analytics dashboards, hard-coded alert rules
hackathon fit: excellent Smart Agents fit
technology fit: Tatum Sui RPC naturally supplies activity/balances; Walrus stores learned escalation rules and prior dispositions
demo potential: very high — identical raw event can produce different action after memory is learned
implementation risk: medium

### 4. Prediction users lack durable source-specific credibility memory
user: sports/market forecasters
problem: people consume many takes but rarely maintain structured records of who was right, on what topics, under what confidence
severity: medium
frequency: every event cycle
current workaround: spreadsheets, pick journals, intuition
existing solutions: prediction dashboards, analyst rankings, notebooks
hackathon fit: excellent Markets & Sports track fit
technology fit: Walrus stores picks/outcomes/source trust; Tatum can provide onchain reads where relevant, but the Tatum role must be made non-artificial
demo potential: high
implementation risk: medium

## B. Evidence
- https://www.reddit.com/r/PocketGuard/comments/1udd5f1/ — recurring wrong categories and repeated manual cleanup.
- https://www.reddit.com/r/PocketGuard/comments/1v9ow46/ — static transaction rules exist because users repeatedly fix the same merchant.
- https://www.reddit.com/r/iosapps/comments/1t6gyg0/ — finance app builder/user feedback that bank categories often do not match personal meaning.
- https://www.reddit.com/r/Bitcoin/comments/wgnznw/ — demand for wallet transaction notes/labels so history remains understandable.
- https://www.reddit.com/r/AIDiscussion/comments/1w1rgle/ — long AI sessions losing decisions/context and forcing reconstruction.
- https://www.reddit.com/r/ollama/comments/1n7h8ox/ — cross-tool assistant context loss and manual handoff workarounds.
- Tatum Sui RPC supports balance, object, event, and transaction-block queries: https://docs.tatum.io/reference/rpc-sui
- Walrus Memory supports remember/recall/analyze and encrypted Mainnet-backed memory through the relayer: https://docs.wal.app/walrus-memory/sdk/usage/memwal

## C. Current Workarounds
Static rules; address books; spreadsheet notes; copy/paste context; manual project docs; generic categorization; explorer history; alert thresholds.

## D. User Segments
1. Consumer crypto/Sui wallet users who want understandable history.
2. Small teams/treasuries that need adaptive wallet monitoring.
3. AI-heavy knowledge workers with cross-session context loss.
4. Prediction hobbyists who track analysts/picks.

## E. Existing Alternatives
PocketGuard/YNAB-like categorization; wallet labels; block explorers; wallet security dashboards; generic AI memory/RAG; pick journals.

## F. Technology / Sponsor Match
Strongest sponsor-native pattern: Tatum = observable onchain facts; Walrus Memory = durable user-specific interpretation of those facts. The product should visibly behave differently because of past corrections or preferences.

## G. Opportunity Strength
1. Adaptive wallet/finance categorization — STRONGEST.
2. Adaptive wallet monitoring/escalation agent — STRONG.
3. Prediction source-trust journal — MEDIUM-STRONG.
4. Generic cross-agent memory assistant — WEAK/MEDIUM due sponsor-primitive overlap.

## H. Risks
- Avoid storing secrets/private keys in memory.
- Do not claim fraud detection without evidence.
- Avoid a generic dashboard where memory is invisible.
- Mainnet writes are existential; spike early.
- Tatum RPC must be real, visible, and reproducible.

## I. Recommendation to Operator
Advance three materially different concepts to ideation gate, with adaptive wallet/finance categorization as the recommended thesis because it maximizes natural Tatum usage, visible Walrus learning, demo clarity, and feasible scope.
