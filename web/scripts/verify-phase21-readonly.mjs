import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const base=process.env.ROUSE_ACCEPTANCE_BASE||'http://127.0.0.1:4242';
const receipt=JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname,'../../evidence/real-case/reviewed-memory-receipt.json'),'utf8')).data;
const key=process.env.WORKSPACE_WRITE_KEY;if(!key)throw new Error('Reviewer environment needed for existing-job read.');
const result={base,checkedAt:new Date().toISOString(),checks:[],memoryWrites:0};
async function call(route,body,auth=true){const r=await fetch(base+route,{method:body?'POST':'GET',headers:{'content-type':'application/json',...(auth?{'x-workspace-key':key}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(100000)});return {status:r.status,data:await r.json()};}
const query=new URLSearchParams({jobId:receipt.proof.jobId,sourceDigest:receipt.record.digest,requestId:receipt.record.id,kind:'resolution'});
const completed=await call('/api/memory-job?'+query);assert.equal(completed.status,200);assert.equal(completed.data.proof.blobId,receipt.proof.blobId);result.checks.push('Actual existing Mainnet job returns exact completed blob');
assert.equal((await call('/api/memory-job?'+query,undefined,false)).status,403);result.checks.push('Existing-job recovery remains protected');
const payload={sourceDigest:receipt.record.digest,secondDigest:'HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV',expectedBlobId:receipt.proof.blobId};
const recalled=await call('/api/verify-recall',payload);assert.equal(recalled.status,200);assert.equal(recalled.data.matchedCandidate.walrusReceipt.blobId,receipt.proof.blobId);result.checks.push('Distinct actual failure verifies exact stored blob');
assert.notEqual((await call('/api/verify-recall',{...payload,secondDigest:payload.sourceDigest})).status,200);result.checks.push('Self-recall rejected');
assert.notEqual((await call('/api/verify-recall',{...payload,secondDigest:'Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp'})).status,200);result.checks.push('Unrelated failure rejected');
const inv=await call('/api/memories');assert.equal(inv.status,200);result.inventory=inv.data;result.blob=receipt.proof.blobId;result.passed=true;
fs.writeFileSync(path.resolve(import.meta.dirname,'../../evidence/phase21/read-only-acceptance.json'),JSON.stringify(result,null,2)+'\n');console.log('PASS',result.checks.length,'read-only acceptance checks; no memory writes');
