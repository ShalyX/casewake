import Link from "next/link";

function Brand() {
  return <Link className="brand" href="/"><span className="brand-mark"><span/></span><span>CASEWAKE</span></Link>;
}

export default function Home() {
  return (
    <main className="home">
      <div className="ambient ambient-one" aria-hidden="true" />
      <header className="site-header container">
        <Brand />
        <nav aria-label="Primary"><a href="#method">Method</a><a href="#why">Why it matters</a><Link href="/workspace" className="nav-cta">Open workspace <span>↗</span></Link></nav>
      </header>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> SUI ENGINEERING INTELLIGENCE <span className="slash">/</span> EARLY BUILD</div>
          <h1>The failure ends.<br/><em>The lesson</em><br/>shouldn&apos;t.</h1>
          <p>Real onchain failure evidence, remembered precedents, and simulation-tested troubleshooting. When the same failure returns, the investigation no longer starts at zero.</p>
          <div className="hero-actions"><Link href="/workspace" className="primary-button">Investigate an incident <span>↗</span></Link><a href="#method" className="quiet-button">See the method <span>↓</span></a></div>
          <div className="trust-line"><span className="tiny-square"/> Read-only Sui evidence <span className="dot-separator">·</span> Reviewer-approved memory <span className="dot-separator">·</span> No automatic chain actions</div>
        </div>
        <div className="hero-stage" aria-label="Conceptual example showing one real failed Sui transaction and a previously observed related failure without a confirmed fix">
          <div className="stage-topline"><span>01 / A REPEATED FAILURE</span><span>TRANSACTION EVIDENCE <b>●</b></span></div>
          <div className="stage-field">
            <div className="stage-noise"><span>THE CHAIN REMEMBERS</span><strong>WHAT<br/>FAILED.</strong></div>
            <div className="stage-error"><div className="stage-card-head"><span className="icon-x">×</span><span>EXECUTION FAILED</span><span className="mono">SUI MAINNET</span></div><div className="stage-code">MoveAbort<span> / </span>transaction</div><div className="stage-id">DIGEST · Bh2xSsAp…HC9Byp</div></div>
            <div className="stage-axis" aria-hidden="true"><div className="axis-line"/><div className="axis-node">+</div><div className="axis-line"/></div>
            <div className="stage-solution"><div className="stage-card-head"><span className="icon-check">↝</span><span>RELATED FAILURE OBSERVED</span><span className="mono">WALRUS RECALL</span></div><h3>We&apos;ve seen<br/>this before.</h3><p>A similar genuine onchain failure was remembered. Its engineering resolution is still awaiting confirmation.</p><div className="stage-foot"><span>REVIEW ORIGINAL ONCHAIN EVIDENCE</span><span>↗</span></div></div>
          </div>
          <div className="stage-bottom"><span>01 — OBSERVE</span><span>02 — CONFIRM</span><span>03 — REMEMBER</span><span>04 — REUSE</span></div>
        </div>
      </section>
      <section id="method" className="method container">
        <div className="section-head"><div><div className="eyebrow dim">THE OPERATING PRINCIPLE / 001</div><h2>Not another error explainer.<br/><span>A record of what worked.</span></h2></div><p>Every recommendation must survive evidence checks. Matching words alone are never enough.</p></div>
        <div className="method-grid">
          <article><div className="method-index">01 <span>↘</span></div><h3>Observe the facts.</h3><p>Import a genuine Sui digest. Tatum provides onchain execution evidence, not speculation.</p></article>
          <article><div className="method-index">02 <span>↘</span></div><h3>Confirm the fix.</h3><p>A person validates the diagnosis, resolution steps, environment and supporting proof.</p></article>
          <article><div className="method-index">03 <span>↘</span></div><h3>Remember with proof.</h3><p>Walrus preserves the verified case. A completed memory write returns a real blob ID.</p></article>
          <article><div className="method-index">04 <span>↗</span></div><h3>Make the next call better.</h3><p>Compatible incidents surface earlier learning. Mismatches are held back for investigation.</p></article>
        </div>
      </section>
      <section id="why" className="manifesto"><div className="container manifesto-inner"><div className="eyebrow">A SHARED ENGINEERING ADVANTAGE</div><h2>Blockchains preserve<br/><i>the event.</i><br/>We preserve <i>the answer.</i></h2><p>A source-backed memory of engineering decisions is more valuable than another page of raw transaction logs.</p><Link href="/workspace" className="primary-button">Enter the workspace <span>↗</span></Link></div></section>
      <footer className="site-footer container"><Brand /><span>12 completed Mainnet memories · simulation-tested runbook · historical repairs not claimed.</span><span>Built for Total Recall / 2026</span></footer>
    </main>
  );
}
