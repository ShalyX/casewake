import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateRouteRepairStructure, ROUTE_INCIDENT_DIGEST } from '../src/lib/route-repair-proof.ts';

const evidence=JSON.parse(fs.readFileSync(new URL('../../evidence/context-BbRZD7YfTiiN.json',import.meta.url),'utf8'));
const historical=Buffer.from(evidence.transactionData.bcs.value.data);
const asBase64=b=>b.toString('base64');

test('proof policy is pinned to the original failed Mainnet incident',()=>{
  assert.equal(ROUTE_INCIDENT_DIGEST,evidence.digest);
});
test('the historical transaction passes structure only; execution status is independently checked later',()=>{
  const proof=validateRouteRepairStructure(asBase64(historical));
  assert.equal(proof.commandCount,19);
});
test('reject missing or malformed transaction bytes',()=>{
  for(const body of ['','not-base64','garbage','a'.repeat(360000)]) {
    assert.throws(()=>validateRouteRepairStructure(body));
  }
});
test('reject historical transaction with altered flashloan principal',()=>{
  const originalAmount=Buffer.alloc(8);
  originalAmount.writeBigUInt64LE(BigInt('65265188650'));
  const pos=historical.indexOf(originalAmount);
  assert.ok(pos>=0,'Original principal must be found in the byte payload');
  const tampered=Buffer.from(historical);
  tampered.writeBigUInt64LE(BigInt('65265188649'),pos);
  assert.throws(()=>validateRouteRepairStructure(asBase64(tampered)),/principal changed/);
});
