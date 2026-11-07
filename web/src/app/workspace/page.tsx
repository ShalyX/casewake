"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Status = { tatumConfigured: boolean; walrusConfigured: boolean; reviewerWritesEnabled: boolean; publicDemoMode?: boolean; network: string; checksAreLive: boolean };
type Transaction = { digest: string; network: string; source: string; observedAt: string; transactionTimestampMs?: number | null; checkpoint?: string | null; outcome: "failed" | "succeeded" | "unknown"; outcomeReason?: string | null; errorText: string | null; fingerprint: string | null; packageId: string | null; failedCommandIndex?: number | null; failedCommandKind?: string | null };
type ProofMethod = "reviewed-evidence" | "onchain-successor";
type Case = { id: string; digest: string; diagnosis: string; resolutionSteps: string; evidenceUrl: string; reviewer: string; verifiedAt: string; errorText: string; sdkVersion: string | null; validatedEvidence?: {scope:string;provider?:string;routeTransactionSha256?:string;gasPaymentMocked?:boolean;evidenceSha256?:string;evidenceTitle?:string;evidenceCommitSha?:string;evidenceFileCount?:number;verificationMethod?:string} };
type Candidate = { record: Case; distance: number; verdict: "eligible-for-review" | "incompatible"; reasons: string[]; warnings?: string[]; walrusReceipt?: {blobId:string;namespace:string;verifiedThrough:string} };
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
const LEGACY_CONTROL_EXAMPLES = [
  {digest:"BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6",label:"Simulation-tested runbook"},
  {digest:"XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue",label:"Related failure"},
  {digest:"Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp",label:"Mismatch control"},
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
  const [exactBlobRecallPassed, setThreeGatePassed] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [resolutionSteps, setResolutionSteps] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [sdkVersion, setSdkVersion] = useState("");
  const [reviewerKey, setReviewerKey] = useState("");
  const [verified, setVerified] = useState(false);
  const [proofMethod, setProofMethod] = useState<ProofMethod>("reviewed-evidence");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [verificationMethod, setVerificationMethod] = useState("integration-test");
  const [successorDigest, setSuccessorDigest] = useState("");
  const [reviewedChange, setReviewedChange] = useState("");
  const [confirmedCausalLink, setConfirmedCausalLink] = useState(false);
  const [recurrenceDigest, setRecurrenceDigest] = useState("");
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
      setShowEditor(false);
      setVerified(false);
      setConfirmedCausalLink(false);
      setProofMethod("reviewed-evidence");
      setEvidenceUrl("");
      setVerificationMethod("integration-test");
      setSuccessorDigest("");
      setReviewedChange("");
      setResolutionSteps("");
      setDiagnosis("");
      if (observed.outcome === "failed" && status?.walrusConfigured) {
        setPhase("recalling");
        await loadRecall(observed);
      } else if (observed.outcome === "failed") {
        setRecallNote("Walrus Memory has not been configured. Transaction evidence is separate from persistent recall.");
      } else if (observed.outcome === "succeeded") {
        setRecallNote("This transaction succeeded. Casewake only recalls resolution precedents for confirmed onchain failures.");
      } else {
        setRecallNote(observed.outcomeReason || "Tatum could not establish a finalized execution outcome. No failure is inferred and no resolution recall is attempted.");
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Unexpected lookup error."); }
    finally { setPhase("idle"); }
  }

  async function verifySavedRecall(saved: Proof, source: string, recurrence?: string) {
    setError("");
    setPhase("recalling");
    try {
      const secondDigest = (recurrence || "").trim();
      if (!secondDigest || secondDigest === source) throw new Error("Enter a distinct real failed transaction digest to prove recurrence.");
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
    if (!tx || tx.outcome !== "failed" || strictDeepbook || tx.digest === "XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue") return;
    setError(""); setProof(null); setThreeGatePassed(false); setObservationOnly(false);
    try {
      setPhase("writing");
      const submittedEvidenceUrl = proofMethod === "onchain-successor"
        ? "https://suivision.xyz/txblock/" + successorDigest.trim()
        : evidenceUrl.trim();
      const result = await postJson("/api/remember", {
        digest: tx.digest,
        diagnosis: diagnosis.trim(),
        resolutionSteps: resolutionSteps.trim(),
        evidenceUrl: submittedEvidenceUrl,
        reviewer: reviewer.trim(),
        sdkVersion: sdkVersion.trim() || undefined,
        verified,
        resolutionKind: proofMethod,
        successorDigest: proofMethod === "onchain-successor" ? successorDigest.trim() : undefined,
        reviewedChange: reviewedChange.trim(),
        verificationMethod: proofMethod === "reviewed-evidence" ? verificationMethod : undefined,
        confirmedCausalLink,
      }, reviewerKey);
      const stored = result.proof as Proof;
      setProof(stored);
      setWrittenSourceDigest(tx.digest);
      setShowEditor(false);
      await refreshInventory();
      setRecallNote("The human-reviewed resolution has a completed Walrus receipt. Enter a distinct comparable failed digest to verify exact-blob recurrence.");
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

  const strictDeepbook = tx?.digest === "BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6";
  const eligible = candidates.filter((c) => c.verdict === "eligible-for-review");
  const rejected = candidates.filter((c) => c.verdict === "incompatible");
  const busy = phase !== "idle";
  const proofReady = proofMethod === "onchain-successor"
    ? successorDigest.trim().length >= 32 && reviewedChange.trim().length >= 30
    : evidenceUrl.trim().length > 0 && reviewedChange.trim().length >= 30 && Boolean(verificationMethod);
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

        <div className="panel case-progress" role="status" style={{marginBottom:"20px"}}>
          <div className="panel-kicker"><span>CASE MEMORY / PROOF STATUS</span><a href="/api/acceptance" target="_blank" rel="noreferrer">Inspect acceptance ledger ↗</a></div>
          <div className="case-progress-grid">
            <div><strong>01 / CHAIN EVIDENCE</strong><span>{tx ? `Tatum confirmed · ${tx.outcome}` : "Awaiting an authentic Sui transaction"}</span></div>
            <div><strong>02 / HUMAN REVIEW</strong><span>{proof && !observationOnly ? "Reviewer-approved case stored" : proof && observationOnly ? "Observation stored · no resolution claim" : eligible.length ? "Compatible reviewed precedent available" : "No human-reviewed resolution recorded"}</span></div>
            <div><strong>03 / WALRUS RECALL</strong><span>{exactBlobRecallPassed ? "Exact stored blob recalled for a distinct failure" : proof && !observationOnly ? "Write complete · recurrence check pending" : eligible.some(candidate => candidate.walrusReceipt?.blobId) ? "Reviewed resolution recalled from Walrus" : simulationRunbooks.length ? "Simulation-tested procedure available" : "No verified resolution recalled in this session"}</span></div>
          </div>
          <p className="muted">Observed failures, simulation-tested procedures and human-reviewed resolutions are separate evidence tiers. Casewake never signs or executes a repair.</p>
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
              {status?.publicDemoMode && <details className="demo-presets">
                <summary className="demo-presets-label">Legacy DeFi test controls - not representative general cases</summary>
                <p>These three Mainnet digests are retained only as technical controls from the earlier DeFi/DeepBook investigation. They demonstrate failure, runbook and mismatch handling; they are not a human-reviewed fix or a representative Sui developer incident.</p>
                <div className="demo-preset-list">
                  {LEGACY_CONTROL_EXAMPLES.map((item, i) => <button key={item.digest} type="button" disabled={busy} onClick={() => {setDigest(item.digest); void inspect(item.digest);}}><small>{String(i+1).padStart(2,"0")}</small>{item.label}<span>GO</span></button>)}
                </div>
                <p>Public visitors can inspect genuine onchain transactions. Tatum and Walrus are queried live. Only an authorized reviewer with a private access key can record a confirmed case.</p>
              </details>}
              {!status?.tatumConfigured && <p className="inline-warning">TATUM_API_KEY is not set. Configure the server environment to enable real chain reads.</p>}
              {error && <div className="inline-error" role="alert">⚠ {error}</div>}
            </div>

            {tx ? <div className="panel evidence-panel">
              <div className="panel-kicker"><span>02 / VERIFIED CHAIN RESPONSE</span><span>{new Date(tx.observedAt).toLocaleString()}</span></div>
              <div className="evidence-heading"><h2>Transaction evidence</h2><span className={"outcome outcome-" + tx.outcome}>{tx.outcome}</span></div>
              <div className="evidence-row"><span>DIGEST</span><code title={tx.digest}>{shortDigest(tx.digest)}</code><button type="button" onClick={() => navigator.clipboard?.writeText(tx.digest)}>Copy</button></div>
              <div className="evidence-row"><span>NETWORK</span><strong>{tx.network}</strong></div>
              <div className="evidence-row"><span>CHAIN TIME</span><strong>{tx.transactionTimestampMs != null ? new Date(tx.transactionTimestampMs).toLocaleString() : "Unavailable"}</strong></div>
              <div className="evidence-row"><span>CHECKPOINT</span><strong>{tx.checkpoint || "Unavailable"}</strong></div>
              <div className="evidence-row"><span>PROVIDER</span><strong>{tx.source}</strong></div>
              <div className="error-block"><span>EXECUTION STATUS</span><pre>{tx.errorText || (tx.outcome === "succeeded" ? "Transaction executed successfully." : tx.outcomeReason || "No reliable failure classification returned.")}</pre></div>
              {tx.failedCommandIndex !== null && tx.failedCommandIndex !== undefined && <div className="evidence-row"><span>FAILED STEP</span><strong>Command #{tx.failedCommandIndex} · {tx.failedCommandKind || "unclassified"}</strong></div>}
              {tx.errorText?.startsWith("InsufficientCoinBalance") && tx.failedCommandKind === "splitCoins" && <div className="guidance-review"><strong>DOCUMENTED TROUBLESHOOTING HYPOTHESIS — NOT A VERIFIED REPAIR</strong><p>The failure points to a coin split. Review whether the split amount exceeds the coin balance available after prior commands and gas reservation. This does not prove which change worked for this specific transaction.</p><a href="https://www.docs.sui.io/develop/transactions/ptbs/prog-txn-blocks" target="_blank" rel="noreferrer">Read Sui&apos;s official PTB / splitCoins documentation ↗</a></div>}
              <div className="panel-actions">
                <a target="_blank" rel="noreferrer" href={"https://suivision.xyz/txblock/" + encodeURIComponent(tx.digest)} className="secondary-button">View on explorer ↗</a>
                <button disabled={strictDeepbook || tx.digest === "XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue" || tx.outcome !== "failed" || busy || !status?.walrusConfigured || !status.reviewerWritesEnabled || !reviewerKey} className="primary-button compact" onClick={() => setShowEditor(!showEditor)}>{strictDeepbook ? "Separate evidence track" : showEditor ? "Close reviewer" : "Record verified resolution"} ↗</button>
                {strictDeepbook && <p className="muted">This digest belongs to a separate route-specific evidence track. It is intentionally excluded from Casewake&apos;s general resolution workflow.</p>}
              </div>
            </div> : <div className="panel empty-evidence"><span className="empty-target">✳</span><div className="eyebrow dim">EVIDENCE WAITING ROOM</div><h2>The chain tells us what happened.</h2><p>Import a transaction to reveal its evidence before assigning an explanation.</p><div className="empty-grid"><span>STATUS / —</span><span>ERROR / —</span><span>SOURCE / —</span></div></div>}

              {tx && showEditor && !strictDeepbook && <div className="panel editor-panel">
              <div className="panel-kicker"><span>03 / HUMAN REVIEW</span><span>WRITE RESTRICTED</span></div>
              <h2>Record a human-reviewed resolution.</h2><p>Choose the confirmation method that actually proves this fix. Casewake checks the evidence artifact; an authorized engineer must still approve its causal link to this specific failure.</p>
              <div className="editor-form">
                <label>Confirmed diagnosis<textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} placeholder="What caused this specific failure?"/></label>
                <label>Resolution steps<textarea value={resolutionSteps} onChange={(e) => setResolutionSteps(e.target.value)} rows={4} placeholder="What changed, and how should the next engineer verify or apply it?"/></label>
                <label>Confirmation method<select value={proofMethod} onChange={(e) => setProofMethod(e.target.value as ProofMethod)}>
                  <option value="reviewed-evidence">Reviewed engineering artifact</option>
                  <option value="onchain-successor">Successful onchain follow-up</option>
                </select><small>The first method is for fixes proven by a case-specific test or code change. The second is for fixes with a distinct successful transaction from the same sender.</small></label>
                {proofMethod === "reviewed-evidence" ? <>
                  <label>Public merged GitHub PR or immutable commit URL<input value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} spellCheck={false} placeholder="https://github.com/owner/repo/pull/123 or /commit/40-character-sha" /><small>Casewake fetches the public artifact and changed-file diff, then records a SHA-256 snapshot. Pull requests must be merged. A link alone is never approval.</small></label>
                  <label>How was the fix confirmed?<select value={verificationMethod} onChange={(e) => setVerificationMethod(e.target.value)}>
                    <option value="reproduction-test">Reproduced and retested</option>
                    <option value="unit-test">Unit test</option>
                    <option value="integration-test">Integration test</option>
                    <option value="deployed-fix">Deployed fix verified</option>
                    <option value="maintainer-confirmed-fix">Maintainer-confirmed fix</option>
                  </select></label>
                </> : <>
                  <label>Later successful Sui transaction digest<input value={successorDigest} onChange={(e) => setSuccessorDigest(e.target.value)} spellCheck={false} placeholder="Real later success digest from the same sender" /><small>Tatum checks success, sender, chain timestamp, matching operation and a strictly later checkpoint.</small></label>
                  {successorDigest && <small>Success evidence: <a target="_blank" rel="noreferrer" href={"https://suivision.xyz/txblock/" + encodeURIComponent(successorDigest.trim())}>View submitted onchain follow-up ↗</a></small>}
                </>}
                <label>Exact engineering change<textarea rows={3} value={reviewedChange} onChange={(e) => setReviewedChange(e.target.value)} placeholder="Name the code, command, parameter, configuration or resource change and explain why it resolves this failure." /></label>
                <label className="review-checkbox"><input type="checkbox" checked={confirmedCausalLink} onChange={(e) => setConfirmedCausalLink(e.target.checked)} /><span>{proofMethod === "reviewed-evidence" ? "I reviewed this exact GitHub artifact and confirm its specific change resolves this incident. The selected test or verification method genuinely applies to this failure." : "I reviewed both executions and confirm this specific successful follow-up is the correction of the recorded incident. Tatum verifies execution and sender; it cannot infer my causal judgment."}</span></label>
                <div className="editor-pair"><label>Reviewer<input value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="Engineer name or handle" /></label><label>SDK version (optional)<input value={sdkVersion} onChange={(e) => setSdkVersion(e.target.value)} placeholder="2.x" /></label></div>
                <label className="review-checkbox"><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} /><span>{proofMethod === "reviewed-evidence" ? "I am an authorized human reviewer. I inspected the original failure, the linked artifact and its changed files, and the selected verification evidence. I accept responsibility for confirming the causal relationship." : "I am an authorized human reviewer. I inspected the original failure, the specific engineering change and the successful follow-up, and accept responsibility for confirming their causal relationship."}</span></label>
                <button type="button" className="primary-button compact" disabled={busy || !verified || !reviewerKey || diagnosis.trim().length < 20 || resolutionSteps.trim().length < 20 || !proofReady || !confirmedCausalLink} onClick={() => void remember()}>{phase === "writing" ? "Verifying and writing…" : proofMethod === "reviewed-evidence" ? "Verify artifact, then store" : "Verify follow-up, then store"} ↗</button>
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
                {eligible.map((c) => <article key={c.record.id} className="match-card"><div className="match-kicker">VERIFIED PRECEDENT <span>↗</span></div><h3>{c.record.diagnosis}</h3><p>{c.record.resolutionSteps}</p>{c.warnings?.map((warning, index) => <small className="muted" key={index}>Review note: {warning}</small>)}<a href={c.record.evidenceUrl} target="_blank" rel="noreferrer">Original engineering evidence ↗</a>{c.record.validatedEvidence?.scope === "full-flashloan-route-repair" && <small>Tatum Mainnet full-route simulation passed · proof SHA-256 {c.record.validatedEvidence.routeTransactionSha256?.slice(0,16)}… · No onchain execution claimed</small>}{c.record.validatedEvidence?.scope === "human-reviewed-successor-transaction" && <small>Tatum confirmed a distinct successful follow-up from the same sender. Its relevance was attested by a human reviewer; causality is not inferred from chain data alone.</small>}{c.record.validatedEvidence?.scope === "human-reviewed-engineering-artifact" && <small>GitHub artifact: {c.record.validatedEvidence.evidenceTitle} · {c.record.validatedEvidence.verificationMethod} · {c.record.validatedEvidence.evidenceFileCount} changed files · snapshot SHA-256 {c.record.validatedEvidence.evidenceSha256?.slice(0,16)}…</small>}<small>Reviewed by {c.record.reviewer} · {new Date(c.record.verifiedAt).toLocaleDateString()}</small>{c.walrusReceipt ? <div className="proof-receipt"><span>RECALLED WALRUS BLOB · {c.walrusReceipt.namespace}</span><code>{c.walrusReceipt.blobId}</code><small>Signed Walrus recall · same blob returned on retrieval</small></div> : <p>Walrus receipt unavailable — not a completed proof of recall.</p>}</article>)}
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
              <h3>{exactBlobRecallPassed ? "Human-reviewed resolution recalled across incidents." : proof ? "Mainnet write confirmed. Recall pending verification." : "Proof, not promises."}</h3>
              <p>{proof ? (observationOnly ? "An authentic onchain failure observation was stored. No repair or resolution was verified." : exactBlobRecallPassed ? "A distinct Tatum-confirmed failed incident recalled the reviewed resolution from the exact Walrus blob. Human causal review remains visible." : "Walrus storage completed, but a different comparable incident has not yet recalled the exact blob.") : "Only completed Mainnet writes with real blob IDs count. Observations are not the same as verified resolutions."}</p>
              {inventory && <div className="inventory-count"><strong>{inventory.allStoredMemories}</strong><span>Stored namespace memories (all types; including smoke tests). This is not a count of verified resolutions.</span></div>}{proof ? <div className="proof-receipt"><span>STORAGE RECEIPT</span><code>{proof.blobId}</code><small>Job {proof.jobId.slice(0, 12)}… · {proof.namespace}</small>{!exactBlobRecallPassed && !observationOnly && writtenSourceDigest && <>
                    <label className="reviewer-access"><span>SECOND DISTINCT REAL FAILURE</span><input value={recurrenceDigest} onChange={(e) => setRecurrenceDigest(e.target.value)} placeholder="Digest of a comparable later failed incident" spellCheck={false}/><small>Casewake will independently fetch it through Tatum and require a compatible error before accepting the exact Walrus blob match.</small></label>
                    <button type="button" className="secondary-button" disabled={busy || !reviewerKey || !recurrenceDigest.trim()} onClick={() => void verifySavedRecall(proof, writtenSourceDigest, recurrenceDigest)}>Verify exact-blob recurrence — no new Walrus write ↗</button>
                  </>}</div> : <div className="proof-placeholder">NO CONFIRMED WRITE IN THIS SESSION</div>}</div>
            <div className="sidebar-note">INTEGRITY RULE <span>↗</span><p>Every reused fix is a suggestion for engineering review—not evidence that a new transaction is automatically repaired.</p></div>
          </aside>
        </div>
      </div>
      <footer className="workspace-footer"><span>CASEWAKE</span><span>TRANSACTION EVIDENCE → HUMAN VALIDATION → DURABLE MEMORY</span><span>DEMONSTRATION / 2026</span></footer>
    </main>
  );
}
