/**
 * Mainnet read-only Casewake upstream route repair spike.
 * Builds an atomic DeepBook flashloan and re-quotes all upstream conversion legs.
 * Only the flashloan coin funds swaps; never adds wallet SUI coins.
 * A completed independent Mainnet simulation is the only pass criterion.
 * No signing, executing, wallet requests or Walrus write.
 */
import fs from 'node:fs';
import path from 'node:path';
import { AggregatorClient, Env } from '@cetusprotocol/aggregator-sdk';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { assessRepaymentCandidate } from './repayment-safety.mjs';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';

const ROOT = path.resolve(import.meta.dirname, '../..');
const WEB = path.join(ROOT, 'web');
const env = Object.fromEntries(fs.readFileSync(path.join(WEB, '.env.local'), 'utf8')
  .split(/\r?\n/).filter(s => /^[A-Z_]+=.*/.test(s))
  .map(s => {const i=s.indexOf('=');return [s.slice(0,i),s.slice(i+1).trim().replace(/^['"]|['"]$/g,'')];}));
const S = '0x2::sui::SUI';
const U = '0x44f838219cf67b058f3b37907b655f226153c18e33dfcd0da559a844fea9b1c1::usdsui::USDSUI';
const C = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';
const SU = '0x41d587e5336f1c86cad50d38a7136db99333bb9bda91cea4ba69115defeb1402::sui_usde::SUI_USDE';
const DB = '0x0e735f8c93a95722efd73521aca7a7652c0bb71ed1daf41b26dfd7d1ff71f748';
const PRINCIPAL = 65265188650n;
const SENDER = '0x457d5ecda9f125053adf94fe357549e11e6fa688679cf94ababb5793ed3916ce';
const POOL = '0x034f3a42e7348de2084406db7a725f9d9d132a56c68324713e6e623601fb4fd7';
const ALLOWED = ['CETUS','CETUS_TIDE','BLUEFIN','TURBOS','DIPCOIN','FERRADLMM'];
const outcome = { schema:'casewake-upstream-route-replay/v1', network:'sui-mainnet',
  originalDigest:'BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6',
  principalMist:PRINCIPAL.toString(), noExternalInputCoins:true, gasMocked:true,
  signed:false, onchainExecuted:false, candidateQuotes:[], replays:[] };
const grpc = new SuiGrpcClient({network:'mainnet',baseUrl:'https://fullnode.mainnet.sui.io:443'});
const native = new GrpcTransport({host:'sui-mainnet-grpc.gateway.tatum.io:443',channelCredentials:ChannelCredentials.createSsl()});
const auth = o => ({...o,meta:{...o?.meta,'x-api-key':env.TATUM_API_KEY},timeout:45000});
const transport = {
  mergeOptions:o=>auth(native.mergeOptions(o)),
  unary:(m,i,o)=>native.unary(m,i,auth(o)),
  serverStreaming:(m,i,o)=>native.serverStreaming(m,i,auth(o)),
  clientStreaming:(m,o)=>native.clientStreaming(m,auth(o)),
  duplex:(m,o)=>native.duplex(m,auth(o))
};
const simulator = process.env.USE_PUBLIC_GRPC === '1' ? grpc : (env.TATUM_API_KEY ? new SuiGrpcClient({network:'mainnet',transport}) : grpc);
outcome.simulationProvider=process.env.USE_PUBLIC_GRPC==='1' ? 'Sui public Mainnet gRPC' : (env.TATUM_API_KEY?'Tatum Sui Mainnet gRPC':'Sui public Mainnet gRPC');
const aggregator = new AggregatorClient({env:Env.Mainnet,signer:SENDER,client:grpc});
const outPath=path.join(ROOT,'evidence','upstream-route-repair-replay.json');
const persist=()=>{outcome.updatedAt=new Date().toISOString();fs.writeFileSync(outPath,JSON.stringify(outcome,null,2)+'\n');};
const num=r=>BigInt(r.amountOut.toString());
const amountOf=r=>BigInt(r.amountIn.toString());
const down=(n,ppm)=>n*BigInt(1000000-ppm)/1000000n;
async function route(label,from,target,amount,providers=ALLOWED) {
  for(let attempt=0;attempt<2;attempt++){
    try {
      const r=await aggregator.findRouters({from,target,amount,byAmountIn:true,slippage:0.005,providers});
      if(!r || r.error || !r.quoteID || r.paths?.length===0) throw Error(JSON.stringify(r?.error||'empty route'));
      const e={label,amountIn:amountOf(r).toString(),amountOut:num(r).toString(),
        providers:r.paths.map(p=>p.provider),pathCount:r.paths.length,requestId:r.quoteID};
      outcome.candidateQuotes.push(e);console.log('ROUTE_QUOTE',JSON.stringify(e));persist();return r;
    } catch(e) {
      console.log('QUOTE_RETRY',JSON.stringify({label,attempt,error:String(e?.message||e).slice(0,250)}));
      if(attempt===1)throw e;
    }
  }
}
function sh(tx) {return tx.sharedObjectRef({objectId:POOL,initialSharedVersion:773317532,mutable:true});}
function value(tx,coin,coinType){return tx.moveCall({target:'0x2::coin::value',typeArguments:[coinType],arguments:[coin]});}
function decode(sim,r) {
  const i=r?.Result;
  const v=Buffer.from(sim.commandResults?.[i]?.returnValues?.[0]?.bcs||[]);
  return v.length===8?v.readBigUInt64LE(0).toString():null;
}
async function replay(label,steps) {
  const tx=new Transaction();tx.setSender(SENDER);tx.setGasBudget(500000000);
  const [borrowed,loan]=tx.moveCall({target:DB+'::pool::borrow_flashloan_base',
    typeArguments:[S,SU],arguments:[sh(tx),tx.pure.u64(PRINCIPAL)]});
  let coin=borrowed;
  let currentType=S;
  const marks=[];
  for(const {router,from,to} of steps) {
    if(from!==currentType)throw Error('Wrong leg order');
    const before=value(tx,coin,from);
    const needed=amountOf(router);
    // Only spend the quoted input. Preserve any leftover as an explicit, non-repayment asset.
    const input=tx.splitCoins(coin,[tx.pure.u64(needed)])[0];
    tx.transferObjects([coin],tx.pure.address(SENDER));
    const returned=await aggregator.routerSwap({router,inputCoin:input,slippage:0.005,txb:tx});
    const after=value(tx,returned,to);
    marks.push({from,to,needed:needed.toString(),before,after,providers:router.paths.map(p=>p.provider)});
    coin=returned;currentType=to;
  }
  if(currentType!==S)throw Error('Final coin is not SUI');
  const finalSui=value(tx,coin,S);
  const repay=tx.splitCoins(coin,[tx.pure.u64(PRINCIPAL)])[0];
  const remainder=value(tx,coin,S);
  tx.moveCall({target:DB+'::pool::return_flashloan_base',
    typeArguments:[S,SU],arguments:[sh(tx),repay,loan]});
  tx.transferObjects([coin],tx.pure.address(SENDER));
  console.log('REPLAY_TX_BUILT',JSON.stringify({label,commands:tx.getData().commands.length,inputCount:tx.getData().inputs.length}));
  let sim;
  try { sim=await simulator.simulateTransaction({transaction:tx,
    include:{effects:true,transaction:true,commandResults:true,balanceChanges:true},doGasSelection:false}); }
  catch(e){console.log('REPLAY_TRANSPORT_ERROR',JSON.stringify({label,provider:outcome.simulationProvider,error:String(e?.stack||e).slice(0,1700)}));throw e;}
  const body=sim.Transaction||sim.FailedTransaction||{};
  const actual=decode(sim,finalSui);
  const success=sim.$kind==='Transaction' && body.status?.success===true;
  const guard=assessRepaymentCandidate({principalMist:PRINCIPAL,quotedOutputMist:steps.at(-1).router.amountOut.toString(),
    atomicSimulation:{outcome:sim.$kind,success,error:body.status?.error?.message??body.status?.error??null},walletCoinFunding:false});
  const entry={label,outcome:sim.$kind,success,error:body.status?.error?.message??body.status?.error??null,
    guard,
    initialPrincipalMist:PRINCIPAL.toString(), commandCount:tx.getData().commands.length,
    steps:marks.map(m=>({from:m.from,to:m.to,expectedInputMist:m.needed,
      actualAvailableInputMist:decode(sim,m.before),actualOutputMist:decode(sim,m.after),providers:m.providers})),
    actualFinalSuiMist:actual, surplusMist:actual?(BigInt(actual)-PRINCIPAL).toString():null,
    postRepaymentSuiMist:decode(sim,remainder),
    gasPaymentMocked:sim.gasPaymentMocked??null, signed:false,onchainExecuted:false,
    noWalletCoins:true,checkedAt:new Date().toISOString()};
  outcome.replays.push(entry);console.log('FULL_REPLAY',JSON.stringify(entry));persist();return entry;
}
async function main(){
  // Aggressive buffer: 0.02% on each intermediate quote; never borrow more or inject sender coin funds.
  const reservePpm=Number(process.env.RESERVE_PPM ?? 200);
  outcome.reservePpm=reservePpm;
  const first=await route('SUI_to_USDSUI',S,U,PRINCIPAL);
  const second=await route('USDSUI_to_USDC',U,C,down(num(first),reservePpm));
  const third=await route('USDC_to_SUI',C,S,down(num(second),reservePpm));
  const expectedOut=num(third);
  const upstreamGuard=assessRepaymentCandidate({principalMist:PRINCIPAL,quotedOutputMist:expectedOut});
  outcome.candidateGuards ??= [];
  outcome.candidateGuards.push({label:'three-legs',...upstreamGuard});
  console.log('UPSTREAM_QUOTED_NET',JSON.stringify({principalMist:PRINCIPAL.toString(),
    expectedFinalSuiMist:expectedOut.toString(),quotedNetMist:(expectedOut-PRINCIPAL).toString()}));
  if(!upstreamGuard.quotePass && process.env.FORCE_REPLAY!=='1'){
    outcome.replays.push({label:'three-legs',success:false,skippedSimulation:true,
      reason:'Slippage-protected quote cannot guarantee principal repayment; fail closed.',
      quotedNetMist:(expectedOut-PRINCIPAL).toString()});
    persist();
  }else try {await replay('three-legs-requoted',[
    {router:first,from:S,to:U},{router:second,from:U,to:C},{router:third,from:C,to:S}]);
  }catch(e){outcome.replays.push({label:'three-legs',success:false,error:String(e?.message||e)});persist();console.log('REPLAY_CANDIDATE_ERROR',String(e?.message||e));}
  // Also explore direct SUI->USDC->SUI to remove the intermediate hop, while preserving principal.
  const direct=await route('SUI_to_USDC_direct',S,C,PRINCIPAL);
  const back=await route('USDC_to_SUI_direct',C,S,down(num(direct),reservePpm));
  const directNet=num(back)-PRINCIPAL;
  const directGuard=assessRepaymentCandidate({principalMist:PRINCIPAL,quotedOutputMist:num(back)});
  outcome.candidateGuards.push({label:'two-legs-direct',...directGuard});
  console.log('DIRECT_QUOTED_NET',JSON.stringify({principalMist:PRINCIPAL.toString(),
    expectedFinalSuiMist:num(back).toString(),quotedNetMist:directNet.toString()}));
  if(!directGuard.quotePass && process.env.FORCE_REPLAY!=='1')outcome.replays.push({label:'two-legs-direct',success:false,skippedSimulation:true,
    reason:'Slippage-protected quote cannot guarantee principal repayment; fail closed.',quotedNetMist:directNet.toString()});
  else try {await replay('two-legs-direct', [{router:direct,from:S,to:C},{router:back,from:C,to:S}]);}
  catch(e) {outcome.replays.push({label:'two-legs-direct',success:false,error:String(e?.message||e)});persist();console.log('REPLAY_CANDIDATE_ERROR',String(e?.message||e));}
  persist();console.log('PROOF_SAVED',outPath);
}
try{await main();}catch(e){outcome.error=String(e?.stack||e).slice(0,1500);persist();console.log('UPSTREAM_REPLAY_ERROR',outcome.error);process.exitCode=1;}
