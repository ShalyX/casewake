// Actual integration reads and rejected submissions only. Never starts a memory write.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const base=process.env.CASEWAKE_BASE_URL||'http://127.0.0.1:4220';
const receipt=JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname,'../../evidence/real-case/reviewed-memory-receipt.json'),'utf8')).data;
const key=process.env.WORKSPACE_WRITE_KEY;
if(!key)throw new Error('Reviewer environment is required for read-only acceptance.');
const proof={checkedAt:new Date().toISOString(),base,memoryWrites:0,checks:{}};
const out=path.resolve(import.meta.dirname,'../../evidence/phase14/read-only-acceptance.json');
async function call(route,body,authorized=true){
 const response=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...(authorized?{'x-workspace-key':key}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(110000)});
 return {status:response.status,data:await response.json()};
}
async function check(name,run,validate){const value=await run();proof.checks[name]=value;fs.writeFileSync(out,JSON.stringify(proof,null,2)+'\n');validate(value);console.log('PASS',name,value.status);}
const query=new URLSearchParams({jobId:receipt.proof.jobId,sourceDigest:receipt.record.digest,requestId:receipt.record.id,kind:'resolution'});
await check('completedExistingJob',()=>call('/api/memory-job?'+query),r=>{assert.equal(r.status,200);assert.equal(r.data.proof.blobId,receipt.proof.blobId);});
await check('jobReadProtected',()=>call('/api/memory-job?'+query,undefined,false),r=>assert.equal(r.status,403));
const wrongSource=new URLSearchParams(query);wrongSource.set('sourceDigest','4'.repeat(43));
await check('wrongIncidentCannotRecoverReceipt',()=>call('/api/memory-job?'+wrongSource),r=>{assert.equal(r.status,202);assert.equal(r.data.proof,undefined);});
await check('malformedDigest',()=>call('/api/transaction',{digest:'not-a-digest'}),r=>assert.equal(r.status,400));
await check('credentialContentRejected',()=>call('/api/remember',{
 digest:receipt.record.digest,diagnosis:'TEST ONLY: API_KEY=synthetic_fixture_secret_123456789',resolutionSteps:'TEST ONLY: no case is approved and no write is authorized.',reviewer:'Test reviewer',evidenceUrl:receipt.record.evidenceUrl,
 resolutionKind:'reviewed-evidence',verificationMethod:'integration-test',reviewedChange:'TEST ONLY: exercise rejection before any network memory write.',verified:true,confirmedCausalLink:false,
}),r=>{assert.equal(r.status,400);assert.match(r.data.error,/Remove credentials/);});
await check('completedInventory',()=>call('/api/memories'),r=>{assert.equal(r.status,200);assert.equal(r.data.allStoredMemories,13);assert.equal(r.data.complete,true);});
proof.status='VERIFIED';fs.writeFileSync(out,JSON.stringify(proof,null,2)+'\n');console.log('PHASE14_READ_ONLY_ACCEPTANCE=PASS');
