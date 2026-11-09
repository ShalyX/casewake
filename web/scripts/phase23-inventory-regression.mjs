// Reproduce the previous pure pagination loop with a simulated expired snapshot.
// No SDK/client/credentials or live storage are used.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {stripTypeScriptTypes} from 'node:module';
import {completedBlobIds,readCompletedInventory} from '../src/lib/completed-inventory.ts';
const old=execFileSync('git',['show','83f22e9:web/src/lib/observations.ts'],{encoding:'utf8'});
const start=old.indexOf('export async function memoryInventory()');assert.ok(start>=0);
const body=stripTypeScriptTypes(old.slice(start).replace('export async function','async function'));
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const expired={memories:[],must_resync:true,has_more:false};
const oldResult=await new AsyncFunction('memwalClient','completedBlobIds',body+'\nreturn memoryInventory();')(async()=>({listMemories:async()=>expired}),completedBlobIds);
let fixedError='';try{await readCompletedInventory(async()=>expired,'controlled-fixture');}catch(e){fixedError=e.message;}
assert.equal(oldResult.allStoredMemories,0);assert.equal(oldResult.complete,true);assert.match(fixedError,/snapshot expired/);
fs.writeFileSync(new URL('../../evidence/phase23/inventory-regression.json',import.meta.url),JSON.stringify({scope:'Controlled SDK pagination responses; no live reads or writes',oldResult,fixedError,passed:true,realMemoryWrites:0},null,2)+'\n');
console.log('PASS: previous false-zero reproduced; fixed snapshot rejects expired coverage.');
