// Writes ONE evidence-backed, simulation-tested runbook to Walrus Mainnet.
// This is NOT a human-approved incident or an onchain executed repair.
// Prevents repeat writes by checking the local completion receipt.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { MemWal } from '@mysten-incubation/memwal';
import { makeTatumSealSession } from './seal-session-tatum.mjs';
const root=path.resolve(import.meta.dirname,'..','..');
const cfg=Object.fromEntries(fs.readFileSync(path.join(root,'web','.env.local'),'utf8').split(/\r?\n/)
 .filter(x=>/^[A-Z_]+=.*/.test(x)).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]}));
const input=JSON.parse(fs.readFileSync(path.join(root,'evidence','controlled-splitcoins-simulation.json'),'utf8'));
const failure=input.find(x=>x.label==='overdraw');
const success=input.find(x=>x.label==='corrected');
function required(label,v) { if(!v) throw new Error('Evidence check failed: '+label); }
required('two distinct outcomes',input.length===2 && failure && success);
required('failing on real Mainnet simulation',failure.status==='FailedTransaction' && failure.effectSuccess===false &&
 failure.errorText==='InsufficientCoinBalance in command 1');
required('corrected on real Mainnet simulation',success.status==='Transaction' && success.effectSuccess===true);
required('same first split',failure.firstSplitMist==='10000000' && success.firstSplitMist==='10000000');
required('only second split changed',failure.secondSplitMist==='20000000' && success.secondSplitMist==='5000000');
required('same sender and provider',failure.sender===success.sender && failure.source===success.source);
required('both gas mocked and no chain execution',failure.gasPaymentMocked===true && success.gasPaymentMocked===true &&
 failure.onchainExecuted===false && success.onchainExecuted===false);
required('Tatum simulation source',failure.source==='Tatum Sui Mainnet gRPC TransactionExecutionService.SimulateTransaction');
const evidenceDigest=crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
const receiptPath=path.join(root,'evidence','simulation-runbook-receipt.json');
if(fs.existsSync(receiptPath)) {
 const existing=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
 if(existing.blobId && existing.evidenceDigest===evidenceDigest) {
   console.log('SIMULATION_RUNBOOK_ALREADY_STORED=YES');
   console.log('RUNBOOK_BLOB_ID='+existing.blobId);
   process.exit(0);
 }
 throw new Error('Existing receipt does not match latest simulation evidence; do not duplicate.');
}
const record={
 schema:'simulation-runbook/v1',id:'sui-splitcoins-overdraw-2026-11-04',network:'sui-mainnet',
 errorKind:'InsufficientCoinBalance',commandKind:'splitCoins',status:'simulation-tested-not-human-verified',
 diagnosis:'In a controlled programmable transaction, a 10,000,000 MIST coin was asked to split out 20,000,000 MIST; execution simulation failed with InsufficientCoinBalance.',
 safeProcedure:'Trace the exact coin balance and preceding commands. Reduce the requested split to a supported amount and simulate again with the actual gas context before any signing. A 5,000,000 MIST split passed our controlled simulation; this is not a guaranteed fix for another transaction.',
 caveat:'This is Tatum Mainnet SIMULATION with mock gas. It did not sign, execute or repair any historical transaction and has no independent human reviewer approval.',
 failure:{firstSplitMist:failure.firstSplitMist,secondSplitMist:failure.secondSplitMist,
  result:'FailedTransaction',errorText:failure.errorText},
 corrected:{firstSplitMist:success.firstSplitMist,secondSplitMist:success.secondSplitMist,
  result:'Transaction',statusSuccess:true},
 provider:'Tatum Sui Mainnet gRPC',gasPaymentMocked:true,onchainExecuted:false,
 testSourcePath:'web/scripts/simulate-splitcoins-repro.mjs',proofPath:'/proof/splitcoins',
 evidenceDigest,testedAt:failure.checkedAt,
};
const memory="SUI_SIMULATION_RUNBOOK_V1\n"+
 "Sui InsufficientCoinBalance splitCoins failed: ask for more coin than exists. "+
 "Tatum Mainnet simulation-tested reproduction and corrected splitCoins amount. "+
 "Exact failure class: InsufficientCoinBalance; failing command kind: splitCoins. "+
 "After changing the split to a value below the coin balance, the controlled simulation succeeded. "+
 "This is a simulation-tested procedure only, NOT a human-verified fix for an executed transaction.\n"+
 JSON.stringify(record);
const client=MemWal.create({key:cfg.MEMWAL_PRIVATE_KEY,accountId:cfg.MEMWAL_ACCOUNT_ID,
 serverUrl:cfg.MEMWAL_SERVER_URL,namespace:cfg.MEMWAL_NAMESPACE});
// Use the standard signed SEAL session certificate, fetched using Tatum gRPC.
// The raw delegate key remains local. This avoids the SDK fallback to retired JSON-RPC.
const seal=await makeTatumSealSession(cfg);
client.sessionCache={bytes:seal.bytes,expiresAt:Date.now()+((seal.ttlMin*60)-45)*1000};
console.log('SIGNED_SEAL_SESSION_READY=YES');
console.log('RUNBOOK_PROOF_VALIDATED_SHA256='+evidenceDigest);
const jobFile=path.join(root,'evidence','simulation-runbook-pending-job.json');
let jobId;
if(fs.existsSync(jobFile)){
 const pending=JSON.parse(fs.readFileSync(jobFile,'utf8'));
 required('job proof consistency',pending.evidenceDigest===evidenceDigest);
 jobId=pending.jobId;
 console.log('RUNBOOK_RESUMING_EXISTING_JOB=YES');
}else{
 const accepted=await client.remember(memory);
 jobId=accepted.job_id;
 fs.writeFileSync(jobFile,JSON.stringify({jobId,evidenceDigest},null,2)+'\n');
 console.log('RUNBOOK_WALRUS_JOB_ACCEPTED=YES');
}
const finished=await client.waitForRememberJob(jobId,{timeoutMs:150000});
required('completed Mainnet blob',finished?.blob_id);
const receipt={jobId,blobId:finished.blob_id,evidenceDigest,record,
 status:'simulation-tested-not-human-verified',namespace:cfg.MEMWAL_NAMESPACE,
 confirmedAt:new Date().toISOString()};
fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
console.log('RUNBOOK_MAINNET_WRITE_COMPLETED=YES');
console.log('RUNBOOK_BLOB_ID='+receipt.blobId);
const recall=await client.recall({query:'Sui InsufficientCoinBalance splitCoins Mainnet controlled simulation tested correction. Simulation-runbook of a splitCoins overdraw and successful smaller split; not a human-reviewed historical fix.',limit:75});
const found=Array.isArray(recall.results)&&recall.results.some(x=>x.text.includes(evidenceDigest));
console.log('RUNBOOK_WALRUS_RECALL_FOUND='+found);
process.exitCode=found?0:3;
