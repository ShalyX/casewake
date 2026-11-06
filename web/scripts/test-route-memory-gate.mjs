import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeMemory,decodeMemory,assessCase} from '../src/lib/incidents.ts';

const base={
 schema:'incident-memory/v1',id:'full-repair-fixture',network:'sui-mainnet',
 digest:'BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6',
 fingerprint:'insufficientcoinbalance in command 16',errorText:'InsufficientCoinBalance in command 16',
 packageId:null,sdkVersion:null,diagnosis:'The original flashloan repay split exceeds available final SUI.',
 resolutionSteps:'Use a corrected self-funded atomic flashloan route; independently simulate full repayment on Mainnet.',
 evidenceUrl:'https://example.com/validated-route',reviewer:'engineer',verifiedAt:'2026-11-06T17:00:00.000Z',
 status:'human-verified',resolutionKind:'route-repair'
};
const full={...base,validatedEvidence:{
 schema:'casewake-validated-evidence/v1',scope:'full-flashloan-route-repair',
 originalHistoricalRouteRepaired:true,originalDigest:base.digest,
 routeTransactionSha256:'a'.repeat(64),principalMist:'65265188650',
 provider:'Tatum Sui Mainnet gRPC',simulationSucceeded:true,gasPaymentMocked:true,
 proofType:'mainnet-simulation',signed:false,onchainExecuted:false,commandCount:32,verifiedAt:'2026-11-06T17:00:00.000Z'
}};
test('No memory is eligible without independently verified repair metadata',()=>{
 assert.equal(decodeMemory(encodeMemory(base)),null);
});
test('Invalid principal cannot promote a route repair',()=>{
 const bad={...full,validatedEvidence:{...full.validatedEvidence,principalMist:'10000000'}};
 assert.equal(decodeMemory(encodeMemory(bad)),null);
});
test('A validated complete route repair can become a candidate',()=>{
 assert.equal(decodeMemory(encodeMemory(full))?.validatedEvidence?.scope,'full-flashloan-route-repair');
});
test('Second incident is reserved for recall; not eligible as a source',()=>{
 assert.equal(decodeMemory(encodeMemory({...full,digest:'XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue'})),null);
});
test('Self-match rejected and distinct comparable failure eligible only for review',()=>{
 const rec=decodeMemory(encodeMemory(full));
 assert.ok(rec);
 const observed={digest:base.digest,network:'sui-mainnet',source:'Tatum Sui gRPC',observedAt:base.verifiedAt,
 outcome:'failed',errorText:base.errorText,fingerprint:base.fingerprint,packageId:null};
 assert.equal(assessCase(observed,rec,0).verdict,'incompatible');
 assert.equal(assessCase({...observed,digest:'XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue'},rec,0).verdict,'eligible-for-review');
});
