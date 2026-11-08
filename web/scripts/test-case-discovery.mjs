import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {encodeMemory,decodeMemory} from '../src/lib/incidents.ts';
import {reviewedLibraryCases,searchReviewedCases} from '../src/lib/case-discovery.ts';
const saved=JSON.parse(fs.readFileSync(new URL('../../evidence/real-case/reviewed-memory-receipt.json',import.meta.url),'utf8')).data;
const blob=saved.proof.blobId,namespace='incident-memory-v1';
const hit={blob_id:blob,text:encodeMemory(saved.record)};
const project=hits=>reviewedLibraryCases(hits,new Set([blob]),namespace,decodeMemory);
test('library exposes completed validated resolutions, deduplicated by actual blob',()=>{
 const rows=project([hit,hit,{...hit,blob_id:'not-active'},{blob_id:blob,text:'SUI_INCIDENT_OBSERVATION_V1\n{}'}]);
 assert.equal(rows.length,1);assert.equal(rows[0].blobId,blob);assert.equal(rows[0].reviewer,'ShalyX');assert.equal(rows[0].namespace,namespace);
 assert.ok(!('verdict' in rows[0]));assert.ok(!('distance' in rows[0]));
});
test('claimed human review without validated evidence never enters the library',()=>{
 const invalid={...saved.record,validatedEvidence:undefined};assert.deepEqual(project([{blob_id:blob,text:encodeMemory(invalid)}]),[]);
});
test('prevention-only guard records are excluded even if their legacy decoder accepts them',()=>{
 const guard={...saved.record,resolutionKind:'prevention-guard',validatedEvidence:{...saved.record.validatedEvidence,scope:'prevention-guard-only',originalHistoricalRouteRepaired:false}};
 assert.ok(decodeMemory(encodeMemory(guard)));assert.deepEqual(project([{blob_id:blob,text:encodeMemory(guard)}]),[]);
});
test('public projection cannot accidentally expose extra private record properties',()=>{
 const row=project([{blob_id:blob,text:encodeMemory({...saved.record,privateReviewerKey:'MUST_NOT_LEAVE_RECORD'})}])[0];
 assert.ok(!JSON.stringify(row).includes('MUST_NOT_LEAVE_RECORD'));
});
test('error signatures and procedure words discover the genuine reviewed case as related-only',()=>{
 const rows=project([hit]);
 for(const q of ['MoveAbort','big_vector::leaf_remove','DeepBook duplicate cancellation']){
  const hits=searchReviewedCases(rows,q);assert.equal(hits.length,1);assert.equal(hits[0].relationship,'related-only');assert.ok(hits[0].matchedTerms.length);assert.equal(hits[0].record.blobId,blob);
 }
});
test('unrelated or generic text is not promoted to a matching resolution',()=>{
 const rows=project([hit]);
 for(const q of ['InsufficientCoinBalance','InsufficientCoinBalance in command 18','browser CORS error','the error','123'])assert.deepEqual(searchReviewedCases(rows,q),[]);
});
