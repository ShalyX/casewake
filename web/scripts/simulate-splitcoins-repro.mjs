// MAINNET READ-ONLY simulation using authenticated Tatum gRPC. No signatures or chain writes.
// The sender is a PUBLIC onchain address from an independently observed failed transaction.
import fs from 'node:fs';
import path from 'node:path';
import { Transaction } from '@mysten/sui/transactions';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';

const root = path.resolve(import.meta.dirname, '..');
const cfg = Object.fromEntries(fs.readFileSync(path.join(root,'.env.local'),'utf8')
  .split(/\r?\n/).filter(x=>/^[A-Z_]+=.*/.test(x))
  .map(x=>{ const i=x.indexOf('='); return [x.slice(0,i),x.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]; }));
if(!cfg.TATUM_API_KEY) throw new Error('Tatum key missing');
const native = new GrpcTransport({
  host:'sui-mainnet-grpc.gateway.tatum.io:443',
  channelCredentials: ChannelCredentials.createSsl(),
});
function optionsWithAuth(opts) {
  return {...opts, meta: {...opts?.meta, 'x-api-key':cfg.TATUM_API_KEY}, timeout:25000};
}
const authedTransport = {
  mergeOptions:(options)=>optionsWithAuth(native.mergeOptions(options)),
  unary:(method,input,options)=>native.unary(method,input,optionsWithAuth(options)),
  serverStreaming:(method,input,options)=>native.serverStreaming(method,input,optionsWithAuth(options)),
  clientStreaming:(method,options)=>native.clientStreaming(method,optionsWithAuth(options)),
  duplex:(method,options)=>native.duplex(method,optionsWithAuth(options)),
};
const client = new SuiGrpcClient({network:'mainnet',transport:authedTransport});
const sender='0x7e17ed25424ca1e811d2627583000734c57636362382d8ca6e43f7b203171bbd';
const results=[];
for(const [label, secondSplit] of [['overdraw',20_000_000n],['corrected',5_000_000n]]) {
  const tx = new Transaction();
  tx.setSender(sender);
  // First split creates a coin of *exactly* 10M MIST.
  const coin=tx.splitCoins(tx.gas,[tx.pure.u64(10_000_000n)]);
  // The overdraw case asks for 20M from that new 10M coin.
  const extra=tx.splitCoins(coin,[tx.pure.u64(secondSplit)]);
  tx.transferObjects([coin,extra],sender);
  try {
    const simulated=await client.simulateTransaction({
      transaction:tx,
      include:{effects:true,balanceChanges:true,commandResults:true},
      doGasSelection:false,
    });
    const base=simulated.Transaction || simulated.FailedTransaction;
    const entry={
      label, sender, firstSplitMist:'10000000', secondSplitMist:String(secondSplit),
      source:'Tatum Sui Mainnet gRPC TransactionExecutionService.SimulateTransaction',
      status: simulated.$kind,
      effectSuccess:base?.status?.success,
      errorText:base?.status?.error?.message || base?.status?.error || null,
      gasPaymentMocked:simulated.gasPaymentMocked,
      onchainExecuted:false,
      checkedAt:new Date().toISOString(),
    };
    console.log('SPLITCOIN_SIMULATION',JSON.stringify(entry).slice(0,1200));
    results.push(entry);
  }catch(error){
    console.log('SIMULATION_ERROR',label,String(error?.name||'Error'),
      String(error?.code||''),String(error?.message||'').slice(0,300));
    process.exitCode=2;
  }
}
if(results.length===2) {
  const dest=path.resolve(root,'..','evidence','controlled-splitcoins-simulation.json');
  fs.writeFileSync(dest,JSON.stringify(results,null,2)+'\n');
  console.log('SIMULATION_PROOF_SAVED',dest);
}
