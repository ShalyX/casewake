"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Status = { tatumConfigured: boolean; walrusConfigured: boolean; reviewerWritesEnabled: boolean; network: string; checksAreLive: boolean };
type Transaction = { digest: string; network: string; source: string; observedAt: string; outcome: "failed" | "succeeded" | "unknown"; errorText: string | null; fingerprint: string | null; packageId: string | null };
type Case = { id: string; digest: string; diagnosis: string; resolutionSteps: string; evidenceUrl: string; reviewer: string; verifiedAt: string; errorText: string; sdkVersion: string | null };
type Candidate = { record: Case; distance: number; verdict: "eligible-for-review" | "incompatible"; reasons: string[] };
type Proof = { jobId: string; blobId: string; owner: string; namespace: string; status: string };

async function postJson(path: string, body: unknown, key?: string) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", ...(key ? { "x-workspace-key": key } : {}) },
    body: JSON.stringify(body),
  });
  const result = await response.json() as Record<string, unknown>;
  if (!response.ok) throw new Error(String(result.error || "Request failed"));
  return result;
}
function shortDigest(value: string) { return value.length > 19 ? value.slice(0, 12) + "…" + value.slice(-7) : value; }

export default function Workspace() {
  const [status, setStatus] = useState<Status | null>(null);
  const [digest, setDigest] = useState("");
  const [tx, setTx] = useState<Transaction | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [recallNote, setRecallNote] = useState("");
  const [phase, setPhase] = useState<"idle" | "reading" | "recalling" | "writing">("idle");
  const [error, setError] = useState("");
  const [proof, setProof] = useState<Proof | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [resolutionSteps, setResolutionSteps] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [sdkVersion, setSdkVersion] = useState("");
  const [reviewerKey, setReviewerKey] = useState("");
  const [verified, setVerified] = useState(false);
  useEffect(() => { fetch("/api/status").then((r) => r.json()).then(setStatus).catch(() => setError("Status endpoint unavailable.")); }, []);

  async function inspect(override?: string) {
    const value = (override || digest).trim();
    if (!value) { setError("Enter a transaction digest."); return; }
    setError(""); setRecallNote(""); setProof(null); setCandidates([]); setTx(null);
    try {
      setPhase("reading");
      const result = await postJson("/api/transaction", { digest: value });
      const observed = result.transaction as Transaction;
      setTx(observed);
      if (observed.outcome === "failed" && status?.walrusConfigured) {
        setPhase("recalling");
        const recalled = await postJson("/api/recall", { digest: observed.digest });
        setCandidates((recalled.candidates || []) as Candidate[]);
        setRecallNote(String(recalled.reason || ""));
      } else if (observed.outcome === "failed") {
        setRecallNote("Walrus Memory has not been configured. Transaction evidence is separate from persistent recall.");
      } else {
        setRecallNote("A saved resolution is never suggested for a non-failed transaction.");
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Unexpected lookup error."); }
    finally { setPhase("idle"); }
  }

  async function remember() {
    if (!tx || tx.outcome !== "failed") return;
    setError(""); setProof(null);
    try {
      setPhase("writing");
      const result = await postJson("/api/remember", {
        digest: tx.digest, diagnosis, resolutionSteps, evidenceUrl, reviewer, sdkVersion, verified,
      }, reviewerKey);
      setProof(result.proof as Proof);
      setShowEditor(false);
      setPhase("recalling");
      const recalled = await postJson("/api/recall", { digest: tx.digest });
      setCandidates((recalled.candidates || []) as Candidate[]);
      setRecallNote(String(recalled.reason || ""));
    } catch (e) { setError(e instanceof Error ? e.message : "Memory write failed."); }
    finally { setPhase("idle"); }
  }

  const eligible = candidates.filter((c) => c.verdict === "eligible-for-review");
  const rejected = candidates.filter((c) => c.verdict === "incompatible");
  const busy = phase !== "idle";
  return (
    <main className="workspace-shell">
      <header className="workspace-header">
        <Link href="/" className="brand"><span className="brand-mark"><span/></span><span>INCIDENT<span className="brand-light">/MEMORY</span></span></Link>
        <nav><span className="workspace-env"><span className="pulse"/> SUI MAINNET</span><Link href="/">About <span>↗</span></Link></nav>
      </header>
      <div className="workspace-container">
        <div className="workspace-title-row">
          <div><div className="eyebrow dim">ENGINEERING INTELLIGENCE / WORKSPACE 01</div><h1>Investigate. <span>Remember.</span></h1><p>Read authentic chain evidence, compare verified precedents, and preserve the next useful fix.</p></div>
          <div className="workspace-meta"><span>READ-ONLY CHAIN ACCESS</span><strong>NO AUTO-REMEDIATION</strong></div>
        </div>

        <div className="health-row" role="status">
          <div><span className={status?.tatumConfigured ? "health-indicator ready" : "health-indicator"} /> Tatum gRPC <b>{status ? (status.tatumConfigured ? "Key configured · not yet connection-tested" : "Key required") : "Checking…"}</b></div>
          <div><span className={status?.walrusConfigured ? "health-indicator ready" : "health-indicator"} /> Walrus Memory <b>{status ? (status.walrusConfigured ? "Credentials configured · not yet connection-tested" : "Credentials required") : "Checking…"}</b></div>
          <div><span className={status?.reviewerWritesEnabled ? "health-indicator ready" : "health-indicator"} /> Reviewer writes <b>{status?.reviewerWritesEnabled ? "Guarded" : "Disabled"}</b></div>
        </div>

        <div className="workspace-grid">
          <section className="workspace-primary">
            <div className="panel panel-search">
              <div className="panel-kicker"><span>01 / TRANSACTION INTAKE</span><span>AUTHENTIC SOURCE REQUIRED</span></div>
              <h2>Start with the evidence.</h2>
              <p>No synthetic example is silently substituted when the gateway is unavailable.</p>
              <form className="digest-form" onSubmit={(event) => { event.preventDefault(); void inspect(); }}>
                <label htmlFor="digest">SUI TRANSACTION DIGEST</label>
                <div className="input-inline"><input id="digest" value={digest} onChange={(e) => setDigest(e.target.value)} placeholder="Paste a real Sui transaction digest" autoComplete="off" spellCheck={false} /><button type="submit" disabled={busy || !status?.tatumConfigured}>{phase === "reading" ? "Reading…" : "Inspect"} <span>↗</span></button></div>
              </form>
              {!status?.tatumConfigured && <p className="inline-warning">TATUM_API_KEY is not set. Configure the server environment to enable real chain reads.</p>}
              {error && <div className="inline-error" role="alert">⚠ {error}</div>}
            </div>

            {tx ? <div className="panel evidence-panel">
              <div className="panel-kicker"><span>02 / VERIFIED CHAIN RESPONSE</span><span>{new Date(tx.observedAt).toLocaleString()}</span></div>
              <div className="evidence-heading"><h2>Transaction evidence</h2><span className={"outcome outcome-" + tx.outcome}>{tx.outcome}</span></div>
              <div className="evidence-row"><span>DIGEST</span><code title={tx.digest}>{shortDigest(tx.digest)}</code><button type="button" onClick={() => navigator.clipboard?.writeText(tx.digest)}>Copy</button></div>
              <div className="evidence-row"><span>NETWORK</span><strong>{tx.network}</strong></div>
              <div className="evidence-row"><span>PROVIDER</span><strong>{tx.source}</strong></div>
              <div className="error-block"><span>EXECUTION STATUS</span><pre>{tx.errorText || (tx.outcome === "succeeded" ? "Transaction executed successfully." : "No reliable failure classification returned.")}</pre></div>
              <div className="panel-actions">
                <a target="_blank" rel="noreferrer" href={"https://suivision.xyz/txblock/" + encodeURIComponent(tx.digest)} className="secondary-button">View on explorer ↗</a>
                <button disabled={tx.outcome !== "failed" || busy || !status?.walrusConfigured || !status.reviewerWritesEnabled} className="primary-button compact" onClick={() => setShowEditor(!showEditor)}>{showEditor ? "Close reviewer" : "Record verified fix"} ↗</button>
              </div>
            </div> : <div className="panel empty-evidence"><span className="empty-target">✳</span><div className="eyebrow dim">EVIDENCE WAITING ROOM</div><h2>The chain tells us what happened.</h2><p>Import a transaction to reveal its evidence before assigning an explanation.</p><div className="empty-grid"><span>STATUS / —</span><span>ERROR / —</span><span>SOURCE / —</span></div></div>}

            {tx && showEditor && <div className="panel editor-panel">
              <div className="panel-kicker"><span>03 / HUMAN REVIEW</span><span>WRITE RESTRICTED</span></div>
              <h2>Make this lesson reusable.</h2><p>Only record a procedure actually confirmed by a human. This becomes a future recommendation, not an automatic fix.</p>
              <div className="editor-form">
                <label>Confirmed diagnosis<textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} placeholder="What caused the failure?"/></label>
                <label>Resolution steps<textarea value={resolutionSteps} onChange={(e) => setResolutionSteps(e.target.value)} rows={4} placeholder="What did the engineer do, and what worked?"/></label>
                <label>HTTPS evidence URL<input type="url" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} placeholder="https://github.com/..."/></label>
                <div className="editor-pair"><label>Reviewer<input value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="Engineer name or handle" /></label><label>SDK version (optional)<input value={sdkVersion} onChange={(e) => setSdkVersion(e.target.value)} placeholder="2.x" /></label></div>
                <label>Private reviewer access key<input type="password" value={reviewerKey} onChange={(e) => setReviewerKey(e.target.value)} placeholder="Not saved in browser storage" /></label>
                <label className="review-checkbox"><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} /><span>I personally verified the diagnosis and resolution, and the content is safe to share in this workspace.</span></label>
                <button type="button" className="primary-button compact" disabled={busy || !verified} onClick={() => void remember()}>{phase === "writing" ? "Writing to Walrus…" : "Save confirmed memory"} ↗</button>
              </div>
            </div>}
          </section>

          <aside className="workspace-sidebar">
            <div className="panel memory-panel">
              <div className="panel-kicker"><span>MEMORY / RECALL</span><span className="memory-symbol">✦</span></div>
              <h2>What have we<br/><em>learned before?</em></h2>
              {phase === "recalling" ? <p className="muted">Searching Walrus memory against the current evidence…</p> :
               !tx ? <p className="muted">Once you import a failed transaction, compatible reviewed cases appear here—with their origin and mismatch reasons.</p> :
               <p className="muted">{recallNote || "No recall performed."}</p>}
              <div className="memory-results">
                {eligible.map((c) => <article key={c.record.id} className="match-card"><div className="match-kicker">VERIFIED PRECEDENT <span>↗</span></div><h3>{c.record.diagnosis}</h3><p>{c.record.resolutionSteps}</p><a href={c.record.evidenceUrl} target="_blank" rel="noreferrer">Original engineering evidence ↗</a><small>Reviewed by {c.record.reviewer} · {new Date(c.record.verifiedAt).toLocaleDateString()}</small></article>)}
                {rejected.length > 0 && <details className="rejected"><summary>{rejected.length} related case(s) excluded by compatibility checks</summary>{rejected.map((c) => <div key={c.record.id}><strong>{c.record.diagnosis}</strong><p>{c.reasons.join(" ")}</p></div>)}</details>}
                {!eligible.length && <div className="memory-zero"><div className="memory-zero-mark">↝</div><strong>No verified match to apply.</strong><p>Unmatched failures remain for human investigation. Similar words alone aren't proof.</p></div>}
              </div>
            </div>
            <div className="panel proof-panel"><div className="panel-kicker"><span>MEMORY PROVENANCE</span><span>WALRUS / MAINNET</span></div><h3>{proof ? "Write confirmed." : "Proof, not promises."}</h3><p>{proof ? "A real Walrus storage job completed. The receipt below is returned by the relayer." : "A memory only counts after its write job finishes and Walrus returns a blob ID."}</p>{proof ? <div className="proof-receipt"><span>STORAGE RECEIPT</span><code>{proof.blobId}</code><small>Job {proof.jobId.slice(0, 12)}… · {proof.namespace}</small></div> : <div className="proof-placeholder">NO CONFIRMED WRITE IN THIS SESSION</div>}</div>
            <div className="sidebar-note">INTEGRITY RULE <span>↗</span><p>Every reused fix is a suggestion for engineering review—not evidence that a new transaction is automatically repaired.</p></div>
          </aside>
        </div>
      </div>
      <footer className="workspace-footer"><span>INCIDENT / MEMORY</span><span>TRANSACTION EVIDENCE → HUMAN VALIDATION → DURABLE MEMORY</span><span>EARLY BUILD / 2026</span></footer>
    </main>
  );
}
