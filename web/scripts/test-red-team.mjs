import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCaseResponse} from '../src/lib/case-response.ts';
import {decodeStorageAttempt,parseStorageReceipt} from '../src/lib/storage-session.ts';
import {requestJson,RequestError} from '../src/lib/browser-request.ts';
import {readJsonObject} from '../src/lib/request-body.ts';
const meta={namespace:'qa',checkedAt:'2026-11-09T00:00:00Z',coverageComplete:true,completedRecordsExamined:0,recordsNotRetrieved:0};
test('malformed library/search data cannot become an empty result or a render exception',()=>{
 for(const value of [null,[],{}, {...meta,cases:{}},{...meta,cases:[null]},{...meta,cases:[],recordsNotRetrieved:1},{...meta,cases:[],coverageComplete:'true'},{...meta,cases:[],checkedAt:'invalid'}])assert.throws(()=>parseCaseResponse(value,false),/invalid response/);
 for(const value of [{}, {...meta,results:{}},{...meta,results:[{record:{},matchedTerms:[],relationship:'eligible-for-review'}]}])assert.throws(()=>parseCaseResponse(value,true),/invalid response/);
 assert.deepEqual(parseCaseResponse({...meta,cases:[]},false).hits,[]);
 assert.deepEqual(parseCaseResponse({...meta,results:[]},true).hits,[]);
});
test('client cache rejects malformed receipt types and mismatched job/namespace identities',()=>{
 const good={sourceDigest:'4'.repeat(43),requestId:'11111111-1111-4111-8111-111111111111',kind:'resolution',jobId:'job',namespace:'qa',receipt:{blobId:'blob',jobId:'job',namespace:'qa'}};
 for(const value of [{...good,receipt:{...good.receipt,blobId:{}}},{...good,receipt:{...good.receipt,jobId:'another-job'}},{...good,receipt:{...good.receipt,namespace:'another-space'}},{...good,jobId:{}},null,[]])assert.equal(decodeStorageAttempt(JSON.stringify(value)),null);
 const restored=decodeStorageAttempt(JSON.stringify({...good,reviewerKey:'DO_NOT_PERSIST',receipt:{...good.receipt,status:'mainnet-stored'}}));assert.equal(restored.receipt.status,undefined);assert.ok(!('reviewerKey' in restored));
 for(const v of [null,{},[],{blobId:{},jobId:'job',namespace:'qa'},{blobId:'blob',jobId:'job',namespace:'qa',status:'pending'}])assert.equal(parseStorageReceipt(v),null);
});
test('HTML/null/array HTTP bodies are ambiguous errors, never authoritative write rejections',async()=>{
 const original=globalThis.fetch;
 try{for(const body of ['<html>proxy failure</html>','null','[]']){globalThis.fetch=async()=>new Response(body,{status:400});await assert.rejects(()=>requestJson('/api/remember',{}),e=>e instanceof RequestError&&e.status===0);}}finally{globalThis.fetch=original;}
});
test('a known failed job has a semantic code rather than being inferred from any409',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=async()=>new Response(JSON.stringify({error:'failed',code:'storage-job-failed'}),{status:409});await assert.rejects(()=>requestJson('/api/memory-job',undefined),e=>e instanceof RequestError&&e.status===409&&e.code==='storage-job-failed');}finally{globalThis.fetch=original;}
});
test('request body shape is validated before property reads or external lookups',async()=>{
 for(const body of ['null','[]','true','"text"','{invalid'])assert.equal(await readJsonObject(new Request('https://qa.invalid',{method:'POST',body})),null);
 assert.deepEqual(await readJsonObject(new Request('https://qa.invalid',{method:'POST',body:'{"verified":false}'})),{verified:false});
});
