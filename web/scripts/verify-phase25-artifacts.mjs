// Read-only proof refresh. Replays recorded history; never creates a review or storage job.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {reconcileDuplicateCancel} from '../examples/reconcile-cancel.mjs';
import {verifyReviewedEvidence} from '../src/lib/reviewed-evidence.ts';
const dir=new URL('../../evidence/real-case/',import.meta.url),out=new URL('../../evidence/phase25/',import.meta.url);
const read=name=>JSON.parse(fs.readFileSync(new URL(name,dir),'utf8'));
const old=read('cancel-reconciliation-proof.json'),saved=read('reviewed-memory-receipt.json').data,approval=read('human-approval.json');
assert.equal(approval.approved,true);assert.equal(approval.reviewer,saved.record.reviewer);assert.equal(approval.evidenceUrl,saved.record.evidenceUrl);
const hashes=[];for(const item of old.artifacts){const bytes=fs.readFileSync(new URL(item.file,dir));const hash=createHash('sha256').update(bytes).digest('hex');assert.equal(hash,item.sha256);const gitBytes=execFileSync('git',['show',saved.record.validatedEvidence.evidenceCommitSha+':evidence/real-case/'+item.file]);assert.equal(createHash('sha256').update(gitBytes).digest('hex'),hash);hashes.push({file:item.file,sha256:hash});}
const ds={prior:'3QJhtjcFZ5oL7K7Ge4nP5yjPccibmHVfZE29ChtZY8Tx',failed:saved.record.digest,later:'CRCdTJpQaMwa2AdhjE61neubu1Jz4v35NH1B7sMA7ULM',recurrence:'HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV'};
const t=Object.fromEntries(Object.entries(ds).map(([k,d])=>[k,read(d+'.json')]));const source=reconcileDuplicateCancel(t.failed,[t.prior,t.later]);const recurrence=reconcileDuplicateCancel(t.recurrence,[t.prior,t.later]);
assert.equal(source.outcome,'already-completed');assert.equal(source.originalSuccessDigest,ds.prior);assert.equal(recurrence.originalSuccessDigest,ds.later);
assert.equal(reconcileDuplicateCancel(t.failed,[t.later]).outcome,'investigate');assert.equal(reconcileDuplicateCancel(t.failed,[]).outcome,'investigate');
const mutations=[];for(const field of ['sender','pool','manager','order','checkpoint','status','event']){
 const changed=structuredClone(t.prior);const p=changed.transaction.kind.data.programmableTransaction;
 if(field==='sender')changed.transaction.sender='0x'+'0'.repeat(64);if(field==='pool')p.inputs[2].objectId='0x'+'0'.repeat(64);if(field==='manager')p.inputs[0].objectId='0x'+'0'.repeat(64);if(field==='order')p.inputs[3].pure.data[0]^=1;if(field==='checkpoint')changed.checkpoint=t.failed.checkpoint;if(field==='status')changed.effects.status.success=false;if(field==='event')changed.events={events:[]};
 assert.equal(reconcileDuplicateCancel(t.failed,[changed]).outcome,'investigate');mutations.push(field);
}
const v=saved.record.validatedEvidence;const observed={...saved.record,outcome:'failed',source:'Tatum Sui gRPC',observedAt:old.checkedAt,transactionTimestampMs:v.originalTimestampMs,checkpoint:v.originalCheckpoint};
const fresh=await verifyReviewedEvidence(observed,saved.record.evidenceUrl,v.reviewedChange,v.verificationMethod,approval.approved);
assert.equal(fresh.evidenceSha256,v.evidenceSha256);assert.equal(fresh.evidenceFileCount,v.evidenceFileCount);assert.equal(fresh.evidenceCommitSha,v.evidenceCommitSha);
const result={passed:true,checkedAt:new Date().toISOString(),originalHistoryObservedAt:old.checkedAt,approvalObservedAt:approval.approvedAt,scope:'Fresh immutable GitHub snapshot validation and replay of recorded authenticated Mainnet history; not fresh history ingestion or new human approval',evidenceCommit:fresh.evidenceCommitSha,evidenceSha256:fresh.evidenceSha256,evidenceFiles:fresh.evidenceFileCount,recordedHistoryHashes:hashes,source,recurrence,realNegativeControls:2,syntheticMutationControls:mutations,originalOperatorDeployment:'UNKNOWN',historicalOnchainRepairClaimed:false,newHumanReview:false,chainWrites:0,memoryWrites:0};
fs.writeFileSync(new URL('artifact-refresh.json',out),JSON.stringify(result,null,2)+'\n');console.log('PASS: unchanged17-file GitHub snapshot, four immutable history hashes,2 replays,2 history controls and7 synthetic controls; no writes or new review.');
