"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Status = { tatumConfigured: boolean; walrusConfigured: boolean; reviewerWritesEnabled: boolean; publicDemoMode?: boolean; network: string; checksAreLive: boolean };
type Transaction = { digest: string; network: string; source: string; observedAt: string; outcome: "failed" | "succeeded" | "unknown"; errorText: string | null; fingerprint: string | null; packageId: string | null; failedCommandIndex?: number | null; failedCommandKind?: string | null };
type Case = { id: string; digest: string; diagnosis: string; resolutionSteps: string; evidenceUrl: string; reviewer: string; verifiedAt: string; errorText: string; sdkVersion: string | null };
type Candidate = { record: Case; distance: number; verdict: "eligible-for-review" | "incompatible"; reasons: string[]; walrusReceipt?: {blobId:string;namespace:string;verifiedThrough:string} };
type Proof = { jobId: string; blobId: string; owner?: string; namespace: string; status?: string };
type ObservedPrecedent = { case: {digest: string; errorText: string; sourceUrl: string; resolutionVerified: false}; distance: number };
type Inventory = { allStoredMemories: number; namespace: string; complete: boolean };
type SimulationRunbook = { record: { id:string; diagnosis:string; safeProcedure:string; caveat:string; proofPath:string; evidenceDigest:string; failure:{firstSplitMist:string;secondSplitMist:string;errorText:string}; corrected:{secondSplitMist:string} }; matchReason:string; verdict:"simulation-tested-review-only" };

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
const PUBLIC_EXAMPLES = [
  {digest:"BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6",label:"Repeat failure"},
  {digest:"XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue",label:"Second case"},
  {digest:"Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp",label:"Negative control"},
] as const;
function shortDigest(value: string) { return value.length > 19 ? value.slice(0, 12) + "…" + value.slice(-7) : value; }

