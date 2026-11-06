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

test('untouched loan reserve is not charged traded-leg slippage',()=>{
  const reserve = 64015188650n;
  const swapped = 1250274634n;
  const total = reserve + swapped;
  const safe=assessRepaymentCandidate({principalMist:principal,quotedOutputMist:total,
    untouchedReserveMist:reserve,slippageBps:0,minimumProfitMist:100000n,
    atomicSimulation:{outcome:'Transaction',success:true,error:null}});
  assert.equal(safe.quotePass,true);
  assert.equal(safe.conservativeOutputMist,total.toString());
  assert.equal(safe.verdict,'ELIGIBLE_FOR_MANUAL_REVIEW');
  const risk=assessRepaymentCandidate({principalMist:principal,quotedOutputMist:total,
    untouchedReserveMist:reserve,slippageBps:50,minimumProfitMist:1000000n,
    atomicSimulation:{outcome:'Transaction',success:true,error:null}});
  assert.equal(risk.quotePass,false);
  assert.equal(risk.verdict,'BLOCK');
  assert.equal(risk.conservativeOutputMist,(reserve+swapped*9950n/10000n).toString());
});

test('reserve larger than principal or quoted total is rejected',()=>{
  assert.throws(()=>assessRepaymentCandidate({principalMist:principal,
    quotedOutputMist:100n,untouchedReserveMist:101n}));
  assert.throws(()=>assessRepaymentCandidate({principalMist:principal,
    quotedOutputMist:100000000000n,untouchedReserveMist:100000000000n}));
});
