# Casewake: When a Sui Failure Teaches the Next Investigation

*Total Recall — Tatum × Walrus Memory Hackathon, November 2026*

A blockchain keeps an exact record of what happened. But a transaction failure rarely comes with the engineering decisions that would make the next occurrence easier to investigate.

A Sui engineer sees `InsufficientCoinBalance`. They inspect the transaction, its arguments, and the programmable transaction commands. Later, another engineer encounters a similar failure and repeats that research. The chain has preserved both transactions; the troubleshooting knowledge may still be scattered across messages, terminal history and tickets.

**Casewake** is a working experiment in giving that engineering context a durable memory. It reads authentic Sui Mainnet failures through **Tatum gRPC**, stores evidence-backed memories through **Walrus Memory on Mainnet**, and retrieves relevant precedents when a compatible failure returns.

There is one boundary we make explicit: **a previously observed failure isn't automatically a verified fix.** Casewake distinguishes an onchain observation, a procedure tested through read-only simulation, and a human-approved historical repair.

## 1. Start with a real transaction, not an imagined scenario

A real failed Sui Mainnet transaction:

`BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6`

Casewake passes the digest to a server-side Tatum Sui Mainnet gRPC call, retrieves transaction effects and input commands, and identifies:

- Execution outcome: **failed**.
- Error: **`InsufficientCoinBalance in command 16`**.
- Failed command type: **`splitCoins`**.

The displayed digest is a public onchain record, not a fabricated example. The frontend never needs a wallet signature, and the Tatum API key stays on the server.

This is what Tatum contributes: authenticated access to the actual chain evidence that anchors the rest of the experience.

## 2. The memory needs more than a similar-looking error

We first collected ten **distinct, real failed-transaction observations** from Tatum's Mainnet transaction stream. Each observation includes its digest, observed error, fingerprint and explorer evidence. Each was stored through Walrus Memory, and we kept its completed Mainnet write-job receipt and blob ID.

That gave the application a useful history of what had failed. It did **not** prove that those problems had been resolved.

Then we tested a specific coin-split failure pattern instead of pretending to have a repaired historical transaction.

Using Tatum's Mainnet `SimulateTransaction` service, we built an unsigned controlled programmable transaction:

- First split: create a **10,000,000 MIST** coin.
- Failing case: request **20,000,000 MIST** from that coin. Simulation returned `FailedTransaction` and `InsufficientCoinBalance in command 1`.
- Corrected controlled case: request **5,000,000 MIST** from the same 10,000,000 MIST coin. Simulation returned a successful `Transaction` status.

Both requests were **read-only simulations with mocked gas**. Neither was signed or executed onchain. This demonstrates a tested troubleshooting pattern; it does **not** establish how the owner of the earlier historical transaction fixed anything.

We saved that precise procedure, outcome pair and limitation as a new Walrus Memory record with the evidence status **`simulation-tested-not-human-verified`**.

The completed Walrus Mainnet blob is:

`keORrsffV8gLkXG8smus_plmk1qUnXC2m2Gv9gyBwAw`

Its evidence SHA-256 is:

`bb08e026fddaebfb1167484755cd088236cab4ed232966f6b706376e2b9aac0e`

The application exposes both simulation outcomes at `/proof/splitcoins` so the claim can be inspected.

## 3. What changed when the memory returned

We queried the first historical failed digest in Casewake. The app fetched its execution state through Tatum, performed one signed Walrus semantic recall, and then validated recalled records against the live error class and failed command.

From the 12 stored Mainnet memories, it returned:

- One earlier genuine onchain failure observation.
- One simulation-tested `splitCoins` runbook.
- Zero human-verified historical repair records.

It displayed the procedure and clearly labeled it **"simulation-tested; historical repair not verified."**

We repeated the lookup for a second real failed digest:

`XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue`

That transaction also failed with `InsufficientCoinBalance` at a `splitCoins` command. Casewake returned the runbook again.

For a negative control, we tried an unrelated genuine `MoveAbort` transaction:

`Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp`

**It did not receive the coin-splitting runbook.** A semantic similarity score alone is not authorization to recommend a remedy.

That's the learning loop: without prior memory, a failure is just a failure. With stored, qualified evidence, the next engineer receives a relevant previously tested procedure, its source and its uncertainty.

## 4. How Tatum and Walrus work together

**Tatum is the source of truth for blockchain execution.** The backend makes authenticated Sui Mainnet gRPC `GetTransaction` requests; a separate controlled test uses `SimulateTransaction`. We never treat a transport timeout as a successful chain event.

**Walrus is the durable memory.** The app calls the MemWal SDK to write structured observations/runbooks and waits for the completed Mainnet blob receipt. Later, it recalls candidates semantically and applies deterministic checks to assign evidence tiers and reject mismatches.

The integration also revealed an operational issue: the installed MemWal SDK's session fallback tried a retired JSON-RPC path. We used a short-lived, signed SEAL session created through Tatum gRPC, leaving the Walrus delegate private key server-side. We then consolidated three competing memory searches into **one** query, reducing load and handling intermittent network read errors with bounded, read-only retries.

The production Next.js application passed a full lint/build and confirmed real Tatum → Walrus recall through its own endpoint.

## 5. Evidence, not a made-up success metric

Our namespace contains **12 completed Walrus Mainnet memories** as of November 4, 2026:

- **10** distinct authentic failed Sui transaction observations.
- **1** controlled simulation-tested troubleshooting runbook.
- **1** earlier integration smoke-test memory.

We do not present that as 12 human-verified repairs. We have **zero** independently approved case-specific historical fixes so far. We have also not measured user time savings or run external usability interviews.

We have deliberately kept Casewake read-only. It does not sign transactions, transfer assets, or automatically repair a wallet's transaction.

## 6. What's next

The next substantive validation is for a real engineer to document a case-specific successful correction, approve it with independent evidence, and have Casewake recall that *verified* resolution for a later compatible failure.

For this hackathon, the product already demonstrates the prerequisite learning architecture with authentic Mainnet data: **the chain remembers what failed; Walrus remembers what we learned from testing the problem.**

**Casewake — the next failure shouldn't start from zero.**

---

## Publication QA checklist (do not publish before links exist)
- [ ] Replace app path with verified public URL.
- [ ] Replace repository reference with public GitHub URL.
- [ ] Add real product screenshot (workspace with matched simulation runbook) and proof-page screenshot, each labeled as actual captured UI.
- [ ] Verify every digest in Sui explorer and links from logged-out browser.
- [ ] Show at least one sponsor source URL and the event name.
- [ ] Confirm 12 stored memories (or update measured number) before posting.
- [ ] Preserve the simulation/historical-repair distinction throughout.
- [ ] Publish to a public blog host and record URL in `SUBMISSION.md`; **NOT PUBLISHED** at draft time.

**Sources:** Walrus SDK https://docs.wal.app/walrus-memory/sdk/usage/memwal · Sui PTBs https://www.docs.sui.io/develop/transactions/ptbs/prog-txn-blocks · Hackathon rules https://thewalrussessions.wal.app/tatum-total-recall · Tatum Sui docs https://docs.tatum.io/reference/rpc-sui
