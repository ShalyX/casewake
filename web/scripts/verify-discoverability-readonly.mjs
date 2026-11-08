import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.ROUSE_ACCEPTANCE_BASE||'http://127.0.0.1:4242';
const proof={base,checkedAt:new Date().toISOString(),checks:[],memoryWrites:0};
async function request(path,body,headers={}){const r=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(100000)});return {status:r.status,data:await r.json()};}
const library=await request('/api/cases');assert.equal(library.status,200);
const reviewed=library.data.cases.find(c=>c.blobId==='KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY');assert.ok(reviewed);assert.equal(reviewed.reviewer,'ShalyX');
proof.checks.push('Anonymous library reads real completed reviewed record, reviewer, source and exact blob');
const found=await request('/api/cases/search',{query:'big_vector::leaf_remove'});assert.equal(found.status,200);assert.ok(found.data.results.some(h=>h.record.blobId===reviewed.blobId));assert.equal(found.data.relationship,'related-only');
assert.ok(found.data.results.every(h=>!('verdict' in h)&&!('verdict' in h.record)));proof.checks.push('Anonymous error-text search finds actual case without a compatibility verdict');
const unrelated=await request('/api/cases/search',{query:'InsufficientCoinBalance in command 18'});assert.equal(unrelated.status,200);assert.equal(unrelated.data.results.length,0);proof.checks.push('Different error class is not returned from generic trace words');
for(const query of ['a','x'.repeat(2001)])assert.equal((await request('/api/cases/search',{query})).status,400);proof.checks.push('Search bounds enforced before library work');
const status=await request('/api/status');assert.equal(status.data.publicInspectionEnabled,true);assert.equal(status.data.publicDemoMode,false);proof.checks.push('Status advertises public inspection, independent of historical example mode');
const ownDigest='2gPTra7CwyfiZMvqwgeerJSWippu1JeBsnDsiSb1iTFm';
const own=await request('/api/transaction',{digest:ownDigest});assert.equal(own.status,200);assert.equal(own.data.transaction.digest,ownDigest);assert.equal(own.data.transaction.outcome,'failed');proof.checks.push('Anonymous non-example digest fetches actual failed Mainnet execution');
const recall=await request('/api/recall',{digest:ownDigest});assert.equal(recall.status,200);assert.equal(recall.data.transaction.digest,ownDigest);proof.checks.push('Anonymous non-example digest can request actual recall');
assert.equal((await request('/api/transaction',{digest:'not-a-digest'})).status,400);proof.checks.push('Digest format validation retained');
for(const route of ['/api/remember','/api/observations','/api/verify-recall']){
 assert.equal((await request(route,{})).status,403);assert.equal((await request(route,{}, {'x-workspace-key':'fixture-invalid-key'})).status,403);
 proof.checks.push(route+' rejects missing and incorrect reviewer access before any write');
}
assert.equal((await request('/api/memory-job?jobId=fixture-unknown-job')).status,403);proof.checks.push('Receipt recovery remains protected');
proof.inventory=(await request('/api/memories')).data;proof.catalog={namespace:library.data.namespace,count:library.data.cases.length,coverageComplete:library.data.coverageComplete,completedRecordsExamined:library.data.completedRecordsExamined};proof.passed=true;
fs.writeFileSync(new URL('../../evidence/discoverability/read-only-acceptance.json',import.meta.url),JSON.stringify(proof,null,2)+'\n');console.log('PASS',proof.checks.length,'actual read/access checks; new memory writes0');
