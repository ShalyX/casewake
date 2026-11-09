// Offline replay of public recorded history. No network, signing or storage.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {reconcileDuplicateCancel} from '../examples/reconcile-cancel.mjs';
const dir=new URL('../../evidence/real-case/',import.meta.url);
const read=name=>JSON.parse(fs.readFileSync(new URL(name,dir),'utf8'));
const proof=read('cancel-reconciliation-proof.json');
for(const artifact of proof.artifacts)assert.equal(createHash('sha256').update(fs.readFileSync(new URL(artifact.file,dir))).digest('hex'),artifact.sha256);
const prior=read('3QJhtjcFZ5oL7K7Ge4nP5yjPccibmHVfZE29ChtZY8Tx.json');
const source=read('8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA.json');
const later=read('CRCdTJpQaMwa2AdhjE61neubu1Jz4v35NH1B7sMA7ULM.json');
const recurrence=read('HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV.json');
assert.equal(reconcileDuplicateCancel(source,[prior,later]).originalSuccessDigest,prior.digest);
assert.equal(reconcileDuplicateCancel(recurrence,[prior,later]).originalSuccessDigest,later.digest);
assert.equal(reconcileDuplicateCancel(source,[later]).outcome,'investigate');
assert.equal(reconcileDuplicateCancel(source,[]).outcome,'investigate');
for(const field of ['sender','pool','manager','order','checkpoint','status','event']){
 const changed=structuredClone(prior),p=changed.transaction.kind.data.programmableTransaction;
 if(field==='sender')changed.transaction.sender='0x'+'0'.repeat(64);
 if(field==='pool')p.inputs[2].objectId='0x'+'0'.repeat(64);
 if(field==='manager')p.inputs[0].objectId='0x'+'0'.repeat(64);
 if(field==='order')p.inputs[3].pure.data[0]^=1;
 if(field==='checkpoint')changed.checkpoint=source.checkpoint;
 if(field==='status')changed.effects.status.success=false;
 if(field==='event')changed.events={events:[]};
 assert.equal(reconcileDuplicateCancel(source,[changed]).outcome,'investigate',field);
}
console.log('PASS:4 recorded hashes,2 positive replays,2 history controls and7 synthetic mutations. Original operator deployment unknown; no writes or historical repair.');
