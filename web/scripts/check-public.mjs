// Bounded anonymous reads and guaranteed authorization rejections. No valid write.
import assert from 'node:assert/strict';
const base=process.env.ROUSE_BASE_URL||'https://casewake.vercel.app';
const blob='KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY';
let checks=0;
async function call(path,body){const r=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(110000)});return {status:r.status,data:await r.json()};}
for(const path of ['/','/workspace','/cases','/journal/casewake','/proof/splitcoins','/icon.svg','/brand/rouse/social-card.png','/fonts/SpaceGrotesk.woff2']){
 const r=await fetch(base+path,{signal:AbortSignal.timeout(60000)});assert.equal(r.status,200,path);checks++;
}
const before=await call('/api/memories');assert.equal(before.status,200);assert.equal(before.data.complete,true);checks++;
const catalogue=await call('/api/cases');assert.equal(catalogue.status,200);assert.ok(catalogue.data.cases.some(x=>x.blobId===blob&&x.reviewer==='ShalyX'));checks++;
const search=await call('/api/cases/search',{query:'big_vector::leaf_remove'});assert.equal(search.status,200);assert.ok(search.data.results.some(x=>x.record.blobId===blob&&x.relationship==='related-only'));checks++;
const recalled=await call('/api/recall',{digest:'HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV'});assert.equal(recalled.status,200);assert.ok(recalled.data.candidates.some(x=>x.verdict==='eligible-for-review'&&x.walrusReceipt?.blobId===blob&&x.record.reviewer==='ShalyX'));checks++;
for(const path of ['/api/remember','/api/observations','/api/verify-recall']){const r=await call(path,{verified:true,digest:'4'.repeat(43)});assert.equal(r.status,403,path);checks++;}
const recovery=await call('/api/memory-job?jobId=22222222-2222-4222-8222-222222222222');assert.equal(recovery.status,403);checks++;
const after=await call('/api/memories');assert.equal(after.data.allStoredMemories,before.data.allStoredMemories);checks++;
console.log(JSON.stringify({passed:true,base,checkedAt:new Date().toISOString(),checks,completedMemories:after.data.allStoredMemories,reviewedCases:catalogue.data.cases.length,memoryWrites:0,scope:'Anonymous public reads and rejected recording requests; not an exhaustive security audit'}));
