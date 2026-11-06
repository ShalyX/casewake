// Reproducible, read-only Mainnet proof of a preflight repayment guard.
// One real historical route must be blocked; an overdrawn DeepBook flash loan is blocked;
// an exact borrow/split/return control is allowed. No transaction is signed or submitted.
import fs from 'node:fs';
import path from 'node:path';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';

const webRoot=path.resolve(import.meta.dirname,'..');
const projectRoot=path.resolve(webRoot,'..');
const cfg=Object.fromEntries(fs.readFileSync(path.join(webRoot,'.env.local'),'utf8').split(/\r?\n/)
 .filter(x=>/^[A-Z_]+=.*/.test(x)).map(x=>{const i=x.indexOf('=');return[x.slice(0,i),x.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]}));
if(!cfg.TATUM_API_KEY)throw new Error('Tatum key missing');
const native=new GrpcTransport({host:'sui-mainnet-grpc.gateway.tatum.io:443',channelCredentials:ChannelCredentials.createSsl()});
const auth=o=>({...o,meta:{...o?.meta,'x-api-key':cfg.TATUM_API_KEY},timeout:45000});
const transport={mergeOptions:o=>auth(native.mergeOptions(o)),unary:(m,i,o)=>native.unary(m,i,auth(o)),serverStreaming:(m,i,o)=>native.serverStreaming(m,i,auth(o)),clientStreaming:(m,o)=>native.clientStreaming(m,auth(o)),duplex:(m,o)=>native.duplex(m,auth(o))};
const client=new SuiGrpcClient({network:'mainnet',transport});
const deepbook='0x0e735f8c93a95722efd73521aca7a7652c0bb71ed1daf41b26dfd7d1ff71f748';
const sui='0x2::sui::SUI';
const suiUsde='0x41d587e5336f1c86cad50d38a7136db99333bb9bda91cea4ba69115defeb1402::sui_usde::SUI_USDE';
const poolId='0x034f3a42e7348de2084406db7a725f9d9d132a56c68324713e6e623601fb4fd7';
const initialSharedVersion='773317532';
const sender='0x457d5ecda9f125053adf94fe357549e11e6fa688679cf94ababb5793ed3916ce';

function assess(simulation,expectedFailureCommand){
 const body=simulation.Transaction||simulation.FailedTransaction||{};
 const success=simulation.$kind==='Transaction'&&body.status?.success===true;
 const error=body.status?.error?.message??body.status?.error??null;
 const failedAt=typeof error==='string'?(error.match(/in command\s+(\d+)/i)?.[1]??null):null;
 return {decision:success?'ALLOW':'BLOCK',simulationOutcome:simulation.$kind,statusSuccess:body.status?.success??null,error,failedAtCommand:failedAt,expectedFailureCommand:expectedFailureCommand??null,guardPassed:success?true:(expectedFailureCommand===null||failedAt===String(expectedFailureCommand))};
}
async function simulateHistoricalRoute(){
 const saved=JSON.parse(fs.readFileSync(path.join(projectRoot,'evidence','context-BbRZD7YfTiiN.json'),'utf8'));
 const tx=Transaction.from(Uint8Array.from(saved.transactionData.bcs.value.data));
 tx.setExpiration(null);
 const sim=await client.simulateTransaction({transaction:tx,include:{effects:true,transaction:true},doGasSelection:false});
 return {case:'original-three-hop-route',digest:saved.digest,borrowPrincipalMist:'65265188650',provider:'Tatum Sui Mainnet gRPC SimulateTransaction',gasPaymentMocked:sim.gasPaymentMocked??null,...assess(sim,16),signed:false,onchainExecuted:false,checkedAt:new Date().toISOString()};
}
function makeFlashloanControl(splitMist){
 const tx=new Transaction();
 tx.setSender(sender);
 tx.setGasBudget(50000000);
 const pool=tx.sharedObjectRef({objectId:poolId,initialSharedVersion,mutable:true});
 const [borrowed,flashLoan]=tx.moveCall({target:deepbook+'::pool::borrow_flashloan_base',typeArguments:[sui,suiUsde],arguments:[pool,tx.pure.u64(10000000n)]});
 const [repayment]=tx.splitCoins(borrowed,[tx.pure.u64(BigInt(splitMist))]);
 tx.moveCall({target:deepbook+'::pool::return_flashloan_base',typeArguments:[sui,suiUsde],arguments:[pool,repayment,flashLoan]});
 tx.transferObjects([borrowed],sender);
 return tx;
}
async function simulateControl(label,splitMist,expectedFailureCommand){
 const sim=await client.simulateTransaction({transaction:makeFlashloanControl(splitMist),include:{effects:true,transaction:true,commandResults:true},doGasSelection:false});
 return {case:label,network:'sui-mainnet',provider:'Tatum Sui Mainnet gRPC SimulateTransaction',borrowPrincipalMist:'10000000',repaymentSplitMist:String(splitMist),gasPaymentMocked:sim.gasPaymentMocked??null,commandResultCount:sim.commandResults?.length??null,...assess(sim,expectedFailureCommand),signed:false,onchainExecuted:false,checkedAt:new Date().toISOString()};
}
const results=[];
results.push(await simulateHistoricalRoute());
console.log('GUARD_RESULT',JSON.stringify(results[0]));
await new Promise(r=>setTimeout(r,3500));
results.push(await simulateControl('deepbook-overdraw-control',20000000,1));
console.log('GUARD_RESULT',JSON.stringify(results[1]));
await new Promise(r=>setTimeout(r,3500));
results.push(await simulateControl('deepbook-exact-repayment-control',10000000,null));
console.log('GUARD_RESULT',JSON.stringify(results[2]));
const proof={
 schema:'deepbook-repayment-guard-proof/v1',
 purpose:'Verify a read-only preflight gate blocks an underfunded DeepBook repayment route and allows an exact principal repayment.',
 limitations:'The historical multi-hop route is still not repaired. Controls use a small real DeepBook Mainnet flash loan with mocked gas, simulation only, no signing or chain execution. A successful control proves borrow/split/return mechanics, not profitability of the historical swap route.',
 guardRule:'Only allow a transaction to proceed to signing if the complete Tatum Mainnet simulation returns Transaction with effects.status.success=true. Any simulation failure, including InsufficientCoinBalance at the repayment split, blocks it.',
 results,
 completedAt:new Date().toISOString()
};
const dest=path.join(projectRoot,'evidence','deepbook-repayment-guard-proof.json');
fs.writeFileSync(dest,JSON.stringify(proof,null,2)+'\n');
console.log('PROOF_SAVED',dest);
