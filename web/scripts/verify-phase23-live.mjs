// Actual integration reads and known pre-write rejections. Never submits an approved case.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.ROUSE_ACCEPTANCE_BASE||'http://127.0.0.1:4242';
const key=process.env.WORKSPACE_WRITE_KEY;if(!key)throw new Error('Existing-job reads require reviewer environment.');
const saved=JSON.parse(fs.readFileSync(new URL('../../evidence/real-case/reviewed-memory-receipt.json',import.meta.url),'utf8')).data;
const output=new URL('../../evidence/phase23/live-acceptance.json',import.meta.url);
const proof={base,startedAt:new Date().toISOString(),checks:[],memoryWrites:0,responses:{}};
async function call(path,body,auth=false){const r=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...(auth?{'x-workspace-key':key}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(110000)});return {status:r.status,data:await r.json()};}
async function check(name,request,validate){const result=await request();proof.responses[name]=result;validate(result);proof.checks.push(name);fs.writeFileSync(output,JSON.stringify(proof,null,2)+'\n');console.log('PASS',name);return result;}
await check('configurationIsNotLiveProof',()=>call('/api/status'),r=>{assert.equal(r.status,200);assert.equal(r.data.checksAreLive,false);assert.equal(r.data.publicInspectionEnabled,true);});
const before=await check('completedInventoryBefore',()=>call('/api/memories'),r=>{assert.equal(r.status,200);assert.equal(r.data.complete,true);assert.ok(r.data.allStoredMemories>=10);});
for(const [name,digest,outcome] of [['actualFailure','6NJrsdCPfda8FzRaMEDpGpwWyg1xpD5TDZCDXwV47T4v','failed'],['actualSuccess','DmskUFSYixcpEcNgJyyquQH6q8t7fA856Y6rzZuVbBQv','succeeded'],['actualNotFound','3AkKcrSrqPqD8JA2UBgecq3fES6Tm73v4aDHbdSnyUzt','unknown']]){
 await check(name,()=>call('/api/transaction',{digest}),r=>{assert.equal(r.status,200);assert.equal(r.data.transaction.outcome,outcome);assert.equal(r.data.transaction.source,'Tatum Sui gRPC');assert.equal(r.data.transaction.digest,digest);});
 if(outcome!=='failed')await check(name+'NoPrecedent',()=>call('/api/recall',{digest}),r=>{assert.equal(r.status,200);assert.equal(r.data.candidates.length,0);assert.equal(r.data.transaction.outcome,outcome);});
}
await check('arbitraryOwnDigest',()=>call('/api/transaction',{digest:'2gPTra7CwyfiZMvqwgeerJSWippu1JeBsnDsiSb1iTFm'}),r=>{assert.equal(r.status,200);assert.equal(r.data.transaction.outcome,'failed');});
const catalog=await check('reviewedLibrary',()=>call('/api/cases'),r=>{assert.equal(r.status,200);assert.ok(r.data.cases.some(c=>c.blobId===saved.proof.blobId&&c.reviewer==='ShalyX'));assert.ok(r.data.cases.every(c=>!('verdict' in c)));});
await check('errorTextSearch',()=>call('/api/cases/search',{query:'big_vector::leaf_remove'}),r=>{assert.equal(r.status,200);assert.equal(r.data.relationship,'related-only');assert.ok(r.data.results.some(c=>c.record.blobId===saved.proof.blobId));});
await check('unrelatedSearch',()=>call('/api/cases/search',{query:'browser CORS'}),r=>{assert.equal(r.status,200);assert.equal(r.data.results.length,0);});
for(const query of ['a','x'.repeat(2001)])await check('searchBounds'+query.length,()=>call('/api/cases/search',{query}),r=>assert.equal(r.status,400));
const query=new URLSearchParams({jobId:saved.proof.jobId,sourceDigest:saved.record.digest,requestId:saved.record.id,kind:'resolution'});
await check('recoverExistingCompletedJob',()=>call('/api/memory-job?'+query,undefined,true),r=>{assert.equal(r.status,200);assert.equal(r.data.proof.blobId,saved.proof.blobId);});
const wrongQuery=new URLSearchParams(query);wrongQuery.set('sourceDigest','4'.repeat(43));
await check('rejectWrongReceiptIdentity',()=>call('/api/memory-job?'+wrongQuery,undefined,true),r=>{assert.equal(r.status,202);assert.equal(r.data.proof,undefined);});
const recurrence={sourceDigest:saved.record.digest,secondDigest:'HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV',expectedBlobId:saved.proof.blobId};
await check('exactReviewedBlobRecurrence',()=>call('/api/verify-recall',recurrence,true),r=>{assert.equal(r.status,200);assert.equal(r.data.gate3,'verified');assert.equal(r.data.matchedCandidate.walrusReceipt.blobId,saved.proof.blobId);});
await check('selfRecallRejected',()=>call('/api/verify-recall',{...recurrence,secondDigest:recurrence.sourceDigest},true),r=>assert.equal(r.status,400));
await check('unrelatedRecallRejected',()=>call('/api/verify-recall',{...recurrence,secondDigest:'Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp'},true),r=>assert.equal(r.status,409));
await check('malformedDigest',()=>call('/api/transaction',{digest:'not-a-digest'}),r=>assert.equal(r.status,400));
for(const path of ['/api/remember','/api/observations','/api/verify-recall'])await check(path+'Protected',()=>call(path,{}),r=>assert.equal(r.status,403));
await check('receiptRecoveryProtected',()=>call('/api/memory-job?'+query),r=>assert.equal(r.status,403));
await check('humanApprovalRequired',()=>call('/api/remember',{verified:false},true),r=>assert.equal(r.status,400));
await check('credentialsRejectedBeforeWrite',()=>call('/api/remember',{digest:saved.record.digest,diagnosis:'QA ONLY API_KEY=synthetic_fixture_secret_123456789',resolutionSteps:'QA ONLY: no case is approved; storage must never start.',reviewer:'QA fixture',evidenceUrl:saved.record.evidenceUrl,resolutionKind:'reviewed-evidence',verified:true,confirmedCausalLink:false},true),r=>{assert.equal(r.status,400);assert.match(r.data.error,/Remove credentials/);});
await check('completedInventoryAfter',()=>call('/api/memories',undefined,true),r=>{assert.equal(r.status,200);assert.equal(r.data.complete,true);assert.equal(r.data.allStoredMemories,before.data.allStoredMemories);});
proof.catalog={count:catalog.data.cases.length,coverageComplete:catalog.data.coverageComplete,completedRecordsExamined:catalog.data.completedRecordsExamined};proof.passed=true;proof.completedAt=new Date().toISOString();fs.writeFileSync(output,JSON.stringify(proof,null,2)+'\n');console.log('PASS',proof.checks.length,'actual integration/read/access checks; new Mainnet writes0');
