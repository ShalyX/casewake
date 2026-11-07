import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeMemory,decodeMemory,assessCase,isLaterCheckpoint} from '../src/lib/incidents.ts';

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

test('A successor must be finalized in a strictly later checkpoint',()=>{
 assert.equal(isLaterCheckpoint('342629269','342629270'),true);
 assert.equal(isLaterCheckpoint('342629269','342629269'),false);
 assert.equal(isLaterCheckpoint('342629270','342629269'),false);
 assert.equal(isLaterCheckpoint(null,'342629270'),false);
 assert.equal(isLaterCheckpoint('not-a-checkpoint','342629270'),false);
});

const sourceDigest='2'.repeat(43);
const successorDigest='3'.repeat(43);
const successorCase={...base,id:'human-successor-fixture',digest:sourceDigest,
 evidenceUrl:'https://suivision.xyz/txblock/'+successorDigest,resolutionKind:'onchain-successor',
 validatedEvidence:{schema:'casewake-validated-evidence/v1',scope:'human-reviewed-successor-transaction',
  proofType:'tatum-executed-successor',originalDigest:sourceDigest,successorDigest,
  originalTimestampMs:1793751616746,successorTimestampMs:1793751716746,
  originalCheckpoint:'342629269',successorCheckpoint:'342629270',
  provider:'Tatum Sui gRPC',originalSender:'0xabc',successorSender:'0xabc',
  matchedOperations:['move:0x2::example::execute'],successorOutcome:'succeeded',
  reviewerConfirmedCausality:true,reviewedChange:'Corrected the specific object version and rebuilt the same deposit operation.',
  verifiedAt:'2026-11-07T10:00:00.000Z',originalHistoricalRouteRepaired:false}};
test('A human-reviewed successor record is accepted only with later-checkpoint evidence',()=>{
 assert.equal(decodeMemory(encodeMemory(successorCase))?.validatedEvidence?.scope,'human-reviewed-successor-transaction');
 const earlier={...successorCase,validatedEvidence:{...successorCase.validatedEvidence,successorCheckpoint:'342629268'}};
 assert.equal(decodeMemory(encodeMemory(earlier)),null);
 const missing={...successorCase,validatedEvidence:{...successorCase.validatedEvidence,successorTimestampMs:null}};
 assert.equal(decodeMemory(encodeMemory(missing)),null);
});