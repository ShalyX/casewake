import test from 'node:test';
import assert from 'node:assert/strict';
import { assessRepaymentCandidate } from './repayment-safety.mjs';

const principal = '65265188650';
test('real original DeepBook output is blocked', () => {
  const r=assessRepaymentCandidate({principalMist:principal,quotedOutputMist:'65100000000'});
  assert.equal(r.verdict,'BLOCK');
  assert.equal(r.quotePass,false);
});
test('briefly positive two-leg quote remains blocked by 50-bps slippage budget',()=>{
  const r=assessRepaymentCandidate({principalMist:principal,quotedOutputMist:'65266739451'});
  assert.equal(r.verdict,'BLOCK');
  assert.equal(r.quotePass,false);
});
test('a profitable quote without an atomic simulation is blocked',()=>{
  const r=assessRepaymentCandidate({principalMist:principal,quotedOutputMist:'66000000000'});
  assert.equal(r.verdict,'BLOCK');
  assert.equal(r.simulationPass,false);
});
test('external wallet topup is disallowed even when simulation succeeds',()=>{
  const r=assessRepaymentCandidate({principalMist:principal,quotedOutputMist:'66000000000',
    atomicSimulation:{outcome:'Transaction',success:true,error:null},walletCoinFunding:true});
  assert.equal(r.verdict,'BLOCK');
});
test('eligible status requires conservative quote and successful atomic simulation',()=>{
  const r=assessRepaymentCandidate({principalMist:principal,quotedOutputMist:'66000000000',
    atomicSimulation:{outcome:'Transaction',success:true,error:null}});
  assert.equal(r.verdict,'ELIGIBLE_FOR_MANUAL_REVIEW');
});
test('repayment amount and bounds cannot be negative or invalid',()=>{
  assert.throws(()=>assessRepaymentCandidate({principalMist:'0',quotedOutputMist:'10'}));
  assert.throws(()=>assessRepaymentCandidate({principalMist:principal,quotedOutputMist:'10',slippageBps:10001}));
});
