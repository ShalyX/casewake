from pathlib import Path
p=Path(r"C:\Users\USER\Documents\Codex\2026-11-01\total-recall\web\src\app\workspace\page.tsx")
s=p.read_text(encoding='utf8')
replacements=[
('type Proof = { jobId: string; blobId: string; owner: string; namespace: string; status: string };',
 '''type Proof = { jobId: string; blobId: string; owner?: string; namespace: string; status?: string };
type ObservedPrecedent = { case: {digest: string; errorText: string; sourceUrl: string; resolutionVerified: false}; distance: number };
type Inventory = { allStoredMemories: number; namespace: string; complete: boolean };'''),
('const [candidates, setCandidates] = useState<Candidate[]>([]);',
 '''const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [observedPrecedents, setObservedPrecedents] = useState<ObservedPrecedent[]>([]);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [observationOnly, setObservationOnly] = useState(false);'''),
('useEffect(() => { fetch("/api/status").then((r) => r.json()).then(setStatus).catch(() => setError("Status endpoint unavailable.")); }, []);',
 '''useEffect(() => {
    fetch("/api/status").then((r) => r.json()).then(setStatus).catch(() => setError("Status endpoint unavailable."));
    fetch("/api/memories").then((r) => r.ok ? r.json() : null).then(setInventory).catch(() => {});
  }, []);
  async function refreshInventory() {
    try { const r=await fetch("/api/memories"); if(r.ok)setInventory(await r.json() as Inventory); } catch { /* inventory is supplementary */ }
  }'''),
('setError(""); setRecallNote(""); setProof(null); setCandidates([]); setTx(null);',
 'setError(""); setRecallNote(""); setProof(null); setCandidates([]); setObservedPrecedents([]); setTx(null);'),
('setCandidates((recalled.candidates || []) as Candidate[]);',
 '''setCandidates((recalled.candidates || []) as Candidate[]);
        setObservedPrecedents((recalled.observedPrecedents || []) as ObservedPrecedent[]);'''),
('setError(""); setProof(null);\n    try {\n      setPhase("writing");',
 'setError(""); setProof(null); setObservationOnly(false);\n    try {\n      setPhase("writing");'),
('setShowEditor(false);\n      setPhase("recalling");',
 'setShowEditor(false);\n      await refreshInventory();\n      setPhase("recalling");'),
('const eligible = candidates.filter((c) => c.verdict === "eligible-for-review");',
 '''async function rememberObservation() {
    if (!tx || tx.outcome !== "failed") return;
    setError(""); setProof(null); setObservationOnly(true);
    try {
      setPhase("writing");
      const result=await postJson("/api/observations",{digest:tx.digest},reviewerKey);
      const stored = result.proof as Proof;
      setProof(stored);
      await refreshInventory();
      setPhase("recalling");
      const recalled=await postJson("/api/recall",{digest:tx.digest});
      setCandidates((recalled.candidates || []) as Candidate[]);
      setObservedPrecedents((recalled.observedPrecedents || []) as ObservedPrecedent[]);
      setRecallNote(String(recalled.reason || ""));
    } catch(e){setError(e instanceof Error ? e.message : "Observation write failed.");}
    finally{setPhase("idle");}
  }

  const eligible = candidates.filter((c) => c.verdict === "eligible-for-review");'''),
('''<button type="button" className="primary-button compact" disabled={busy || !verified} onClick={() => void remember()}>{phase === "writing" ? "Writing to Walrus…" : "Save confirmed memory"} ↗</button>''',
 '''<button type="button" className="primary-button compact" disabled={busy || !verified} onClick={() => void remember()}>{phase === "writing" ? "Writing to Walrus…" : "Save human-verified resolution"} ↗</button>
                <div className="observation-action">
                  <span>Don't have a confirmed fix? Save an authentic failure observation instead. It will never be presented as an engineer-approved resolution.</span>
                  <button type="button" className="secondary-button" disabled={busy || !reviewerKey} onClick={() => void rememberObservation()}>Save onchain observation to Walrus ↗</button>
                </div>'''),
('''{rejected.length > 0 && <details className="rejected">''',
 '''{observedPrecedents.length > 0 && <div className="observed-group">
                  <div className="panel-kicker"><span>REPEATED ONCHAIN FAILURES / NO VERIFIED FIX</span><span>{observedPrecedents.length} MATCHES</span></div>
                  {observedPrecedents.map((hit) => <article className="observed-card" key={hit.case.digest}>
                    <span>PREVIOUSLY OBSERVED · RESOLUTION UNVERIFIED</span>
                    <strong>{shortDigest(hit.case.digest)}</strong>
                    <p>{hit.case.errorText}</p>
                    <a href={hit.case.sourceUrl} target="_blank" rel="noreferrer">View original Tatum-grounded transaction ↗</a>
                  </article>)}
                </div>}
                {rejected.length > 0 && <details className="rejected">'''),
('''{!eligible.length && <div className="memory-zero">''',
 '''{!eligible.length && !observedPrecedents.length && <div className="memory-zero">'''),
('''<div className="panel-kicker"><span>MEMORY PROVENANCE</span><span>WALRUS / MAINNET</span></div><h3>{proof ? "Write confirmed." : "Proof, not promises."}</h3><p>{proof ? "A real Walrus storage job completed. The receipt below is returned by the relayer." : "A memory only counts after its write job finishes and Walrus returns a blob ID."}</p>''',
 '''<div className="panel-kicker"><span>MEMORY PROVENANCE</span><span>WALRUS / MAINNET</span></div>
              <h3>{proof ? "Mainnet write confirmed." : "Proof, not promises."}</h3>
              <p>{proof ? (observationOnly ? "An authentic onchain failure observation was stored. No repair or resolution was verified." : "A reviewer-confirmed case was stored; the original evidence remains reviewable.") : "Only completed Mainnet writes with real blob IDs count. Observations are not the same as verified resolutions."}</p>
              {inventory && <div className="inventory-count"><strong>{inventory.allStoredMemories}</strong><span>Stored namespace memories (all types; including smoke tests). This is not a count of verified resolutions.</span></div>}''')
]
for old,new in replacements:
 count=s.count(old)
 if count != 1 and not (old=='setCandidates((recalled.candidates || []) as Candidate[]);' and count==2):
  raise RuntimeError(f'Unexpected match count {count} for {old[:55]!r}')
 s=s.replace(old,new)
p.write_text(s,encoding='utf8')
print('WORKSPACE_UPDATED',len(replacements))
