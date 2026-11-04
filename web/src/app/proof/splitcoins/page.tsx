import Link from "next/link";
import simulationProof from "./evidence.json";

const failed = simulationProof.find((r) => r.label === "overdraw");
const corrected = simulationProof.find((r) => r.label === "corrected");
const evidenceHash = "bb08e026fddaebfb1167484755cd088236cab4ed232966f6b706376e2b9aac0e";
const blobId = "keORrsffV8gLkXG8smus_plmk1qUnXC2m2Gv9gyBwAw";
export const metadata = {
  title: "SplitCoins reproduction evidence — Casewake",
  description: "Two unsigned Tatum Sui Mainnet simulations demonstrate an InsufficientCoinBalance failure and a successful controlled correction.",
};
export default function SplitcoinsProof() {
  if (!failed || !corrected) return <main className="proof-page">Missing authenticated simulation evidence.</main>;
  return <main className="proof-page">
    <header className="site-header" style={{height:55,padding:0}}>
      <Link href="/" className="brand"><span className="brand-mark"><span/></span>CASEWAKE</Link>
      <Link href="/workspace" className="quiet-button">Return to workspace ↗</Link>
    </header>
    <article className="proof-container">
      <div className="eyebrow">TECHNICAL PROOF / SIMULATION 001</div>
      <h1>Same transaction structure.<br/><em>One tested correction.</em></h1>
      <p className="proof-intro">Two authentic, read-only requests to Tatum&apos;s Sui Mainnet gRPC simulation service. We deliberately created a 10,000,000 MIST coin, then attempted to split it by different amounts. No wallet signature was used and neither transaction was submitted to the blockchain.</p>
      <div className="proof-compare">
        <section className="proof-case bad">
          <span>01 / SIMULATION FAILED</span>
          <h2>{Number(failed.secondSplitMist).toLocaleString()}</h2>
          <span>MIST REQUESTED</span>
          <p>Requested 20,000,000 MIST from a coin containing 10,000,000 MIST.</p>
          <p><strong>{failed.errorText}</strong></p>
          <p>Execution status: {String(failed.effectSuccess)} · {failed.status}</p>
        </section>
        <section className="proof-case">
          <span>02 / SIMULATION SUCCEEDED</span>
          <h2>{Number(corrected.secondSplitMist).toLocaleString()}</h2>
          <span>MIST REQUESTED</span>
          <p>Requested 5,000,000 MIST from the same 10,000,000 MIST controlled coin.</p>
          <p><strong>No execution error in the simulated result.</strong></p>
          <p>Execution status: {String(corrected.effectSuccess)} · {corrected.status}</p>
        </section>
      </div>
      <div className="proof-hash">EVIDENCE SHA-256 · {evidenceHash}</div>
      <div className="proof-hash">WALRUS MAINNET MEMORY BLOB · {blobId}</div>
      <div className="proof-notes">
        <section>
          <h3>What we have demonstrated</h3>
          <p>A transaction design that reproducibly fails with InsufficientCoinBalance, plus a narrowly changed split amount that passes the same live Mainnet simulation service. The authenticated Tatum responses and reproducible source script are stored in the project evidence folder.</p>
          <p>Provider: {failed.source}. Recorded: {new Date(failed.checkedAt).toLocaleString()}.</p>
          <p>Walrus preserves this result as a <strong>simulation-tested runbook</strong>, independently distinguishable from unverified observations and human-approved repairs.</p>
        </section>
        <section>
          <h3>What this does not prove</h3>
          <p>This did not execute a Mainnet transfer, spend gas, verify a particular historical sender&apos;s balance, or prove a historical transaction was repaired. The provider used mocked gas for both simulations. A real application must inspect the actual coin inputs, earlier commands, gas context, and account permissions before deciding whether to retry.</p>
          <p>These two real failed historical transactions share the class and a failing splitCoins command: <code>XkAz3VrtFLpv...</code> and <code>BbRZD7YfTiiN...</code>. They are not claimed to be the simulated transaction.</p>
        </section>
      </div>
      <p className="proof-intro">Reproduce locally with <code>node scripts/simulate-splitcoins-repro.mjs</code> from the project&apos;s <code>web</code> directory with your own securely configured Tatum key. Read the official <a href="https://www.docs.sui.io/develop/transactions/ptbs/prog-txn-blocks" target="_blank" rel="noreferrer" style={{color:"#c8ed9b",textDecoration:"underline"}}>Sui programmable transaction guide ↗</a>.</p>
    </article>
  </main>;
}
