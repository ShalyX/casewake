// Bounded authorized audit of owned app: reads and guaranteed-invalid/rejected submissions only.
import fs from 'node:fs';
const base=process.env.ROUSE_ACCEPTANCE_BASE||'https://casewake.vercel.app';
const out=process.env.ROUSE_REDTEAM_OUTPUT||'evidence/phase25/api-attack.json';
const key=process.env.WORKSPACE_WRITE_KEY;if(!key)throw new Error('Reviewer environment required for pre-write rejection controls.');
const checks=[];async function probe(name,path,{body,raw,auth=false,method='POST',origin}={},expected){
 const response=await fetch(base+path,{method,headers:{'content-type':'application/json',...(auth?{'x-workspace-key':key}:{}),...(origin?{origin}: {})},body:method==='GET'?undefined:raw===undefined?JSON.stringify(body):raw,signal:AbortSignal.timeout(110000)});
 const text=await response.text();let data;try{data=JSON.parse(text);}catch{data=null;}
 const passed=expected(response.status,data,response.headers);checks.push({name,path,status:response.status,passed,error:typeof data?.error==='string'?data.error:undefined,...(path==='/api/acceptance'?{gates:{gate1:data?.gate1?.state,gate2:data?.gate2?.state,gate3:data?.gate3?.state},constraints:data?.constraints}:{})});
 fs.writeFileSync(out,JSON.stringify({base,checks,passed:checks.every(x=>x.passed),memoryWrites:0,scope:'Bounded reads and pre-write rejection controls; no approved case or observation submission'},null,2)+'\n');
}
for(const path of ['/api/remember','/api/observations','/api/verify-recall']){
 await probe('anonymous full-attestation attempt rejected '+path,path,{body:{verified:true,confirmedCausalLink:true,digest:'4'.repeat(43)}},s=>s===403);
 await probe('cross-origin anonymous request rejected '+path,path,{body:{verified:true},origin:'https://untrusted.invalid'},s=>s===403);
 for(const [label,raw]of[['null','null'],['invalid-json','{invalid']])await probe('authorized malformed body rejected '+label+' '+path,path,{raw,auth:true},s=>s===400);
}
for(const body of [null,[],{query:['MoveAbort']},{query:''},{query:' '},{query:'a'},{query:'x'.repeat(2001)}])await probe('search invalid shape/length '+JSON.stringify(body).slice(0,60),'/api/cases/search',{body},s=>s===400);
for(const digest of [null,{},'0'.repeat(43),'1'.repeat(65),'<script>window.__rouseAttack=1</script>'])await probe('invalid digest '+JSON.stringify(digest).slice(0,65),'/api/transaction',{body:{digest}},s=>s===400);
await probe('read route rejects deletion','/api/cases',{method:'DELETE'},s=>s===405);
await probe('legacy acceptance never upgrades blocked historical repair','/api/acceptance',{method:'GET'},(s,d)=>s===200&&d?.gate1?.state==='partial'&&d?.gate3?.state==='blocked-until-gate1-and-gate2-pass'&&d?.constraints?.historicalRouteRepaired===false&&d?.constraints?.signedOrExecuted===false);
await probe('job recovery rejects anonymous access','/api/memory-job?jobId=22222222-2222-4222-8222-222222222222',{method:'GET'},s=>s===403);
await probe('job recovery validates identity before lookup','/api/memory-job?jobId=not-a-job',{method:'GET',auth:true},s=>s===400);
await probe('human verification cannot be string-coerced','/api/remember',{body:{digest:'8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA',diagnosis:'CONTROLLED rejection fixture; no human review is approved.',resolutionSteps:'CONTROLLED rejection fixture; no storage is authorized.',reviewer:'QA rejection fixture',evidenceUrl:'https://127.0.0.1/rejection-only',resolutionKind:'reviewed-evidence',reviewedChange:'CONTROLLED rejection only; not a reviewed engineering correction.',verificationMethod:'integration-test',confirmedCausalLink:false,verified:'true'},auth:true},s=>s===400);
await probe('malformed observation digest never reaches storage','/api/observations',{body:{digest:'not-a-digest'},auth:true},s=>s===400);
const template={digest:'8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA',diagnosis:'CONTROLLED QA invalid evidence; no resolution is approved.',resolutionSteps:'CONTROLLED QA reject this request before any storage call.',reviewer:'QA rejection fixture',verified:true,confirmedCausalLink:true,resolutionKind:'reviewed-evidence',verificationMethod:'integration-test',reviewedChange:'CONTROLLED QA only: invalid artifact host must never be fetched or stored.'};
for(const evidenceUrl of ['https://127.0.0.1/rouse-rejection-control','https://github.com@127.0.0.1/rouse-rejection-control'])await probe('non-GitHub evidence rejected without storage','/api/remember',{auth:true,body:{...template,evidenceUrl}},s=>s===409);
await probe('wrong expected blob cannot verify recurrence','/api/verify-recall',{auth:true,body:{sourceDigest:template.digest,secondDigest:'HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV',expectedBlobId:'CONTROLLED-WRONG-BLOB'}},s=>s===409);
const failed=checks.filter(x=>!x.passed);console.log(JSON.stringify({checks:checks.length,failed,memoryWrites:0}));
if(failed.length)process.exitCode=1;
