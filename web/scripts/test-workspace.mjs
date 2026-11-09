import test from 'node:test';
import assert from 'node:assert/strict';
import {assertSafeMemoryContent} from '../src/lib/memory-content.ts';
import {completedBlobIds,readCompletedInventory} from '../src/lib/completed-inventory.ts';
import {decodeStorageAttempt} from '../src/lib/storage-session.ts';
import {requestJson,RequestError} from '../src/lib/browser-request.ts';
const sourceDigest='8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA';
test('engineering addresses remain usable while recognized credentials are rejected before storage',()=>{
 assert.doesNotThrow(()=>assertSafeMemoryContent({diagnosis:'Pool 0x'+'a'.repeat(64)+' was already cancelled; reconcile the confirmed event.'}));
 for(const text of ['API_KEY=synthetic_secret_123456789','suiprivkey1syntheticfixtureonly','-----BEGIN PRIVATE KEY-----','Bearer synthetic_bearer_fixture_123456789','seed phrase: one two three four five six seven eight nine ten eleven twelve']) // gitleaks:allow -- deliberate synthetic rejection fixtures
  assert.throws(()=>assertSafeMemoryContent({diagnosis:text}),/Remove credentials/);
});
test('inventory counts only unique completed active blobs, excluding accepted jobs and failed records',()=>{
 assert.deepEqual(completedBlobIds([{status:'active',blob_id:'completed'},{status:'active',blob_id:'completed'},{status:'pending',blob_id:'not-final'},{status:'failed',blob_id:'failure'},{status:'active',blob_id:''}]),['completed']);
});

test('paged inventory counts completed records once and finishes only at the end of its snapshot',async()=>{
 const cursors=[];const pages=[{memories:[{status:'active',blob_id:'one'},{status:'pending',blob_id:'pending'}],has_more:true,next_cursor:'next'},{memories:[{status:'active',blob_id:'one'},{status:'active',blob_id:'two'}],has_more:false}];
 const result=await readCompletedInventory(async cursor=>{cursors.push(cursor);return pages.shift();},'qa');
 assert.deepEqual(cursors,[undefined,'next']);assert.equal(result.allStoredMemories,2);assert.equal(result.complete,true);
});

test('expired inventory snapshot is unavailable rather than a verified zero or partial total',async()=>{
 await assert.rejects(()=>readCompletedInventory(async()=>({memories:[],must_resync:true,has_more:false}),'qa'),/snapshot expired/);
 let calls=0;await assert.rejects(()=>readCompletedInventory(async()=>++calls===1?{memories:[{status:'active',blob_id:'one'}],has_more:true,next_cursor:'next'}:{memories:[],must_resync:true},'qa'),/snapshot expired/);
});

test('broken or cyclic pagination exposes a lower bound without looping or claiming full coverage',async()=>{
 for(const next_cursor of [undefined,'same']){
  let calls=0;const result=await readCompletedInventory(async()=>{calls++;return {memories:[{status:'active',blob_id:'one'}],has_more:true,next_cursor};},'qa');
  assert.equal(result.complete,false);assert.equal(result.allStoredMemories,1);assert.ok(calls<=2);
 }
});
test('a completed receipt and its source survive session restore without saving a reviewer credential',()=>{
 const saved=decodeStorageAttempt(JSON.stringify({sourceDigest,kind:'resolution',requestId:'a'.repeat(36),receipt:{jobId:'job',blobId:'blob',namespace:'workspace'},reviewerKey:'MUST_NOT_PERSIST'}));
 assert.equal(saved.receipt.blobId,'blob');assert.equal(saved.sourceDigest,sourceDigest);assert.ok(!('reviewerKey' in saved));
 assert.equal(decodeStorageAttempt('{invalid'),null);assert.equal(decodeStorageAttempt(JSON.stringify({sourceDigest:'wrong'})),null);
});
test('bounded browser reads time out without retrying or leaving an indefinite loading state',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(_url,options)=>{calls++;return new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))));};
 try{await assert.rejects(()=>requestJson('/api/transaction',{digest:sourceDigest},undefined,20),error=>error instanceof RequestError&&error.status===0);assert.equal(calls,1);}finally{globalThis.fetch=original;}
});
test('accepted storage jobs remain pending and are not treated as completed receipts',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({pending:{jobId:'existing-job'}}),{status:202});
 try{const response=await requestJson('/api/memory-job?jobId=existing-job',undefined);assert.ok(response.pending);assert.equal(response.proof,undefined);}finally{globalThis.fetch=original;}
});
