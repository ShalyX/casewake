// Protected application APIs only. Default is read-only payload preparation.
// No signing or chain execution. A reviewed Walrus write is attempted at most once.
import fs from 'node:fs';
import path from 'node:path';
const dir=path.resolve(import.meta.dirname,'../../evidence/real-case');
const sourceDigest='8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA';
const secondDigest='HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV';
const payload={digest:sourceDigest,
 diagnosis:'Duplicate cancellation of an already-cancelled DeepBook order. Tatum confirms an earlier successful cancellation of the identical sender/package/pool/balance manager/asset types/order ID.',
 resolutionSteps:'Reconcile the order against authenticated prior successful cancellation effects for the exact cancellation identity. If an earlier identical cancellation succeeded, mark the local order as already cancelled and stop retrying. Otherwise investigate. Independent reference integration replay proves this procedure on two genuine failures; original operator deployment is unknown and no onchain repair is claimed.',
 resolutionKind:'reviewed-evidence',verificationMethod:'integration-test',
 reviewedChange:'Independently authored a cancellation-reconciliation adapter that recognizes an exact earlier successful cancellation before treating a duplicate retry as unresolved. Real finalized history replay resolves this incident and a distinct recurrence. This corrects integration interpretation/retry behavior; the original operator application change is unknown.',
 reviewer:null,verified:false,confirmedCausalLink:false,evidenceUrl:null};
if(!process.argv.includes('--write')){console.log(JSON.stringify({mode:'REVIEW ONLY; no network write',payload},null,2));process.exit(0);}
const approvalFile=process.env.CASEWAKE_CASE_APPROVAL_FILE;
if(!approvalFile)throw new Error('Human approval file required; prepare it only after explicit review.');
const approval=JSON.parse(fs.readFileSync(approvalFile,'utf8'));
if(approval.approved!==true||approval.sourceDigest!==sourceDigest||approval.scope!=='independent-integration-reconciliation'||
 typeof approval.reviewer!=='string'||!approval.reviewer.trim()||
 !/^https:\/\/github\.com\/ShalyX\/casewake\/commit\/[a-f0-9]{40}$/.test(approval.evidenceUrl||''))
 throw new Error('Approval must bind this source digest, exact independent-integration scope, named reviewer and immutable Casewake evidence commit.');
Object.assign(payload,{reviewer:approval.reviewer.trim(),verified:true,confirmedCausalLink:true,evidenceUrl:approval.evidenceUrl});
const base=process.env.CASEWAKE_BASE_URL||'http://127.0.0.1:4220';
const key=process.env.WORKSPACE_WRITE_KEY;
if(!key)throw new Error('Supply the reviewer credential securely in WORKSPACE_WRITE_KEY.');
async function post(route,body){
 const response=await fetch(new URL(route,base),{method:'POST',headers:{'content-type':'application/json','x-workspace-key':key},body:JSON.stringify(body),signal:AbortSignal.timeout(150000)});
 return {status:response.status,data:await response.json()};
}
const receiptFile=path.join(dir,'reviewed-memory-receipt.json');
const attemptFile=path.join(dir,'reviewed-memory-attempt.json');
let receipt;
if(fs.existsSync(receiptFile))receipt=JSON.parse(fs.readFileSync(receiptFile,'utf8'));
else{
 if(fs.existsSync(attemptFile))throw new Error('A prior write attempt exists without a completed receipt. Inspect Walrus before retrying; no automatic duplicate write.');
 fs.writeFileSync(attemptFile,JSON.stringify({startedAt:new Date().toISOString(),sourceDigest,evidenceUrl:approval.evidenceUrl,reviewer:approval.reviewer},null,2)+'\n',{flag:'wx'});
 receipt=await post('/api/remember',payload);
 // Preserve even a non-201 response for inspection; never silently retry.
 fs.writeFileSync(receiptFile,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
}
if(receipt.status!==201||!receipt.data.proof?.blobId)throw new Error('No completed Walrus receipt; stop and inspect the saved response.');
const request={sourceDigest,secondDigest,expectedBlobId:receipt.data.proof.blobId};
const recall=await post('/api/verify-recall',request);
fs.writeFileSync(path.join(dir,'exact-blob-recall.json'),JSON.stringify(recall,null,2)+'\n');
if(recall.status!==200||recall.data.gate3!=='verified'||recall.data.walrusReceipt?.blobId!==request.expectedBlobId)
 throw new Error('Exact-blob recurrence remains unproven; no additional memory will be written.');
const self=await post('/api/verify-recall',{...request,secondDigest:sourceDigest});
const mismatch=await post('/api/verify-recall',{...request,secondDigest:'Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp'});
fs.writeFileSync(path.join(dir,'recall-negative-controls.json'),JSON.stringify({self,mismatch},null,2)+'\n');
if(self.status!==400||mismatch.status!==409)throw new Error('Negative controls did not meet acceptance.');
console.log('VERIFIED: reviewed memory receipt, exact-blob distinct recurrence, rejected self-match and unrelated failure.');
