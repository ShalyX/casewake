// Read-only production acceptance. Reuses the existing completed Walrus blob.
// The write endpoints receive only empty unauthorized requests and cannot store a case.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const base=(process.env.CASEWAKE_BASE_URL||'https://casewake.vercel.app').replace(/\/$/,'');
const sourceDigest='8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA';
const secondDigest='HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV';
const mismatchDigest='Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp';
const expectedBlobId='KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY';
const dir=path.resolve(import.meta.dirname,'../../evidence/production-reviewed-case');
fs.mkdirSync(dir,{recursive:true});
const result={checkedAt:new Date().toISOString(),base,readOnly:true,expectedBlobId,checks:{},memoryWrites:0};
function save(){fs.writeFileSync(path.join(dir,'acceptance.json'),JSON.stringify(result,null,2)+'\n');}
async function request(route,body,{key,read=true}={}){
 for(let attempt=0;attempt<(read?3:1);attempt++){
  const response=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...(key?{'x-workspace-key':key}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(110000)});
  const data=await response.json();const value={status:response.status,data};
  if(read&&[429,502,503,504].includes(response.status)&&attempt<2){console.log('RETRY_READ',route,response.status);continue;}
  return value;
 }
}
async function check(name,operation,validate){
 const response=await operation();result.checks[name]=response;save();validate(response);
 console.log('PASS',name,response.status);
}
try{
 await check('configuration',()=>request('/api/status'),r=>{assert.equal(r.status,200);assert.equal(r.data.tatumConfigured,true);assert.equal(r.data.walrusConfigured,true);assert.equal(r.data.publicDemoMode,true);assert.equal(r.data.reviewerWritesEnabled,true);});
 await check('inventory',()=>request('/api/memories'),r=>{assert.equal(r.status,200);assert.equal(r.data.complete,true);assert.ok(r.data.allStoredMemories>=13);});
 for(const [name,digest]of [['sourceTransaction',sourceDigest],['recurrenceTransaction',secondDigest]]){
  await check(name,()=>request('/api/transaction',{digest}),r=>{assert.equal(r.status,200);assert.equal(r.data.transaction.outcome,'failed');assert.equal(r.data.transaction.source,'Tatum Sui gRPC');});
 }
 await check('publicExactBlobRecall',()=>request('/api/recall',{digest:secondDigest}),r=>{
  assert.equal(r.status,200);assert.notEqual(r.data.recallDegraded,true);
  const match=r.data.candidates.find(c=>c.record.digest===sourceDigest&&c.verdict==='eligible-for-review'&&c.walrusReceipt?.blobId===expectedBlobId);
  assert.ok(match,'exact reviewed blob must be eligible for distinct failure');assert.equal(match.record.reviewer,'ShalyX');
 });
 await check('publicSelfMatchExcluded',()=>request('/api/recall',{digest:sourceDigest}),r=>{assert.equal(r.status,200);assert.ok(!r.data.candidates.some(c=>c.record.digest===sourceDigest&&c.verdict==='eligible-for-review'));});
 await check('publicUnrelatedExcluded',()=>request('/api/recall',{digest:mismatchDigest}),r=>{assert.equal(r.status,200);assert.ok(!r.data.candidates.some(c=>c.record.digest===sourceDigest&&c.verdict==='eligible-for-review'));});
 await check('unknownPublicDigestBlocked',()=>request('/api/transaction',{digest:'6NJrsdCPfda8FzRaMEDpGpwWyg1xpD5TDZCDXwV47T4v'}),r=>assert.equal(r.status,403));
 await check('anonymousRememberBlocked',()=>request('/api/remember',{}, {read:false}),r=>assert.equal(r.status,403));
 await check('anonymousObservationBlocked',()=>request('/api/observations',{}, {read:false}),r=>assert.equal(r.status,403));
 const verification={sourceDigest,secondDigest,expectedBlobId};
 await check('anonymousVerifierProtected',()=>request('/api/verify-recall',verification),r=>assert.equal(r.status,403));
 if(process.env.WORKSPACE_WRITE_KEY){
  const options={key:process.env.WORKSPACE_WRITE_KEY};
  await check('reviewerExactBlobVerification',()=>request('/api/verify-recall',verification,options),r=>{assert.equal(r.status,200);assert.equal(r.data.gate3,'verified');assert.equal(r.data.walrusReceipt.blobId,expectedBlobId);});
  await check('reviewerSelfRejected',()=>request('/api/verify-recall',{...verification,secondDigest:sourceDigest},options),r=>assert.equal(r.status,400));
  await check('reviewerMismatchRejected',()=>request('/api/verify-recall',{...verification,secondDigest:mismatchDigest},options),r=>assert.equal(r.status,409));
 }
 result.status='VERIFIED';save();console.log('PUBLIC_REVIEWED_CASE_ACCEPTANCE=PASS; memoryWrites=0');
}catch(error){result.status='FAILED';result.error=error.message;save();throw error;}
