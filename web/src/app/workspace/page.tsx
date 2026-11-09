"use client";

import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useEffect, useRef, useState } from "react";
import { requestJson, RequestError } from "@/lib/browser-request";
import { decodeStorageAttempt, parseStorageReceipt, STORAGE_SESSION_KEY, type StorageAttempt } from "@/lib/storage-session";

type Status = { tatumConfigured: boolean; walrusConfigured: boolean; reviewerWritesEnabled: boolean; publicDemoMode?: boolean; network: string; checksAreLive: boolean };
type Transaction = { digest: string; network: string; source: string; observedAt: string; transactionTimestampMs?: number | null; checkpoint?: string | null; outcome: "failed" | "succeeded" | "unknown"; outcomeReason?: string | null; errorText: string | null; fingerprint: string | null; packageId: string | null; failedCommandIndex?: number | null; failedCommandKind?: string | null };
type ProofMethod = "reviewed-evidence" | "onchain-successor";
type Case = { id: string; digest: string; diagnosis: string; resolutionSteps: string; evidenceUrl: string; reviewer: string; verifiedAt: string; errorText: string; sdkVersion: string | null; validatedEvidence?: {scope:string;provider?:string;routeTransactionSha256?:string;gasPaymentMocked?:boolean;evidenceSha256?:string;evidenceTitle?:string;evidenceCommitSha?:string;evidenceFileCount?:number;verificationMethod?:string} };
type Candidate = { record: Case; distance: number; verdict: "eligible-for-review" | "incompatible"; reasons: string[]; warnings?: string[]; matchReasons?:string[]; walrusReceipt?: {blobId:string;namespace:string;verifiedThrough:string} };
type Proof = { jobId: string; blobId: string; owner?: string; namespace: string; status?: string };
type ObservedPrecedent = { case: {digest: string; errorText: string; sourceUrl: string; resolutionVerified: false}; distance: number };
type Inventory = { allStoredMemories: number; namespace: string; complete: boolean };
type SimulationRunbook = { record: { id:string; diagnosis:string; safeProcedure:string; caveat:string; proofPath:string; evidenceDigest:string; failure:{firstSplitMist:string;secondSplitMist:string;errorText:string}; corrected:{secondSplitMist:string} }; matchReason:string; verdict:"simulation-tested-review-only" };

