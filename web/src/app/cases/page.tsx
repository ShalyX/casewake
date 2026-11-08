"use client";
import Link from "next/link";
import { useCallback,useEffect,useRef,useState } from "react";
import { SiteHeader,SiteFooter } from "@/components/site-chrome";
import { requestJson } from "@/lib/browser-request";
import type { CaseCatalog,ReviewedLibraryCase } from "@/lib/case-discovery";

type Hit={record:ReviewedLibraryCase;matchedTerms:string[];relationship:'related-only'};
export default function ReviewedCases(){
  const [query,setQuery]=useState('');const [submitted,setSubmitted]=useState('');
  const [catalog,setCatalog]=useState<CaseCatalog|null>(null);const [hits,setHits]=useState<Hit[]>([]);
  const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  const sequence=useRef({id:0,mounted:false});
  const load=useCallback(async(text='')=>{
    const state=sequence.current;const id=++state.id;setLoading(true);setError('');setCatalog(null);setHits([]);setSubmitted(text);
    try{
      const data=await requestJson(text?'/api/cases/search':'/api/cases',text?{query:text}:undefined,undefined,90000) as unknown as CaseCatalog&{results?:Hit[]};
      if(!state.mounted||state.id!==id)return;
      setCatalog(data);setHits(text?data.results||[]:(data.cases||[]).map(record=>({record,matchedTerms:[],relationship:'related-only'})));
    }catch(e){if(state.mounted&&state.id===id)setError(e instanceof Error?e.message:'The reviewed-case library is unavailable.');}
    finally{if(state.mounted&&state.id===id)setLoading(false);}
  },[]);
  useEffect(()=>{
    let mounted=true;const state=sequence.current;state.mounted=true;
    queueMicrotask(()=>{if(mounted)void load();});
    return()=>{mounted=false;state.mounted=false;state.id++;};
  },[load]);
  return <div className="rouse-shell"><SiteHeader /><main className="case-library">
    <header className="library-intro"><div><div className="eyebrow">Reviewed engineering knowledge / Sui</div><h1>Find an earlier resolution.</h1><p>Search an error name, module or procedure. Browse the reviewed evidence before checking whether it applies to your own failure.</p></div><Link className="secondary-button" href="/workspace">Have a transaction digest? Inspect it ↗</Link></header>
    <form className="case-search" onSubmit={event=>{event.preventDefault();if(!loading)void load(query.trim());}}><label htmlFor="case-query">Error text or keywords</label><textarea id="case-query" value={query} onChange={e=>setQuery(e.target.value)} maxLength={2000} minLength={3} rows={2} placeholder="e.g. MoveAbort, big_vector::leaf_remove, or duplicate cancellation"/><div className="search-actions"><button className="primary-button" type="submit" disabled={loading||query.trim().length<3}>Search reviewed cases ↗</button><button className="text-link" type="button" disabled={loading} onClick={()=>{setQuery('');void load();}}>Browse reviewed cases</button></div><p className="caption">Error-text results are related reading. A transaction inspection checks network, failure and package compatibility. No reviewer access is needed to inspect a digest.</p></form>
    <section className="library-results" aria-label="Reviewed-case results" aria-busy={loading}>
      <p role="status" aria-live="polite" aria-atomic="true" className="library-status">{loading?'Reading the reviewed-case library…':error?'Case discovery is unavailable.':`${hits.length} ${submitted?'related reviewed case'+(hits.length===1?'':'s'):'reviewed case'+(hits.length===1?'':'s')} ${submitted?'found for this search.':'retrieved.'}`}</p>
      {error?<div className="inline-error"><p>{error}</p><button type="button" className="secondary-button" onClick={()=>void load(submitted)}>Retry case discovery</button></div>:null}
      {catalog&&!loading&&<div className="library-scope"><span>Workspace: {catalog.namespace} · checked {new Date(catalog.checkedAt).toLocaleString()}</span><p>{catalog.coverageComplete?'Completed records in this workspace were checked. Observations and simulation runbooks are excluded from this library.':'Catalogue coverage is incomplete. Some records could not be retrieved; absence here is not proof that a resolution does not exist.'}</p></div>}
      {!loading&&!error&&!hits.length&&<div className="library-empty"><h2>{submitted?'No related reviewed cases found.':'No reviewed resolutions retrieved.'}</h2><p>{submitted?'Try a shorter error signature or module name. You can also inspect your digest to look for compatible precedents.':'Only completed, evidence-linked human-reviewed resolutions appear here. This does not say that your problem has no solution.'}</p><Link className="text-link" href="/workspace">Inspect my transaction ↗</Link></div>}
      {!loading&&!error&&hits.map(({record,matchedTerms})=><article className="library-card" key={record.id}>
        <div className="library-case-main"><div className="panel-kicker"><span>Human-reviewed resolution</span><span>{submitted?'Related by error text':'Reviewed case'}</span></div><h2>{record.title}</h2><p className="library-procedure">{record.procedure}</p>{matchedTerms.length>0&&<p className="caption">Text matches: {matchedTerms.join(', ')}</p>}<p className="library-caution">Applicability to your failure has not been checked. Confirm the transaction context and SDK compatibility before reuse.</p><Link className="primary-button" href="/workspace">Inspect my transaction ↗</Link><details className="provenance-details"><summary>Error and original context</summary><p>{record.diagnosis}</p><pre>{record.errorText}</pre><p>Original source transaction</p><code>{record.sourceDigest}</code><p>Package</p><code>{record.packageId||'Not established'}</code><p>Reviewed SDK: {record.sdkVersion||'Not recorded'}</p><p>Evidence scope: {record.evidenceScope}</p><a className="text-link" href={'https://suivision.xyz/txblock/'+encodeURIComponent(record.sourceDigest)} target="_blank" rel="noreferrer">View original execution ↗</a></details></div>
        <aside className="library-case-origin"><div className="eyebrow">Retained evidence</div><p>Reviewed by <strong>{record.reviewer}</strong><br/>{new Date(record.reviewedAt).toLocaleDateString()}</p><a className="text-link" href={record.evidenceUrl} target="_blank" rel="noreferrer">Original engineering evidence ↗</a><div className="exact-blob"><span>Completed Walrus blob</span><code>{record.blobId}</code><small>{record.namespace}</small></div><p className="caption">This record establishes a reviewed procedure. It does not establish that your incident has been resolved.</p></aside>
      </article>)}
    </section>
  </main><SiteFooter /></div>;
}
