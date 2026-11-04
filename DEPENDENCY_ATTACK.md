# Dependency Attack — Incident Memory

Updated: 2026-11-04. Never store API keys, delegate keys or reviewer tokens in this file.

| Existential dependency | Result / proof | Status | Remaining risk |
|---|---|---|---|
| Tatum Sui Mainnet gRPC auth | HTTP 200/gRPC status 0, native SDK GetTransaction read with failure status, 100 real tx sample | VERIFIED | Public fullnode retention/pruning means old sample digests can be NOT_FOUND |
| Authentic failed digests | 56 true failed executed Mainnet transactions within 100 sampled, 24 distinct error strings in sample; 3 distinct analogous pairs selected | VERIFIED | These are not a general chain failure rate |
| Walrus Mainnet SDK delegate | SDK signed recall, completed writes, real blob IDs, listMemories count=11 | VERIFIED | SDK/relayer service and rate-limit changes possible |
| Ten real incident memories | 10 distinct Tatum-authenticated failed-execution observations with ten completed Walrus storage receipts | VERIFIED OBSERVATION MEMORIES | No human-verified resolution records yet |
| Later failure matches memory | 3 real distinct later failed digests recalled matching stored observations via app; self-match rejected | VERIFIED OBSERVATION RECALL | A proven *fix* recommendation still unverified |
| Actual engineering resolution applied successfully | No controlled reproduction or independent engineer source proving cause and successful repair for a specific failed transaction | BLOCKED | Requires actual engineer validation and evidence, not a generic docs citation |
| Reviewer-only write access | Local randomly generated WORKSPACE_WRITE_KEY; unauthorized requests rejected 403, unverified reviewer form rejected 400; app bound 127.0.0.1 | VERIFIED LOCALLY | This is not production multi-tenant auth/rate limit |
| Build/runtime dependencies | pnpm install, Next.js production build, TS and lint, running app and real HTTP 200 | VERIFIED | Public deployment and browser integration QA on user environments still needed |
| Track fit to Smart Agents for Real Life | Broad workflow-agent description, no organizer confirmation of B2B dev tooling | UNKNOWN | Could be considered outside intended track |
| Submission assets | Planned DEMO.md but no final video/blog/live deployment | OPEN | Deadline 2026-11-10 17:00 UTC |

## Critical follow-up
Source-backed generic guidance for `InsufficientCoinBalance` and two genuine matching failure digests are documented in `evidence/resolution-verification-queue.md`. No human verified a case-specific successful repair. Do not mark its `verified` checkbox merely because the docs discuss the error.

Next: engineer proves fix; app stores approved resolution on Walrus; second case recalls it; negative controls verify no wrong version/package match. Product lock unchanged.