async function postJson(path: string, body: unknown, key?: string) {
  return requestJson(path,body,key);
}
const LEGACY_CONTROL_EXAMPLES = [
  {digest:"BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6",label:"Simulation-tested runbook"},
  {digest:"XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue",label:"Related failure"},
  {digest:"Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp",label:"Mismatch control"},
] as const;
const REVIEWED_RECURRENCE = "HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV";
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
  const [recallUnavailable,setRecallUnavailable]=useState(false);
  const [phase, setPhase] = useState<"idle" | "reading" | "recalling" | "writing">("idle");
  const [error, setError] = useState("");
  const [activeTask,setActiveTask]=useState<"lookup"|"storage"|"recurrence">("lookup");
  const [proof, setProof] = useState<Proof | null>(null);
  const [receiptNeedsVerification,setReceiptNeedsVerification]=useState(false);
  const [writtenSourceDigest, setWrittenSourceDigest] = useState("");
  const [exactBlobRecallPassed, setThreeGatePassed] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [resolutionSteps, setResolutionSteps] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [sdkVersion, setSdkVersion] = useState("");
  const [reviewerKey, setReviewerKey] = useState("");
  const [verified, setVerified] = useState(false);
  const [reviewApprovalChanged,setReviewApprovalChanged]=useState(false);
  function clearReviewApproval(){
    if(verified||confirmedCausalLink)setReviewApprovalChanged(true);
    setVerified(false);setConfirmedCausalLink(false);
  }
  const [proofMethod, setProofMethod] = useState<ProofMethod>("reviewed-evidence");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [verificationMethod, setVerificationMethod] = useState("integration-test");
  const [successorDigest, setSuccessorDigest] = useState("");
  const [reviewedChange, setReviewedChange] = useState("");
  const [confirmedCausalLink, setConfirmedCausalLink] = useState(false);
  const [recurrenceDigest, setRecurrenceDigest] = useState("");
  const [storageAttempt,setStorageAttempt]=useState<StorageAttempt|null>(null);
  const [recoveryJobId,setRecoveryJobId]=useState("");
  const [failedStorageJob,setFailedStorageJob]=useState(false);
  const writeInFlight=useRef(false);
  const editorRef=useRef<HTMLDivElement>(null);
  const storageRef=useRef<HTMLElement>(null);
  const memoryRef=useRef<HTMLElement>(null);
  const focusStorageAfterClose=useRef(false);
  const reviewOpenerRef=useRef<HTMLButtonElement>(null);
  const reviewErrorRef=useRef<HTMLDivElement>(null);
  const [reviewErrors,setReviewErrors]=useState<{id:string;message:string}[]>([]);
  function closeEditorForStorage(){
    focusStorageAfterClose.current=focusStorageAfterClose.current&&(document.activeElement===document.body||!!editorRef.current?.contains(document.activeElement));
    setShowEditor(false);
  }
  useEffect(()=>{
    if(!showEditor&&focusStorageAfterClose.current&&storageRef.current){
      storageRef.current.focus();focusStorageAfterClose.current=false;
    }
  },[showEditor,storageAttempt,proof]);
  useEffect(()=>{if(showEditor)editorRef.current?.focus();},[showEditor]);
  useEffect(()=>{if(reviewErrors.length)reviewErrorRef.current?.focus();},[reviewErrors]);
  async function submitReview(){
    const fields=[{id:"review-diagnosis",valid:diagnosis.trim().length>=20,message:"Enter a specific diagnosis of at least 20 characters."},{id:"review-steps",valid:resolutionSteps.trim().length>=20,message:"Enter concrete resolution steps of at least 20 characters."},{id:"review-change",valid:reviewedChange.trim().length>=30,message:"Describe the exact engineering change in at least 30 characters."},{id:"review-name",valid:reviewer.trim().length>=2,message:"Enter a named reviewer."},proofMethod==="reviewed-evidence"?{id:"review-url",valid:evidenceUrl.trim().length>0,message:"Enter the evidence URL."}:{id:"review-successor",valid:successorDigest.trim().length>=32,message:"Enter the distinct successful successor digest."}];
    const invalid=fields.filter(f=>!f.valid);setReviewErrors(invalid);
    if(!invalid.length){focusStorageAfterClose.current=!!editorRef.current?.contains(document.activeElement);await remember();}
  }
  function retainStorage(value:StorageAttempt|null){
    setStorageAttempt(value);
    try{if(value)sessionStorage.setItem(STORAGE_SESSION_KEY,JSON.stringify(value));else sessionStorage.removeItem(STORAGE_SESSION_KEY);}catch{/* Storage can be disabled; keep in-memory receipt. */}
  }
  useEffect(() => {
    requestJson("/api/status",undefined).then(data=>setStatus(data as Status)).catch(() => setError("Status endpoint unavailable. Reload to retry."));
    requestJson("/api/memories",undefined).then((data) => { setInventory(data as Inventory); setInventoryUnavailable(false); }).catch(() => setInventoryUnavailable(true));
    try{
      const saved=decodeStorageAttempt(sessionStorage.getItem(STORAGE_SESSION_KEY));
      if(saved)queueMicrotask(()=>{setStorageAttempt(saved);if(saved.receipt){setReceiptNeedsVerification(true);setProof(saved.receipt);setWrittenSourceDigest(saved.sourceDigest);setObservationOnly(saved.kind==="observation");}});
    }catch{/* No persistent browser access is required to inspect transactions. */}
  }, []);
  async function refreshInventory() {
    try {setInventory(await requestJson("/api/memories",undefined,reviewerKey) as Inventory);setInventoryUnavailable(false);}catch{setInventoryUnavailable(true);}
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
    setActiveTask("lookup");
    setPhase("recalling");
    try {
      const recalled = await postJson("/api/recall", { digest: observed.digest }, reviewerKey);
      setCandidates((recalled.candidates || []) as Candidate[]);
      setObservedPrecedents((recalled.observedPrecedents || []) as ObservedPrecedent[]);
      setSimulationRunbooks((recalled.simulationRunbooks || []) as SimulationRunbook[]);
      setRecallNote(String(recalled.reason || ""));
      setRecallUnavailable(recalled.recallDegraded===true);
    } catch {
      setRecallUnavailable(true);
      setCandidates([]);
      setObservedPrecedents([]);
      setSimulationRunbooks([]);
      setRecallNote("Walrus recall is temporarily unavailable. Tatum transaction evidence and completed storage receipts remain valid. Try again when the relayer recovers.");
    } finally {setPhase("idle");}
  }

  async function inspect(override?: string) {
    const value = (override || digest).trim();
    if (!value) { setError("Enter a transaction digest."); return; }
    setActiveTask("lookup");
    setReviewErrors([]);
    setError(""); setRecallNote(""); setRecallUnavailable(false); setThreeGatePassed(false); setCandidates([]); setObservedPrecedents([]); setSimulationRunbooks([]); setShowEditor(false); setTx(null);
    try {
      setPhase("reading");
      const result = await postJson("/api/transaction", { digest: value }, reviewerKey);
      const observed = result.transaction as Transaction;
      setTx(observed);
      setShowEditor(false);
      setVerified(false);
      setConfirmedCausalLink(false);
      setProofMethod("reviewed-evidence");
      setSdkVersion("");setReviewApprovalChanged(false);
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
        setRecallNote("This transaction succeeded. Rouse only recalls resolution precedents for confirmed onchain failures.");
      } else {
        setRecallNote(observed.outcomeReason || "Tatum could not establish a finalized execution outcome. No failure is inferred and no resolution recall is attempted.");
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Unexpected lookup error."); }
    finally { setPhase("idle"); }
  }

  async function verifySavedRecall(saved: Proof, source: string, recurrence?: string) {
    if(receiptNeedsVerification){setError("Verify the saved receipt with the server before checking recurrence.");return;}
    setActiveTask("recurrence");
    setError("");
    setPhase("recalling");
    setTx(null);setCandidates([]);setObservedPrecedents([]);setSimulationRunbooks([]);setRecallUnavailable(false);
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
      setRecallUnavailable(false);
      setRecallNote(String(acceptance.note || "Exact stored Walrus blob recalled for the second independent Tatum failure."));
      setThreeGatePassed(true);
      setVerified(false);
    } catch (e) {
      setThreeGatePassed(false);
      setError((e instanceof Error ? e.message : "Recall failed.") + " The Walrus write receipt remains valid. Retry recall without storing another memory.");
    } finally { setPhase("idle"); }
  }

  async function remember() {
    if (!tx || tx.outcome !== "failed" || strictDeepbook || tx.digest === "XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue" || writeInFlight.current || receiptNeedsVerification || (storageAttempt&&!storageAttempt.receipt)) return;
    setActiveTask("storage");
    writeInFlight.current=true;
    const attempt:StorageAttempt={sourceDigest:tx.digest,kind:"resolution",requestId:crypto.randomUUID()};
    retainStorage(attempt);
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
        asyncWrite:true,requestId:attempt.requestId,
      }, reviewerKey);
      if(result.pending){
        const pending=result.pending as {jobId:string;namespace:string};
        const accepted={...attempt,jobId:pending.jobId,namespace:pending.namespace};
        retainStorage(accepted);closeEditorForStorage();await checkStorage(accepted);return;
      }
      const stored=parseStorageReceipt(result.proof);
      if(!stored)throw new Error("Storage returned an invalid receipt. Check the existing job; do not submit another memory.");
      setReceiptNeedsVerification(false);setProof(stored);
      setWrittenSourceDigest(tx.digest);
      retainStorage({...attempt,jobId:stored.jobId,namespace:stored.namespace,receipt:stored});
      closeEditorForStorage();
      await refreshInventory();
      setRecallNote("The human-reviewed resolution has a completed Walrus receipt. Enter a distinct comparable failed digest to verify exact-blob recurrence.");
    } catch (e) {
      if(e instanceof RequestError&&[400,403,409,422].includes(e.status))retainStorage(null);
      focusStorageAfterClose.current=false;
      setError((e instanceof Error?e.message:"Memory write response unavailable.")+" No automatic write retry was made.");
    }
    finally {writeInFlight.current=false;setPhase("idle");}
  }

  async function checkStorage(attempt:StorageAttempt|null=storageAttempt){
    if(!attempt)return;
    const jobId=attempt.jobId||attempt.receipt?.jobId||recoveryJobId.trim();
    if(!jobId||!reviewerKey){setError("Enter reviewer access and the storage job ID to check the existing write. Do not store another copy.");return;}
    setActiveTask("storage");
    setPhase("writing");setError("");setFailedStorageJob(false);
    try{
      const query=new URLSearchParams({jobId,sourceDigest:attempt.sourceDigest,requestId:attempt.requestId,kind:attempt.kind});
      const result=await requestJson("/api/memory-job?"+query,undefined,reviewerKey);
      if(result.proof){
        const stored=parseStorageReceipt(result.proof);
      if(!stored)throw new Error("Storage returned an invalid receipt. Check the existing job; do not submit another memory.");
        retainStorage({...attempt,jobId,namespace:stored.namespace,receipt:stored});
        setReceiptNeedsVerification(false);setProof(stored);setWrittenSourceDigest(attempt.sourceDigest);setObservationOnly(attempt.kind==="observation");
        setRecallNote("Walrus storage completed. This receipt is preserved when inspecting another incident; verify recurrence without writing again.");
        await refreshInventory();
      }else retainStorage({...attempt,jobId});
    }catch(e){if(e instanceof RequestError&&e.status===409&&e.code==="storage-job-failed"){setFailedStorageJob(true);setProof(null);setReceiptNeedsVerification(false);retainStorage({...attempt,receipt:undefined});}setError((e instanceof Error?e.message:"Storage status unavailable.")+" The write has not been retried.");}
    finally{setPhase("idle");}
  }

  async function rememberObservation() {
    if (!tx || tx.outcome !== "failed" || writeInFlight.current || receiptNeedsVerification || (storageAttempt&&!storageAttempt.receipt)) return;
    setActiveTask("storage");
    writeInFlight.current=true;
    const attempt:StorageAttempt={sourceDigest:tx.digest,kind:"observation",requestId:crypto.randomUUID()};
    retainStorage(attempt);
    setError(""); setProof(null); setThreeGatePassed(false); setObservationOnly(true);
    try {
      setPhase("writing");
      const result=await postJson("/api/observations",{digest:tx.digest,asyncWrite:true,requestId:attempt.requestId},reviewerKey);
      if(result.pending){const pending=result.pending as {jobId:string;namespace:string};const accepted={...attempt,jobId:pending.jobId,namespace:pending.namespace};retainStorage(accepted);await checkStorage(accepted);return;}
      const stored=parseStorageReceipt(result.proof);
      if(!stored)throw new Error("Storage returned an invalid receipt. Check the existing job; do not submit another memory.");
      setReceiptNeedsVerification(false);setProof(stored);
      setWrittenSourceDigest(tx.digest);retainStorage({...attempt,jobId:stored.jobId,receipt:stored});
      await refreshInventory();
      setPhase("recalling");
      await loadRecall(tx);
    } catch(e){if(e instanceof RequestError&&[400,403,409,422].includes(e.status))retainStorage(null);setError((e instanceof Error?e.message:"Observation response unavailable.")+" No automatic write retry was made.");}
    finally{writeInFlight.current=false;setPhase("idle");}
  }

  const strictDeepbook = tx?.digest === "BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6";
  const eligible = candidates.filter((c) => c.verdict === "eligible-for-review");
  const rejected = candidates.filter((c) => c.verdict === "incompatible");
  const busy = phase !== "idle";
  const storagePending=!!storageAttempt&&!storageAttempt.receipt;
  const liveStatus=phase==="reading"?"Reading transaction.":
    phase==="recalling"?(activeTask==="recurrence"?"Checking exact-blob recurrence.":"Checking reviewed memory."):
    phase==="writing"?"Submitting or checking storage. Completion is not yet confirmed.":
    activeTask==="storage"?(storagePending?(failedStorageJob?"Storage job failed. No completed memory.":storageAttempt.jobId?"Storage accepted; completion pending.":"Storage response unconfirmed. Recover the existing job before submitting again."):proof?(receiptNeedsVerification?"Saved receipt requires server verification.":observationOnly?"Observation stored. No resolution claimed.":"Memory stored."):""):
    exactBlobRecallPassed?"Exact stored blob recalled for a distinct failure.":
    recallUnavailable?"Memory lookup unavailable. No conclusion about saved cases.":
    tx?(tx.outcome==="unknown"?"Execution outcome unknown.":tx.outcome==="succeeded"?"Transaction succeeded. No failure procedure is inferred.":eligible.length?"Reviewed resolution available.":status?.walrusConfigured?"Transaction failed. No eligible reviewed resolution returned.":"Transaction failed. Memory is not configured."):
    proof?(receiptNeedsVerification?"Saved receipt requires server verification.":"Existing storage receipt available."):"";

  return <div className="rouse-shell workspace-shell"><SiteHeader /><main id="main" tabIndex={-1} className="workspace-container">
    <div className="workspace-title-row"><div><h1>Investigate a failure.</h1><p>Read the chain evidence. Compare a reviewed resolution.</p></div><details className="access-disclosure"><summary>Reviewer access</summary><div className="access-content"><label className="reviewer-access"><span>Private reviewer access</span><input type="password" value={reviewerKey} onChange={e=>setReviewerKey(e.target.value)} placeholder="Enter the private workspace key" autoComplete="off" /><small>Kept in page memory only. Required for recording and receipt recovery. Inspection and discovery are public.</small></label><p>Reviewer writes: <strong>{status?.reviewerWritesEnabled ? "Guarded" : "Disabled"}</strong></p><p>Tatum: {status?.tatumConfigured?"Configured":"Not configured"} · Walrus: {status?.walrusConfigured?"Configured":"Not configured"}. Configuration is separate from a successful request.</p></div></details></div>
    <form className="digest-form" onSubmit={event=>{event.preventDefault();if(!busy)void inspect();}}><label htmlFor="digest">Sui transaction digest</label><div className="input-inline"><input id="digest" name="digest" value={digest} onChange={e=>setDigest(e.target.value)} placeholder="Paste a real Sui transaction digest" autoComplete="off" spellCheck={false} /><button type="submit" disabled={!status?.tatumConfigured} aria-disabled={busy}>{phase==="reading"?"Reading…":"Inspect transaction"} <span aria-hidden="true">↗</span></button></div></form>
    <div className="intake-context"><button className="text-link" type="button" disabled={!status?.tatumConfigured} aria-disabled={busy} onClick={()=>{if(busy)return;setDigest(REVIEWED_RECURRENCE);void inspect(REVIEWED_RECURRENCE);}}>Open reviewed example ↗</button><p>Inspect your own Sui Mainnet digest. Recording stays protected.</p><Link className="text-link" href="/cases">Browse or search reviewed cases ↗</Link></div>
    {!status&&<p className="setup-note">Checking workspace configuration…</p>}{status&&!status.tatumConfigured&&<p className="setup-note">Transaction lookup is not configured. Ask the workspace operator to enable chain access.</p>}
    {status&&!status.walrusConfigured&&<p className="setup-note">Memory is not configured. Permitted transaction inspection remains available; no conclusion about stored cases can be drawn.</p>}
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{liveStatus}</div>
    {error&&<div className="inline-error" role="alert">{error}</div>}
    <div className="workspace-grid">
      <section className="panel evidence-panel" aria-busy={phase==="reading"}>
        {tx?<><div className="panel-kicker"><span>Current transaction</span><span className={"outcome outcome-"+tx.outcome}>{tx.outcome==="failed"?"Failed execution":tx.outcome==="unknown"?"Execution outcome unknown":"Successful execution"}</span></div><h2>Chain evidence</h2>
        <dl className="chain-facts"><div><dt>Digest</dt><dd><code>{tx.digest}</code></dd></div><div><dt>Network</dt><dd>{tx.network}</dd></div><div><dt>Checkpoint</dt><dd>{tx.checkpoint||"Unavailable"}</dd></div><div><dt>Chain time</dt><dd>{tx.transactionTimestampMs!=null?new Date(tx.transactionTimestampMs).toLocaleString():"Unavailable"}</dd></div><div><dt>Source</dt><dd>{tx.source}</dd></div></dl>
        <div className={"execution-summary "+tx.outcome}><strong>{tx.outcome==="failed"?(tx.errorText?.includes("MoveAbort")?"MoveAbort":tx.errorText?.startsWith("InsufficientCoinBalance")?"InsufficientCoinBalance":"Failed execution"):tx.outcome==="succeeded"?"Transaction executed successfully.":"Execution outcome unknown"}</strong><p>{tx.outcomeReason|| (tx.outcome==="failed"?`Command ${tx.failedCommandIndex??"unknown"} · ${tx.failedCommandKind||"unclassified"}`:"No failure resolution is inferred.")}</p></div>
        <a className="text-link" target="_blank" rel="noreferrer" href={"https://suivision.xyz/txblock/"+encodeURIComponent(tx.digest)}>View original transaction ↗</a><details className="provenance-details"><summary>Full execution evidence</summary><pre>{tx.errorText||tx.outcomeReason||"No execution error returned."}</pre><p>Observed {new Date(tx.observedAt).toLocaleString()}</p><code>{tx.packageId||"Package identity unavailable"}</code><code>{tx.fingerprint||"No failure fingerprint"}</code></details>
        {tx.errorText?.startsWith("InsufficientCoinBalance")&&tx.failedCommandKind==="splitCoins"&&<details className="provenance-details"><summary>Documented troubleshooting hypothesis</summary><p>Review whether the split amount exceeds the balance after prior commands and gas reservation. This is not a verified repair for this transaction.</p><a className="text-link" href="https://www.docs.sui.io/develop/transactions/ptbs/prog-txn-blocks" target="_blank" rel="noreferrer">Sui programmable transaction documentation ↗</a></details>}
        <div className="review-entry"><button ref={reviewOpenerRef} type="button" className="secondary-button" disabled={strictDeepbook||tx.digest==="XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue"||tx.outcome!=="failed"||busy||!status?.walrusConfigured||!status.reviewerWritesEnabled||!reviewerKey} onClick={()=>{if(showEditor){setShowEditor(false);reviewOpenerRef.current?.focus();}else setShowEditor(true);}}>{strictDeepbook?"Separate evidence track":showEditor?"Close reviewer":"Record a reviewed resolution"} ↗</button>{strictDeepbook&&<p className="caption">This historical digest has its own route-specific evidence track.</p>}{tx.outcome==="failed"&&!reviewerKey&&<p className="caption">Use Reviewer access to record a new resolution.</p>}</div></>:
        <div className="empty-evidence"><div className="eyebrow">{phase==="reading"?"Transaction read":"Start an investigation"}</div><h2>{phase==="reading"?"Reading transaction evidence.":"The chain tells us what happened."}</h2><p>{phase==="reading"?"Waiting for the actual transaction response. Earlier query results have been cleared.":"Import a Sui digest to inspect the execution before assigning an explanation."}</p></div>}
      </section>
      <section ref={memoryRef} tabIndex={-1} aria-label="Reviewed memory" className="panel memory-panel" aria-busy={phase==="recalling"}><div className="panel-kicker"><span>Reviewed precedent</span><span>For engineering review</span></div>
        {phase==="recalling"?<div className="memory-empty"><h2>Checking reviewed memory.</h2><p>Chain evidence and a reviewed resolution are separate results.</p></div>:!tx?<div className="memory-empty"><h2>Retained judgment,<br />ready for the next case.</h2><p>A compatible reviewed resolution appears here with its evidence, reasons and limits.</p></div>:tx.outcome!=="failed"?<div className="memory-empty"><h2>{tx.outcome==="succeeded"?"Successful execution.":"Execution outcome unknown."}</h2><p>{recallNote}</p></div>:<>
        {eligible.map(c=><article key={c.record.id} className="match-card"><h2>{c.record.diagnosis.split(/(?<=[.!?])\s/)[0]}</h2><p className="resolution-steps">{c.record.resolutionSteps}</p>{c.matchReasons?.length?<div className="matching-reasons"><strong>Why it matches:</strong><ul>{c.matchReasons.map(reason=><li key={reason}>✓ {reason}</li>)}</ul></div>:null}{c.warnings?.map((warning,index)=><p className="review-warning" key={index}>{warning}</p>)}
        <p className="review-warning">Current SDK version is unknown; confirm compatibility before reuse.</p>
        <div className="reviewed-by"><span>Reviewed by {c.record.reviewer} · {new Date(c.record.verifiedAt).toLocaleDateString()}</span><a href={c.record.evidenceUrl} target="_blank" rel="noreferrer">Original evidence ↗</a></div>
        {c.walrusReceipt?<div className="exact-blob"><span>Exact recalled Walrus blob</span><code>{c.walrusReceipt.blobId}</code><small>Signed recall · {c.walrusReceipt.namespace}</small></div>:<p>Walrus receipt unavailable — not a completed proof of recall.</p>}
        <details className="provenance-details"><summary>Full case provenance</summary><p>{c.record.diagnosis}</p><p>Source incident</p><code>{c.record.digest}</code><p>SDK version: {c.record.sdkVersion||"Unknown; confirm compatibility before reuse."}</p>{c.record.validatedEvidence&&<><p>Evidence scope: {c.record.validatedEvidence.scope}</p><p>Verification: {c.record.validatedEvidence.verificationMethod||"See original evidence"}</p><p>{c.record.validatedEvidence.evidenceTitle}</p><code>{c.record.validatedEvidence.evidenceSha256||c.record.validatedEvidence.routeTransactionSha256}</code><p>Evidence commit: {c.record.validatedEvidence.evidenceCommitSha||"See source"}</p></>}</details></article>)}
        {!eligible.length&&<div className="memory-zero"><h2>{!status?.walrusConfigured?"Memory is not configured.":recallUnavailable?"Memory lookup unavailable.":"No eligible precedent."}</h2><p>{recallUnavailable?"No conclusion can be drawn about saved cases. The chain evidence remains available.":recallNote||"This failure remains open for investigation. Similar wording alone is not proof."}</p>{recallUnavailable&&<button className="secondary-button" disabled={busy} onClick={()=>{memoryRef.current?.focus();void loadRecall(tx);}}>Retry memory lookup ↗</button>}</div>}
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

        </>}
      </section>
    </div>
    {tx && showEditor && !strictDeepbook && <div className="panel editor-panel" ref={editorRef} tabIndex={-1}>
              <div className="panel-kicker"><span>03 / HUMAN REVIEW</span><span>WRITE RESTRICTED</span></div>
              <h2>Record a human-reviewed resolution.</h2><p>Choose the confirmation method that actually proves this fix. Rouse checks the evidence artifact; an authorized engineer must still approve its causal link to this specific failure.</p>
              <div className="editor-form">{reviewErrors.length>0&&<div ref={reviewErrorRef} tabIndex={-1} className="review-error-summary"><h3>Correct the review</h3><ul>{reviewErrors.map(item=><li key={item.id}><a href={"#"+item.id} onClick={event=>{event.preventDefault();document.getElementById(item.id)?.focus();}}>{item.message}</a></li>)}</ul></div>}
                <label>Confirmed diagnosis<textarea id="review-diagnosis" aria-invalid={reviewErrors.some(e=>e.id==="review-diagnosis")} aria-describedby={reviewErrors.some(e=>e.id==="review-diagnosis")?"review-diagnosis-error":undefined} value={diagnosis} onChange={(e) => {clearReviewApproval();setDiagnosis(e.target.value);}} rows={2} placeholder="What caused this specific failure?"/>{reviewErrors.filter(e=>e.id==="review-diagnosis").map(e=><small className="field-error" id="review-diagnosis-error" key={e.id}>{e.message}</small>)}</label>
                <label>Resolution steps<textarea id="review-steps" aria-invalid={reviewErrors.some(e=>e.id==="review-steps")} aria-describedby={reviewErrors.some(e=>e.id==="review-steps")?"review-steps-error":undefined} value={resolutionSteps} onChange={(e) => {clearReviewApproval();setResolutionSteps(e.target.value);}} rows={4} placeholder="What changed, and how should the next engineer verify or apply it?"/>{reviewErrors.filter(e=>e.id==="review-steps").map(e=><small className="field-error" id="review-steps-error" key={e.id}>{e.message}</small>)}</label>
                <label>Confirmation method<select value={proofMethod} onChange={(e) => {clearReviewApproval();setProofMethod(e.target.value as ProofMethod);}}>
                  <option value="reviewed-evidence">Reviewed engineering artifact</option>
                  <option value="onchain-successor">Successful onchain follow-up</option>
                </select><small>The first method is for fixes proven by a case-specific test or code change. The second is for fixes with a distinct successful transaction from the same sender.</small></label>
                {proofMethod === "reviewed-evidence" ? <>
                  <label>Public merged GitHub PR or immutable commit URL<input id="review-url" aria-invalid={reviewErrors.some(e=>e.id==="review-url")} aria-describedby={reviewErrors.some(e=>e.id==="review-url")?"review-url-error":undefined} value={evidenceUrl} onChange={(e) => {clearReviewApproval();setEvidenceUrl(e.target.value);}} spellCheck={false} placeholder="https://github.com/owner/repo/pull/123 or /commit/40-character-sha" />{reviewErrors.filter(e=>e.id==="review-url").map(e=><small className="field-error" id="review-url-error" key={e.id}>{e.message}</small>)}<small>Rouse fetches the public artifact and changed-file diff, then records a SHA-256 snapshot. Pull requests must be merged. A link alone is never approval.</small></label>
                  <label>How was the fix confirmed?<select value={verificationMethod} onChange={(e) => {clearReviewApproval();setVerificationMethod(e.target.value);}}>
                    <option value="reproduction-test">Reproduced and retested</option>
                    <option value="unit-test">Unit test</option>
                    <option value="integration-test">Integration test</option>
                    <option value="deployed-fix">Deployed fix verified</option>
                    <option value="maintainer-confirmed-fix">Maintainer-confirmed fix</option>
                  </select></label>
                </> : <>
                  <label>Later successful Sui transaction digest<input id="review-successor" aria-invalid={reviewErrors.some(e=>e.id==="review-successor")} aria-describedby={reviewErrors.some(e=>e.id==="review-successor")?"review-successor-error":undefined} value={successorDigest} onChange={(e) => {clearReviewApproval();setSuccessorDigest(e.target.value);}} spellCheck={false} placeholder="Real later success digest from the same sender" />{reviewErrors.filter(e=>e.id==="review-successor").map(e=><small className="field-error" id="review-successor-error" key={e.id}>{e.message}</small>)}<small>Tatum checks success, sender, chain timestamp, matching operation and a strictly later checkpoint.</small></label>
                  {successorDigest && <small>Success evidence: <a target="_blank" rel="noreferrer" href={"https://suivision.xyz/txblock/" + encodeURIComponent(successorDigest.trim())}>View submitted onchain follow-up ↗</a></small>}
                </>}
                <label>Exact engineering change<textarea id="review-change" aria-invalid={reviewErrors.some(e=>e.id==="review-change")} aria-describedby={reviewErrors.some(e=>e.id==="review-change")?"review-change-error":undefined} rows={3} value={reviewedChange} onChange={(e) => {clearReviewApproval();setReviewedChange(e.target.value);}} placeholder="Name the code, command, parameter, configuration or resource change and explain why it resolves this failure." />{reviewErrors.filter(e=>e.id==="review-change").map(e=><small className="field-error" id="review-change-error" key={e.id}>{e.message}</small>)}</label>
                {reviewApprovalChanged&&(!verified||!confirmedCausalLink)&&<p className="review-warning">Review details changed. Confirm both statements again before storing.</p>}
                <label className="review-checkbox"><input type="checkbox" checked={confirmedCausalLink} onChange={(e) => setConfirmedCausalLink(e.target.checked)} /><span>{proofMethod === "reviewed-evidence" ? "I reviewed this exact GitHub artifact and confirm its specific change resolves this incident. The selected test or verification method genuinely applies to this failure." : "I reviewed both executions and confirm this specific successful follow-up is the correction of the recorded incident. Tatum verifies execution and sender; it cannot infer my causal judgment."}</span></label>
                <div className="editor-pair"><label>Reviewer<input id="review-name" aria-invalid={reviewErrors.some(e=>e.id==="review-name")} aria-describedby={reviewErrors.some(e=>e.id==="review-name")?"review-name-error":undefined} value={reviewer} onChange={(e) => {clearReviewApproval();setReviewer(e.target.value);}} placeholder="Engineer name or handle" />{reviewErrors.filter(e=>e.id==="review-name").map(e=><small className="field-error" id="review-name-error" key={e.id}>{e.message}</small>)}</label><label>SDK version (optional)<input value={sdkVersion} onChange={(e) => {clearReviewApproval();setSdkVersion(e.target.value);}} placeholder="2.x" /></label></div>
                <label className="review-checkbox"><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} /><span>{proofMethod === "reviewed-evidence" ? "I am an authorized human reviewer. I inspected the original failure, the linked artifact and its changed files, and the selected verification evidence. I accept responsibility for confirming the causal relationship." : "I am an authorized human reviewer. I inspected the original failure, the specific engineering change and the successful follow-up, and accept responsibility for confirming their causal relationship."}</span></label>
                <button type="button" className="primary-button compact" disabled={busy || storagePending || receiptNeedsVerification || !verified || !reviewerKey || !confirmedCausalLink} onClick={() => void submitReview()}>{phase === "writing" ? "Verifying and writing…" : proofMethod === "reviewed-evidence" ? "Verify artifact, then store" : "Verify follow-up, then store"} ↗</button>
                <div className="observation-action">
                  <span>Don&apos;t have a confirmed fix? Save an authentic failure observation instead. It will never be presented as an engineer-approved resolution.</span>
                  <button type="button" className="secondary-button" disabled={busy || storagePending || receiptNeedsVerification || !reviewerKey} onClick={() => void rememberObservation()}>Save onchain observation to Walrus ↗</button>
                </div>
              </div>
            </div>}
    {(storagePending||proof)&&<section ref={storageRef} tabIndex={-1} className="storage-section" aria-label="Storage and recurrence"><div className="panel proof-panel"><div className="panel-kicker"><span>MEMORY PROVENANCE</span><span>WALRUS / MAINNET</span></div>
              <h3>{receiptNeedsVerification?"Saved receipt requires server verification.":exactBlobRecallPassed ? "Human-reviewed resolution recalled across incidents." : storagePending?failedStorageJob?"Storage job failed.":"Storage is awaiting confirmation.":proof ? observationOnly?"Observation stored. No resolution claimed.":"Mainnet write confirmed. Recall pending verification." : "Proof, not promises."}</h3>
              {storagePending&&<div className="proof-receipt"><span>{failedStorageJob?"STORAGE JOB FAILED · NO COMPLETED MEMORY":storageAttempt.jobId?"STORAGE JOB ACCEPTED · NOT YET A COMPLETED MEMORY":"STORAGE RESPONSE UNCONFIRMED · DO NOT RESUBMIT"}</span>{storageAttempt.jobId?<code>{storageAttempt.jobId}</code>:<label>Recover storage job ID<input value={recoveryJobId} onChange={event=>setRecoveryJobId(event.target.value)} placeholder="Existing Walrus job ID"/></label>}<p>Check the existing job to recover its receipt. This action never creates another memory.</p><button type="button" className="secondary-button" disabled={busy||!reviewerKey||(!storageAttempt.jobId&&!recoveryJobId.trim())} onClick={()=>{storageRef.current?.focus();void checkStorage();}}>Check storage status ↗</button>{failedStorageJob&&<button type="button" className="secondary-button" onClick={()=>{retainStorage(null);setFailedStorageJob(false);setError("");}}>Dismiss failed storage job</button>}</div>}
              <p>{receiptNeedsVerification?"This receipt was restored from browser storage. Verify the existing job with reviewer access before treating it as completed Mainnet evidence.":proof ? (observationOnly ? "An authentic onchain failure observation was stored. No repair or resolution was verified." : exactBlobRecallPassed ? "A distinct Tatum-confirmed failed incident recalled the reviewed resolution from the exact Walrus blob. Human causal review remains visible." : "Walrus storage completed, but a different comparable incident has not yet recalled the exact blob.") : "Only completed Mainnet writes with real blob IDs count. Observations are not the same as verified resolutions."}</p>
              {proof ? <div className="proof-receipt"><span>{receiptNeedsVerification?"SAVED RECEIPT · NOT REVERIFIED":"STORAGE RECEIPT"}</span><small>Source incident {writtenSourceDigest}</small><code>{proof.blobId}</code><small>Job {proof.jobId} · {proof.namespace}</small>{receiptNeedsVerification&&<><button type="button" className="secondary-button" disabled={busy||!reviewerKey} onClick={()=>{storageRef.current?.focus();void checkStorage();}}>Verify saved receipt ↗</button>{!reviewerKey&&<p className="caption">Use Reviewer access to verify this saved receipt. This read never creates another memory.</p>}</>}{!receiptNeedsVerification && !exactBlobRecallPassed && !observationOnly && writtenSourceDigest && <>
                    <label className="reviewer-access"><span>SECOND DISTINCT REAL FAILURE</span><input value={recurrenceDigest} onChange={(e) => setRecurrenceDigest(e.target.value)} placeholder="Digest of a comparable later failed incident" spellCheck={false}/><small>Rouse will independently fetch it through Tatum and require a compatible error before accepting the exact Walrus blob match.</small></label>
                    <button type="button" className="secondary-button" disabled={busy || !reviewerKey || !recurrenceDigest.trim()} onClick={() => void verifySavedRecall(proof, writtenSourceDigest, recurrenceDigest)}>Verify exact-blob recurrence — no new Walrus write ↗</button>
                  </>}</div> : <div className="proof-placeholder">NO CONFIRMED WRITE IN THIS SESSION</div>}</div></section>}
    <div className="inventory-strip"><span>Evidence tiers: observed · simulation-tested · human-reviewed</span><span>{inventoryUnavailable?"Inventory unavailable — no completed-count conclusion.":inventory?`${inventory.complete?"":"At least "}${inventory.allStoredMemories} completed memories · all types · ${inventory.namespace}${inventory.complete?"":" · incomplete inventory"}`:"Checking completed-memory inventory…"}</span>{inventoryUnavailable&&<button className="text-link" disabled={busy} onClick={()=>void refreshInventory()}>Retry inventory read</button>}</div>
    <details className="legacy-controls"><summary>Historical technical controls</summary><p>Separate earlier investigation; these controls are not reviewed fixes.</p>{LEGACY_CONTROL_EXAMPLES.map(item=><button className="secondary-button" key={item.digest} disabled={busy||!status?.tatumConfigured} onClick={()=>{setDigest(item.digest);void inspect(item.digest);}}>{item.label} ↗</button>)}</details>
  </main><SiteFooter /></div>;
}