export default function Workspace() {
  const [status, setStatus] = useState<Status | null>(null);
  const initialQueryLoaded = useRef(false);
  const [digest, setDigest] = useState("");
  const [tx, setTx] = useState<Transaction | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [observedPrecedents, setObservedPrecedents] = useState<ObservedPrecedent[]>([]);
  const [simulationRunbooks, setSimulationRunbooks] = useState<SimulationRunbook[]>([]);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [inventoryUnavailable, setInventoryUnavailable] = useState(false);
  const [observationOnly, setObservationOnly] = useState(false);
  const [recallNote, setRecallNote] = useState("");
  const [phase, setPhase] = useState<"idle" | "reading" | "recalling" | "writing">("idle");
  const [error, setError] = useState("");
  const [proof, setProof] = useState<Proof | null>(null);
  const [writtenSourceDigest, setWrittenSourceDigest] = useState("");
  const [threeGatePassed, setThreeGatePassed] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [diagnosis, setDiagnosis] = useState("The DeepBook three-hop flash-loan transaction fails at repayment split command 16 with InsufficientCoinBalance: the returned SUI is not sufficient to split out the exact borrowed principal.");
  const [resolutionSteps, setResolutionSteps] = useState("Before signing, simulate the complete flash-loan transaction with Tatum Sui Mainnet gRPC, including every swap, the repayment split, and return_flashloan_base. Block signing unless the full simulation returns a successful Transaction with effects.status.success=true. On any failure, reject/re-quote the route and re-simulate immediately before signing. The actual three-hop route remained BLOCKED; the exact-repayment DeepBook control simulation passed. This is prevention only, not repair of the original route.");
  const [evidenceUrl, setEvidenceUrl] = useState("https://github.com/ShalyX/casewake/blob/f9d3ea32e24f84f2306cd2533d92dbfd0cb62f2e/evidence/deepbook-repayment-guard-proof.json");
  const [reviewer, setReviewer] = useState("");
  const [sdkVersion, setSdkVersion] = useState("");
  const [reviewerKey, setReviewerKey] = useState("");
  const [verified, setVerified] = useState(false);
  const historicalRouteCorrected = false; // The original three-hop correction has not passed Mainnet simulation.
  useEffect(() => {
    fetch("/api/status").then((r) => r.json()).then(setStatus).catch(() => setError("Status endpoint unavailable."));
    fetch("/api/memories").then((r) => { if (!r.ok) throw new Error("Relayer unavailable"); return r.json(); }).then((data) => { setInventory(data as Inventory); setInventoryUnavailable(false); }).catch(() => setInventoryUnavailable(true));
  }, []);
  async function refreshInventory() {
    try { const r=await fetch("/api/memories"); if(r.ok){setInventory(await r.json() as Inventory);setInventoryUnavailable(false);}else{setInventoryUnavailable(true);} } catch { setInventoryUnavailable(true); }
  }

  useEffect(() => {
    if (initialQueryLoaded.current || !status?.tatumConfigured) return;
    const fromUrl = new URLSearchParams(window.location.search).get("digest");
    if (fromUrl && /^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(fromUrl)) {
      initialQueryLoaded.current = true;
      queueMicrotask(() => {
        setDigest(fromUrl);
        void inspect(fromUrl);
      });
    }
  // URL-based evidence replay triggers once after configuration is read.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.tatumConfigured]);

  async function loadRecall(observed: Transaction) {
    try {
      const recalled = await postJson("/api/recall", { digest: observed.digest }, reviewerKey);
      setCandidates((recalled.candidates || []) as Candidate[]);
      setObservedPrecedents((recalled.observedPrecedents || []) as ObservedPrecedent[]);
      setSimulationRunbooks((recalled.simulationRunbooks || []) as SimulationRunbook[]);
      setRecallNote(String(recalled.reason || ""));
    } catch {
      setCandidates([]);
      setObservedPrecedents([]);
      setSimulationRunbooks([]);
      setRecallNote("Walrus recall is temporarily unavailable. Tatum transaction evidence and completed storage receipts remain valid. Try again when the relayer recovers.");
    }
  }

  async function inspect(override?: string) {
    const value = (override || digest).trim();
    if (!value) { setError("Enter a transaction digest."); return; }
    setError(""); setRecallNote(""); setProof(null); setWrittenSourceDigest(""); setThreeGatePassed(false); setCandidates([]); setObservedPrecedents([]); setTx(null);
    try {
      setPhase("reading");
      const result = await postJson("/api/transaction", { digest: value }, reviewerKey);
      const observed = result.transaction as Transaction;
      setTx(observed);
      if (observed.outcome === "failed" && status?.walrusConfigured) {
        setPhase("recalling");
        await loadRecall(observed);
      } else if (observed.outcome === "failed") {
        setRecallNote("Walrus Memory has not been configured. Transaction evidence is separate from persistent recall.");
      } else {
        setRecallNote("A saved resolution is never suggested for a non-failed transaction.");
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Unexpected lookup error."); }
    finally { setPhase("idle"); }
  }

  async function verifySavedRecall(saved: Proof, source: string) {
    setError("");
    setPhase("recalling");
    try {
      const secondDigest = "XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue";
      const acceptance = await postJson("/api/verify-recall", {
        sourceDigest: source, secondDigest, expectedBlobId: saved.blobId,
      }, reviewerKey);
      setTx(acceptance.secondTransaction as Transaction);
      setDigest(secondDigest);
      setCandidates([acceptance.matchedCandidate as Candidate]);
      setObservedPrecedents([]);
      setSimulationRunbooks([]);
      setRecallNote(String(acceptance.note || "Exact stored Walrus blob recalled for the second independent Tatum failure."));
      setThreeGatePassed(true);
      setVerified(false);
    } catch (e) {
      setThreeGatePassed(false);
      setError((e instanceof Error ? e.message : "Recall failed.") + " The Walrus write receipt remains valid. Retry recall without storing another memory.");
    } finally { setPhase("idle"); }
  }

  async function remember() {
    if (!tx || tx.outcome !== "failed" || tx.digest !== "BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6") return;
    setError(""); setProof(null); setThreeGatePassed(false); setObservationOnly(false);
    try {
      setPhase("writing");
      const result = await postJson("/api/remember", {
        digest: tx.digest, diagnosis, resolutionSteps, evidenceUrl, reviewer, sdkVersion, verified, resolutionKind: "prevention-guard",
      }, reviewerKey);
      const stored = result.proof as Proof;
      setProof(stored);
      setWrittenSourceDigest(tx.digest);
      setShowEditor(false);
      await refreshInventory();
      await verifySavedRecall(stored, tx.digest);
    } catch (e) { setError(e instanceof Error ? e.message : "Memory write failed."); }
    finally { setPhase("idle"); }
  }

  async function rememberObservation() {
    if (!tx || tx.outcome !== "failed") return;
    setError(""); setProof(null); setThreeGatePassed(false); setObservationOnly(true);
    try {
      setPhase("writing");
      const result=await postJson("/api/observations",{digest:tx.digest},reviewerKey);
      const stored = result.proof as Proof;
      setProof(stored);
      await refreshInventory();
      setPhase("recalling");
      await loadRecall(tx);
    } catch(e){setError(e instanceof Error ? e.message : "Observation write failed.");}
    finally{setPhase("idle");}
  }

  const eligible = candidates.filter((c) => c.verdict === "eligible-for-review");
  const rejected = candidates.filter((c) => c.verdict === "incompatible");
  const busy = phase !== "idle";
  return (
    <main className="workspace-shell">
      <header className="workspace-header">
        <Link href="/" className="brand"><span className="brand-mark"><span/></span><span>CASEWAKE</span></Link>
        <nav><span className="workspace-env"><span className="pulse"/> SUI MAINNET</span><Link href="/journal/casewake">Field notes <span>↗</span></Link><Link href="/">About <span>↗</span></Link></nav>
      </header>
      <div className="workspace-container">
        <div className="workspace-title-row">
          <div><div className="eyebrow dim">ENGINEERING INTELLIGENCE / WORKSPACE 01</div><h1>Investigate. <span>Remember.</span></h1><p>Read authentic chain evidence, compare verified precedents, and preserve the next useful fix.</p></div>
          <div className="workspace-meta"><span>READ-ONLY CHAIN ACCESS</span><strong>NO AUTO-REMEDIATION</strong></div>
        </div>

        <div className="health-row" role="status">
          <div><span className={status?.tatumConfigured ? "health-indicator ready" : "health-indicator"} /> Tatum gRPC <b>{status ? (status.tatumConfigured ? (tx ? "Live transaction fetched" : "Key configured · inspect to verify") : "Key required") : "Checking…"}</b></div>
          <div><span className={status?.walrusConfigured ? "health-indicator ready" : "health-indicator"} /> Walrus Memory <b>{status ? (status.walrusConfigured ? (inventory ? "Mainnet inventory verified" : inventoryUnavailable ? "Relayer read temporarily unavailable" : "Credentials configured · checking") : "Credentials required") : "Checking…"}</b></div>
          <div><span className={status?.reviewerWritesEnabled ? "health-indicator ready" : "health-indicator"} /> Reviewer writes <b>{status?.reviewerWritesEnabled ? "Guarded" : "Disabled"}</b></div>
        </div>

        <div className="panel" role="status" style={{marginBottom:"20px"}}>
          <div className="panel-kicker"><span>LIVE ACCEPTANCE / THREE GATES</span><a href="/api/acceptance" target="_blank" rel="noreferrer">Read live audit ↗</a></div>
          <p><strong>01 / Simulation:</strong> Original swap route BLOCKED; corrected exact-repayment control ALLOW. Historical three-hop correction remains unproven.</p>
          <p><strong>02 / Reviewer and Walrus:</strong> {proof && !observationOnly ? "Completed blob " + shortDigest(proof.blobId) : "Awaiting approved evidence and completed memory write."}</p>
          <p><strong>03 / Independent recall:</strong> {threeGatePassed ? "Passed — exact stored Walrus blob recalled for second real failure." : "Awaiting exact-blob recall from second real failed transaction."}</p>
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
              {status?.reviewerWritesEnabled && <label className="reviewer-access">
                <span>PRIVATE REVIEWER ACCESS</span>
                <input type="password" value={reviewerKey} onChange={(e) => setReviewerKey(e.target.value)} placeholder="Enter the private workspace key" autoComplete="off" />
                <small>Unlocks custom digest lookup and protected case recording. Kept in page memory only.</small>
              </label>}
              {status?.publicDemoMode && <div className="demo-presets">
                <span className="demo-presets-label">REAL MAINNET EVIDENCE / CHOOSE A CASE</span>
                <div className="demo-preset-list">
                  {PUBLIC_EXAMPLES.map((item, i) => <button key={item.digest} type="button" disabled={busy} onClick={() => {setDigest(item.digest); void inspect(item.digest);}}><small>{String(i+1).padStart(2,"0")}</small>{item.label}<span>GO</span></button>)}
                </div>
                <p>Public visitors can inspect genuine onchain transactions. Tatum and Walrus are queried live. Only an authorized reviewer with a private access key can record a confirmed case.</p>
              </div>}
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
              {tx.failedCommandIndex !== null && tx.failedCommandIndex !== undefined && <div className="evidence-row"><span>FAILED STEP</span><strong>Command #{tx.failedCommandIndex} · {tx.failedCommandKind || "unclassified"}</strong></div>}
              {tx.errorText?.startsWith("InsufficientCoinBalance") && tx.failedCommandKind === "splitCoins" && <div className="guidance-review"><strong>DOCUMENTED TROUBLESHOOTING HYPOTHESIS — NOT A VERIFIED REPAIR</strong><p>The failure points to a coin split. Review whether the split amount exceeds the coin balance available after prior commands and gas reservation. This does not prove which change worked for this specific transaction.</p><a href="https://www.docs.sui.io/develop/transactions/ptbs/prog-txn-blocks" target="_blank" rel="noreferrer">Read Sui&apos;s official PTB / splitCoins documentation ↗</a></div>}
              <div className="panel-actions">
                <a target="_blank" rel="noreferrer" href={"https://suivision.xyz/txblock/" + encodeURIComponent(tx.digest)} className="secondary-button">View on explorer ↗</a>
                <button disabled={tx.digest !== "BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6" || tx.outcome !== "failed" || busy || !status?.walrusConfigured || !status.reviewerWritesEnabled || !reviewerKey} className="primary-button compact" onClick={() => setShowEditor(!showEditor)}>{showEditor ? "Close reviewer" : "Review guard evidence"} ↗</button>
              </div>
            </div> : <div className="panel empty-evidence"><span className="empty-target">✳</span><div className="eyebrow dim">EVIDENCE WAITING ROOM</div><h2>The chain tells us what happened.</h2><p>Import a transaction to reveal its evidence before assigning an explanation.</p><div className="empty-grid"><span>STATUS / —</span><span>ERROR / —</span><span>SOURCE / —</span></div></div>}

              {tx && showEditor && <div className="panel editor-panel">
              <div className="panel-kicker"><span>03 / HUMAN REVIEW</span><span>WRITE RESTRICTED</span></div>
              <h2>Verify the prevention, not a repaired route.</h2><p>This proof blocks the failing three-hop route and passes an exact-repayment DeepBook control. It does NOT repair the original route. Strict Gate 1 still requires a successful corrected simulation of the SAME three-hop route. The existing proof is prevention-only; a human-verified Walrus write is blocked until that evidence exists.</p>
              <div className="editor-form">
                <label>Confirmed diagnosis<textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} placeholder="What caused the failure?"/></label>
                <label>Resolution steps<textarea value={resolutionSteps} onChange={(e) => setResolutionSteps(e.target.value)} rows={4} placeholder="What did the engineer do, and what worked?"/></label>
                <label>Immutable simulation evidence URL<input type="url" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} readOnly /><small>The server retrieves and validates all three pinned Mainnet simulation results before permitting storage.</small> <a href={evidenceUrl} target="_blank" rel="noreferrer">Inspect original simulation evidence ↗</a></label>
                <div className="editor-pair"><label>Reviewer<input value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="Engineer name or handle" /></label><label>SDK version (optional)<input value={sdkVersion} onChange={(e) => setSdkVersion(e.target.value)} placeholder="2.x" /></label></div>
                <label className="review-checkbox"><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} /><span>I reviewed the original failed route, the blocked overdraw, and the successful repayment control. I approve only the pre-signing prevention guard; I do not claim the three-hop route was repaired.</span></label>
                <button type="button" className="primary-button compact" disabled={busy || !verified || !reviewerKey || !historicalRouteCorrected} onClick={() => void remember()}>{phase === "writing" ? "Writing to Walrus…" : "Gate 1 incomplete — storage blocked"} ↗</button>
                <div className="observation-action">
                  <span>Don&apos;t have a confirmed fix? Save an authentic failure observation instead. It will never be presented as an engineer-approved resolution.</span>
                  <button type="button" className="secondary-button" disabled={busy || !reviewerKey} onClick={() => void rememberObservation()}>Save onchain observation to Walrus ↗</button>
                </div>
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
                {eligible.map((c) => <article key={c.record.id} className="match-card"><div className="match-kicker">VERIFIED PRECEDENT <span>↗</span></div><h3>{c.record.diagnosis}</h3><p>{c.record.resolutionSteps}</p><a href={c.record.evidenceUrl} target="_blank" rel="noreferrer">Original engineering evidence ↗</a><small>Reviewed by {c.record.reviewer} · {new Date(c.record.verifiedAt).toLocaleDateString()}</small>{c.walrusReceipt ? <div className="proof-receipt"><span>RECALLED WALRUS BLOB · {c.walrusReceipt.namespace}</span><code>{c.walrusReceipt.blobId}</code><small>Signed Walrus recall · same blob returned on retrieval</small></div> : <p>Walrus receipt unavailable — not a completed proof of recall.</p>}</article>)}
                {simulationRunbooks.map((hit)=> <article key={hit.record.id} className="simulation-card">
                  <div className="simulation-card-kicker">SIMULATION-TESTED · HISTORICAL REPAIR NOT VERIFIED</div>
                  <h3>One reproducible failure. One tested correction.</h3>
                  <p>{hit.matchReason}</p>
                  <div className="simulation-comparison"><span>FAIL <strong>{Number(hit.record.failure.secondSplitMist).toLocaleString()} MIST</strong></span><span>SIMULATED SUCCESS <strong>{Number(hit.record.corrected.secondSplitMist).toLocaleString()} MIST</strong></span></div>
                  <p>{hit.record.safeProcedure}</p>
                  <Link href={hit.record.proofPath}>Inspect the actual Tatum simulation evidence ↗</Link>
                  <small>Walrus memory · evidence SHA-256 {hit.record.evidenceDigest.slice(0,16)}… · No transaction was repaired or executed</small>
                </article>)}
                {observedPrecedents.length > 0 && <div className="observed-group">
                  <div className="panel-kicker"><span>REPEATED ONCHAIN FAILURES / NO VERIFIED FIX</span><span>{observedPrecedents.length} MATCHES</span></div>
                  {observedPrecedents.map((hit) => <article className="observed-card" key={hit.case.digest}>
                    <span>PREVIOUSLY OBSERVED · RESOLUTION UNVERIFIED</span>
                    <strong>{shortDigest(hit.case.digest)}</strong>
                    <p>{hit.case.errorText}</p>
                    <a href={hit.case.sourceUrl} target="_blank" rel="noreferrer">View original Tatum-grounded transaction ↗</a>
                  </article>)}
                </div>}
                {rejected.length > 0 && <details className="rejected"><summary>{rejected.length} related case(s) excluded by compatibility checks</summary>{rejected.map((c) => <div key={c.record.id}><strong>{c.record.diagnosis}</strong><p>{c.reasons.join(" ")}</p></div>)}</details>}
                {!eligible.length && !observedPrecedents.length && !simulationRunbooks.length && <div className="memory-zero"><div className="memory-zero-mark">↝</div><strong>No verified match to apply.</strong><p>Unmatched failures remain for human investigation. Similar words alone aren&apos;t proof.</p></div>}
              </div>
            </div>
            <div className="panel proof-panel"><div className="panel-kicker"><span>MEMORY PROVENANCE</span><span>WALRUS / MAINNET</span></div>
              <h3>{threeGatePassed ? "Prevention and recall verified · original route still unproven." : proof ? "Mainnet write confirmed. Recall pending verification." : "Proof, not promises."}</h3>
              <p>{proof ? (observationOnly ? "An authentic onchain failure observation was stored. No repair or resolution was verified." : threeGatePassed ? "The second independent real failed transaction recalled the reviewer-approved prevention guard with the exact Walrus blob ID. The historical three-hop route remains unrepaired." : "Walrus storage completed, but the second-incident recall gate has not passed yet.") : "Only completed Mainnet writes with real blob IDs count. Observations are not the same as verified resolutions."}</p>
              {inventory && <div className="inventory-count"><strong>{inventory.allStoredMemories}</strong><span>Stored namespace memories (all types; including smoke tests). This is not a count of verified resolutions.</span></div>}{proof ? <div className="proof-receipt"><span>STORAGE RECEIPT</span><code>{proof.blobId}</code><small>Job {proof.jobId.slice(0, 12)}… · {proof.namespace}</small>{!threeGatePassed && !observationOnly && writtenSourceDigest && <button type="button" className="secondary-button" disabled={busy || !reviewerKey} onClick={() => void verifySavedRecall(proof, writtenSourceDigest)}>Retry independent recall — no new Walrus write ↗</button>}</div> : <div className="proof-placeholder">NO CONFIRMED WRITE IN THIS SESSION</div>}</div>
            <div className="sidebar-note">INTEGRITY RULE <span>↗</span><p>Every reused fix is a suggestion for engineering review—not evidence that a new transaction is automatically repaired.</p></div>
          </aside>
        </div>
      </div>
      <footer className="workspace-footer"><span>CASEWAKE</span><span>TRANSACTION EVIDENCE → HUMAN VALIDATION → DURABLE MEMORY</span><span>DEMONSTRATION / 2026</span></footer>
    </main>
  );
}
