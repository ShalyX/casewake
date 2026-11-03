# DEPENDENCY ATTACK — Incident Memory
Checked: 2026-11-03. No credentials copied to files.
| Dependency | Probability/Impact | Earliest test | Status | Fallback |
|---|---|---|---|---|
| Tatum Mainnet gRPC authentication | High / Critical | SuiGrpcClient with Tatum x-api-key -> real GetTransaction | BLOCKED: no TATUM_API_KEY | Run public Sui gRPC only as separately labeled engineering diagnostic; not sponsor proof |
| Sui failed transaction digest + effect | Medium / Critical | Query one authentic digest from Tatum; inspect Failure result | BLOCKED: no digest | Find confirmed public case digest; do not fabricate |
| Walrus MemWal account/delegate | High / Critical | health; remember; waitForRememberJob; blob_id; recall | BLOCKED: no MEMWAL_PRIVATE_KEY / MEMWAL_ACCOUNT_ID | No substitute for actual Mainnet proof |
| Verified resolved case pair | High / Critical | original source, two similar digests, confirmed fix | UNPROVEN | Use real historic case evidence or self-reproduced test with recorded procedure, never claim independent resolution if unverified |
| 10+ genuine Mainnet memories | High / Critical | completed jobs and blob IDs | BLOCKED until account | Only count real completed writes |
| Shared case write permissions | Medium / High | restrict unsafe unauthenticated write in production | IN DESIGN | One maintainer/admin token protected private API |
| Operational track eligibility | Low–medium / High | organizer confirms B2B dev workflow under Smart Agents | UNKNOWN | Explicitly describe developer workflow agent, keep proof-ready |
