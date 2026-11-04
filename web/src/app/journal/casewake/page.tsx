import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casewake: when a Sui failure teaches the next investigation",
  description: "How Casewake uses Tatum Mainnet execution evidence and Walrus durable memory to recall simulation-tested troubleshooting guidance without inventing historical repairs.",
};

const A = "BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6";
const B = "XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue";
const C = "Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp";

export default function CasewakeJournal() {
  return <main className="journal-page">
    <header className="journal-header">
      <Link href="/" className="brand"><span className="brand-mark"><span/></span><span>CASEWAKE</span></Link>
      <nav><Link href="/workspace">Open workspace ↗</Link><Link href="/">Home</Link></nav>
    </header>
    <article className="journal-container">
      <div className="journal-meta">ENGINEERING NOTES <span>/</span> NOV 4, 2026 <span>/</span> 8 MIN READ</div>
      <h1>When a failure teaches<br/><em>the next investigation.</em></h1>
      <p className="journal-lead">A Sui transaction records what failed. What it does not preserve is the engineering context needed to make the next investigation easier. We built Casewake to remember that context—with its evidence and uncertainty intact.</p>
      <div className="journal-byline"><span>CASEWAKE / TOTAL RECALL</span><span>Built with Tatum and Walrus Memory</span></div>

      <figure className="journal-figure">
        <Image src="/images/casewake-live-workspace.png" width={1440} height={1350} alt="Actual Casewake browser screenshot showing a real InsufficientCoinBalance transaction and a matching simulation-tested Walrus runbook." sizes="(max-width: 900px) 100vw, 1000px" />
        <figcaption>Actual local production-mode screenshot, November 4, 2026: Tatum chain evidence beside the Walrus-recalled runbook. No synthetic transaction data was substituted.</figcaption>
      </figure>

      <section><div className="journal-section-number">01 / THE PROBLEM</div>
        <h2>The chain remembers the event.<br/>Not the reasoning.</h2>
        <p>A Sui engineer investigates a failed programmable transaction. They inspect the actual command, coin inputs, gas context and error class. Weeks later, somebody else sees a similar failure and has to repeat the same research.</p>
        <p>Casewake is an experiment in making that work reusable. It is not a generic error-explainer and it does not sign or repair transactions. It pairs genuine Sui Mainnet events with a memory of previous observations and tested procedures.</p>
        <p>The distinction matters: an observed failure is not a verified fix, and a successful simulation is not evidence that someone repaired a historical wallet transaction.</p>
      </section>

      <section><div className="journal-section-number">02 / REAL MAINNET EVIDENCE</div>
        <h2>Start with a transaction<br/>that really failed.</h2>
        <p>We investigated the genuine Sui Mainnet digest <code>{A}</code>. A server-side Tatum Sui gRPC <code>GetTransaction</code> request returned a failed execution: <code>InsufficientCoinBalance in command 16</code>. The failing command in the transaction payload was <code>splitCoins</code>.</p>
        <p>The identity of the transaction, error and command is anchored in the chain. The frontend does not need to handle a wallet signature or the Tatum API key.</p>
        <div className="journal-source"><span>CHAIN RECEIPT / PUBLIC EVIDENCE</span><a href={"https://suivision.xyz/txblock/"+A} target="_blank" rel="noreferrer">Inspect the historical transaction ↗</a></div>
      </section>

      <section><div className="journal-section-number">03 / TESTING A HYPOTHESIS</div>
        <h2>What happens if we<br/>change the split?</h2>
        <p>Rather than inventing an engineer-approved repair, we created two controlled, unsigned programmable transactions and sent them to the Tatum Sui Mainnet <code>SimulateTransaction</code> endpoint.</p>
        <div className="journal-comparison">
          <div className="journal-case bad"><span>01 / FAILED SIMULATION</span><strong>20,000,000</strong><small>MIST requested from a 10,000,000 MIST coin</small><p>Result: <code>InsufficientCoinBalance in command 1</code></p></div>
          <div className="journal-case good"><span>02 / SUCCESSFUL SIMULATION</span><strong>5,000,000</strong><small>MIST requested from the same 10,000,000 MIST coin</small><p>Result: successful simulated transaction</p></div>
        </div>
        <p>That demonstrates a reproducible failure pattern and one simulation-tested correction. Both runs used mocked gas, and neither was signed, submitted, or executed onchain. We did not confirm which change was used by the sender of the historical failed transaction.</p>
        <figure className="journal-figure small">
          <Image src="/images/casewake-simulation-proof.png" width={1440} height={1100} alt="Recorded Casewake proof page contrasting a failed coin-split simulation with a successful smaller split and displaying the Walrus evidence blob." sizes="(max-width: 900px) 100vw, 1000px" />
          <figcaption>The dedicated Casewake proof page uses the actual saved Tatum simulation responses, not a reconstructed success story.</figcaption>
        </figure>
        <div className="journal-source"><span>REPRODUCIBLE TEST</span><Link href="/proof/splitcoins">See the simulation evidence ↗</Link></div>
      </section>

      <section><div className="journal-section-number">04 / MEMORY WITH BOUNDARIES</div>
        <h2>Give the next incident<br/>a usable precedent.</h2>
        <p>We saved ten distinct, genuine failed-transaction observations to Walrus Memory Mainnet, each with its own completed storage receipt and source digest. We then stored our controlled <code>splitCoins</code> runbook as a new memory, explicitly labeled <strong>simulation-tested, not human-verified</strong>.</p>
        <p>When the next compatible failure appears, Casewake makes one semantic Walrus recall request, then performs deterministic checks before showing a recommendation. It matches the onchain error class and the failed command type. It presents the procedure with evidence, not as an automatic repair.</p>
        <div className="journal-receipt">
          <span>WALRUS MAINNET / COMPLETED MEMORY</span>
          <strong>keORrsffV8gLkXG8smus_plmk1qUnXC2m2Gv9gyBwAw</strong>
          <span>EVIDENCE SHA-256</span>
          <code>bb08e026fddaebfb1167484755cd088236cab4ed232966f6b706376e2b9aac0e</code>
        </div>
        <p>Two distinct genuine failures—<code>{A}</code> and <code>{B}</code>—both retrieved this tested runbook. But a different genuine <code>MoveAbort</code> transaction, <code>{C}</code>, did not. Similar words are not a license to apply a remedy to the wrong incident.</p>
        <div className="journal-source"><span>NEGATIVE CONTROL / PUBLIC EVIDENCE</span><a href={"https://suivision.xyz/txblock/"+C} target="_blank" rel="noreferrer">Inspect the unrelated MoveAbort ↗</a></div>
      </section>

      <section><div className="journal-section-number">05 / WHY TWO SPONSORS</div>
        <h2>Tatum tells us what happened.<br/>Walrus remembers what we learned.</h2>
        <p>Tatum Sui Mainnet gRPC infrastructure provides the execution evidence: transaction digest, status, error and command details. Its simulator also let us reproduce a failure without moving funds.</p>
        <p>Walrus Memory persists structured observations and the tested runbook. We wait for the async memory write to finish and return a Mainnet blob ID. Later, semantic recall finds relevant material, while deterministic filters determine which evidence tier can be displayed.</p>
        <p>The integration revealed a real engineering problem: the installed MemWal SDK fell back to a retired JSON-RPC endpoint while preparing its session. We built a short-lived signed SEAL session using our authenticated Tatum gRPC client. We also consolidated three competing recall queries into one and added bounded retries to read-only requests. We never automatically retry an uncertain memory write.</p>
      </section>

      <section><div className="journal-section-number">06 / WHAT IS ACTUALLY VERIFIED</div>
        <h2>Twelve stored memories.<br/>Zero invented repairs.</h2>
        <div className="journal-stats"><div><strong>10</strong><span>Genuine onchain failure observations</span></div><div><strong>1</strong><span>Controlled simulation-tested runbook</span></div><div><strong>1</strong><span>Integration smoke-test memory</span></div></div>
        <p>All twelve were completed Walrus Mainnet writes as of November 4, 2026. That does not mean twelve verified fixes. We have <strong>zero</strong> independent human approvals of a case-specific historical repair, and we have not measured time saved for an external engineering team.</p>
        <p>The next important proof is a real engineer reproducing and confirming a fix for a specific incident, with independent evidence and a reviewer sign-off. Casewake can store and later recall that tier of memory, but the hackathon demonstration does not fake that gate.</p>
      </section>
      <div className="journal-end">
        <span>THE NEXT FAILURE SHOULD NOT START FROM ZERO.</span>
        <h2>Casewake</h2>
        <p>Evidence first. Reuse what was genuinely learned. Keep the uncertainty visible.</p>
        <div><Link className="primary-button compact" href="/workspace">Try the live investigation <span>↗</span></Link><a className="secondary-button" href="https://github.com/ShalyX/casewake" target="_blank" rel="noreferrer">Source and receipts ↗</a></div>
      </div>
      <footer className="journal-sources"><strong>SOURCES / IMPLEMENTATION</strong><a href="https://docs.wal.app/walrus-memory/sdk/usage/memwal" target="_blank" rel="noreferrer">Walrus Memory SDK ↗</a><a href="https://www.docs.sui.io/develop/transactions/ptbs/prog-txn-blocks" target="_blank" rel="noreferrer">Sui programmable transactions ↗</a><a href="https://docs.tatum.io/reference/rpc-sui" target="_blank" rel="noreferrer">Tatum Sui RPC ↗</a><a href="https://thewalrussessions.wal.app/tatum-total-recall" target="_blank" rel="noreferrer">Hackathon rules ↗</a></footer>
    </article>
  </main>;
}
