// Actual Mainnet evidence replay + explicitly labelled mutated negative controls.
// No keys, signatures, transaction execution, or Walrus writes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { reconcileDuplicateCancel } from '../examples/reconcile-cancel.mjs';
const dir=path.resolve(import.meta.dirname,'../../evidence/real-case');
const ds={prior:'3QJhtjcFZ5oL7K7Ge4nP5yjPccibmHVfZE29ChtZY8Tx',
 failed:'8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA',
 later:'CRCdTJpQaMwa2AdhjE61neubu1Jz4v35NH1B7sMA7ULM',
 recurrence:'HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV'};
const transactions=Object.fromEntries(Object.entries(ds).map(([k,d])=>[k,JSON.parse(fs.readFileSync(path.join(dir,d+'.json'),'utf8'))]));
const {prior,failed,later,recurrence}=transactions;
const source=reconcileDuplicateCancel(failed,[prior,later]);
assert.equal(source.outcome,'already-completed');assert.equal(source.originalSuccessDigest,prior.digest);
const repeated=reconcileDuplicateCancel(recurrence,[prior,later]);
assert.equal(repeated.outcome,'already-completed');assert.equal(repeated.originalSuccessDigest,later.digest);
// Real negative: a later successful cancellation of another order proves no correction of the original order.
assert.equal(reconcileDuplicateCancel(failed,[later]).outcome,'investigate');
assert.equal(reconcileDuplicateCancel(failed,[]).outcome,'investigate');
const mutations=[];
for(const field of ['sender','pool','manager','order','checkpoint','status','event']){
 const changed=structuredClone(prior);const pt=changed.transaction.kind.data.programmableTransaction;
 if(field==='sender')changed.transaction.sender='0x'+ '0'.repeat(64);
 if(field==='pool')pt.inputs[2].objectId='0x'+ '0'.repeat(64);
 if(field==='manager')pt.inputs[0].objectId='0x'+ '0'.repeat(64);
 if(field==='order')pt.inputs[3].pure.data[0]^=1;
 if(field==='checkpoint')changed.checkpoint=failed.checkpoint;
 if(field==='status')changed.effects.status.success=false;
 if(field==='event')changed.events={events:[]};
 assert.equal(reconcileDuplicateCancel(failed,[changed]).outcome,'investigate');mutations.push(field);
}
const artifacts=Object.values(ds).map(d=>{const file=d+'.json';return {file,sha256:createHash('sha256').update(fs.readFileSync(path.join(dir,file))).digest('hex')};});
const proof={schema:'casewake-cancel-reconciliation/v1',checkedAt:new Date().toISOString(),
 evidenceSource:'Authenticated Tatum Sui Mainnet gRPC reads',
 proofScope:'Independent reference integration correction replayed against real finalized transaction history',
 originalOperatorDeployment:'UNKNOWN; no original operator application fix claimed',
 caseStatus:'AWAITING HUMAN REVIEW; not a stored verified memory',
 transactions:Object.fromEntries(Object.entries(transactions).map(([k,t])=>[k,{digest:t.digest,success:t.effects.status.success,checkpoint:t.checkpoint,timestamp:t.timestamp}])),
 source,repeated,realNegativeControls:['different-order later success does not resolve source','missing prior history stays investigate'],
 syntheticNegativeControls:mutations,artifacts,chainWrites:0,walrusWrites:0};
fs.writeFileSync(path.join(dir,'cancel-reconciliation-proof.json'),JSON.stringify(proof,null,2)+'\n');
console.log('PASS: two real duplicate cancellations reconciled to exact earlier successes and OrderCanceled events; two real negative controls and seven synthetic mutations rejected. No writes.');
