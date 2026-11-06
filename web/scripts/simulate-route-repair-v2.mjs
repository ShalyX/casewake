// Read-only full-principal DeepBook repayment candidate using live Cetus routes.
// All swap input is a split of the flashloan coin; no wallet-owned coin funds swaps or repayment.
// Simulates on Tatum Mainnet only. Never signs, submits, executes or writes to Walrus.
import fs from "node:fs";
import path from "node:path";
import dns from "node:dns";
import https from "node:https";
import { AggregatorClient, Env } from "@cetusprotocol/aggregator-sdk";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { Transaction } from "@mysten/sui/transactions";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { ChannelCredentials } from "@grpc/grpc-js";
import { assessRepaymentCandidate } from "./repayment-safety.mjs";

dns.setServers(["1.1.1.1","8.8.8.8"]);
const lookup=(hostname,options,callback)=>{
  if(typeof options==="function"){callback=options;options={};}
  dns.resolve4(hostname,(err,addresses)=>{
    if(err)return callback(err);
    if(options?.all)return callback(null,addresses.map(address=>({address,family:4})));
    return callback(null,addresses[0],4);
  });
};
globalThis.fetch=(input,init={})=>new Promise((resolve,reject)=>{
  const url=new URL(typeof input==="string"?input:input.url);
  const headers=init.headers instanceof Headers?Object.fromEntries(init.headers.entries()):(init.headers||{});
  const req=https.request({hostname:url.hostname,port:Number(url.port||443),path:url.pathname+url.search,
    method:init.method||"GET",headers,lookup},res=>{
      const chunks=[];res.on("data",c=>chunks.push(c));res.on("end",()=>{
        const body=Buffer.concat(chunks).toString("utf8");
        resolve({status:res.statusCode||0,ok:(res.statusCode||0)>=200&&(res.statusCode||0)<300,
          headers:{get:n=>res.headers[String(n).toLowerCase()]??null},
          text:async()=>body,json:async()=>JSON.parse(body)});
      });
    });
  req.setTimeout(15000,()=>req.destroy(new Error("Cetus quote request timed out")));
  req.on("error",reject);if(init.body)req.write(init.body);req.end();
});

const ROOT=path.resolve(import.meta.dirname,"../..");
const WEB=path.join(ROOT,"web");
const cfg=Object.fromEntries(fs.readFileSync(path.join(WEB,".env.local"),"utf8")
  .split(/\r?\n/).filter(x=>/^[A-Z_]+=/.test(x))
  .map(x=>{const i=x.indexOf("=");return[x.slice(0,i),x.slice(i+1).trim().replace(/^['"]|['"]$/g,"")];}));
if(!cfg.TATUM_API_KEY)throw new Error("Tatum API key missing; no simulation attempted.");

const S="0x2::sui::SUI";
const C="0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";
const SU="0x41d587e5336f1c86cad50d38a7136db99333bb9bda91cea4ba69115defeb1402::sui_usde::SUI_USDE";
const DB="0x0e735f8c93a95722efd73521aca7a7652c0bb71ed1daf41b26dfd7d1ff71f748";
const POOL="0x034f3a42e7348de2084406db7a725f9d9d132a56c68324713e6e623601fb4fd7";
const SENDER="0x457d5ecda9f125053adf94fe357549e11e6fa688679cf94ababb5793ed3916ce";
const PRINCIPAL=65265188650n;
const SWAP_SIZE=BigInt(process.env.SWAP_SIZE_MIST||"1250000000");
const SPLIT_COUNT=Number(process.env.SPLIT_COUNT||"2");
const PROVIDERS=(process.env.PROVIDERS||"").split(",").map(x=>x.trim()).filter(Boolean);
if(SWAP_SIZE<=0n||SWAP_SIZE>=PRINCIPAL)throw new Error("Trade size must be positive and smaller than the exact loan principal.");

const publicTransport=new GrpcTransport({host:"dns://8.8.8.8/fullnode.mainnet.sui.io:443",
  channelCredentials:ChannelCredentials.createSsl()});
const publicClient=new SuiGrpcClient({network:"mainnet",transport:publicTransport});
const aggregator=new AggregatorClient({env:Env.Mainnet,signer:SENDER,client:publicClient});

const native=new GrpcTransport({host:"dns://1.1.1.1/sui-mainnet-grpc.gateway.tatum.io:443",
  channelCredentials:ChannelCredentials.createSsl()});
const auth=o=>({...o,meta:{...o?.meta,"x-api-key":cfg.TATUM_API_KEY},timeout:60000});
const tatumTransport={
  mergeOptions:o=>auth(native.mergeOptions(o)),
  unary:(m,i,o)=>native.unary(m,i,auth(o)),
  serverStreaming:(m,i,o)=>native.serverStreaming(m,i,auth(o)),
  clientStreaming:(m,o)=>native.clientStreaming(m,auth(o)),
  duplex:(m,o)=>native.duplex(m,auth(o))
};
const tatum=new SuiGrpcClient({network:"mainnet",transport:tatumTransport});

const forward=await aggregator.findRouters({from:S,target:C,amount:SWAP_SIZE,byAmountIn:true,
  slippage:0.005,splitCount:SPLIT_COUNT,...(PROVIDERS.length?{providers:PROVIDERS}:{})});
if(!forward?.quoteID||!forward.paths?.length||BigInt(forward.amountOut.toString())<=0n)
  throw new Error("No valid forward route: "+JSON.stringify(forward?.error||"empty route"));
const HANDOFF_BUFFER_PPM=Number(process.env.HANDOFF_BUFFER_PPM||"5000"); if(!Number.isInteger(HANDOFF_BUFFER_PPM)||HANDOFF_BUFFER_PPM<0||HANDOFF_BUFFER_PPM>5000)throw Error("Invalid handoff buffer"); const backQuoteInput=BigInt(forward.amountOut.toString())*BigInt(1000000-HANDOFF_BUFFER_PPM)/1000000n; if(backQuoteInput<=0n)throw Error("Handoff quote dust"); const back=await aggregator.findRouters({from:C,target:S,amount:backQuoteInput,
  byAmountIn:true,slippage:0.005,splitCount:SPLIT_COUNT,...(PROVIDERS.length?{providers:PROVIDERS}:{})});
if(!back?.quoteID||!back.paths?.length||BigInt(back.amountOut.toString())<=0n)
  throw new Error("No valid return route: "+JSON.stringify(back?.error||"empty route"));
const quotedNet=BigInt(back.amountOut.toString())-SWAP_SIZE; console.log("LIVE_QUOTES",JSON.stringify({swap:SWAP_SIZE.toString(),profitMist:quotedNet.toString(),forwardProviders:forward.paths.map(p=>p.provider),backProviders:back.paths.map(p=>p.provider)}));

const untouchedQuote=PRINCIPAL-SWAP_SIZE;
const totalQuotedSui=untouchedQuote+BigInt(back.amountOut.toString());
const economicScreen=assessRepaymentCandidate({
  principalMist:PRINCIPAL,
  quotedOutputMist:totalQuotedSui,
  untouchedReserveMist:untouchedQuote,
  slippageBps:50,
  minimumProfitMist:1000000n,
});
console.log("ROUTE_SAFETY_SCREEN",JSON.stringify({
  outputGrossMist:quotedNet.toString(),
  untouchedReserveMist:untouchedQuote.toString(),
  handoffBufferPpm:HANDOFF_BUFFER_PPM,
  conservativeTotalSuiMist:economicScreen.conservativeOutputMist,
  minimumRequiredMist:economicScreen.minimumRequiredMist,
  quotePass:economicScreen.quotePass,
  reasons:economicScreen.reasons,
}));
if(!economicScreen.quotePass && process.env.FORCE_DIAGNOSTIC_SIMULATION!=="1"){
  const screen={schema:"casewake-route-screen-v2/v1",
    originalDigest:"BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6",
    provider:"Cetus Aggregator Mainnet",principalMist:PRINCIPAL.toString(),
    swapSizeMist:SWAP_SIZE.toString(),handoffBufferPpm:HANDOFF_BUFFER_PPM,
    forwardQuoteId:forward.quoteID,backQuoteId:back.quoteID,
    grossNetMist:quotedNet.toString(),economicScreen,
    verdict:"BLOCK_NO_FINANCIALLY_SAFE_ROUTE",simulated:false,
    signed:false,onchainExecuted:false,walrusWritten:false,
    checkedAt:new Date().toISOString()};
  const screenFile=path.join(ROOT,"evidence","route-screen-v2-"+SWAP_SIZE.toString()+".json");
  fs.writeFileSync(screenFile,JSON.stringify(screen,null,2)+"\n");
  console.log("BLOCK_UNSAFE_ROUTE",JSON.stringify({screenFile,grossNetMist:screen.grossNetMist,
    conservativeTotalSuiMist:economicScreen.conservativeOutputMist,
    minimumRequiredMist:economicScreen.minimumRequiredMist}));
  process.exitCode=2;process.exit();
}
const tx=new Transaction();tx.setSender(SENDER);tx.setGasBudget(50000000);
const sh=()=>tx.sharedObjectRef({objectId:POOL,initialSharedVersion:773317532,mutable:true});
const [borrowed,receipt]=tx.moveCall({target:DB+"::pool::borrow_flashloan_base",
  typeArguments:[S,SU],arguments:[sh(),tx.pure.u64(PRINCIPAL)]});
const borrowedValue=tx.moveCall({target:"0x2::coin::value",typeArguments:[S],arguments:[borrowed]});
const [swapInput]=tx.splitCoins(borrowed,[tx.pure.u64(SWAP_SIZE)]);
const afterSplit=tx.moveCall({target:"0x2::coin::value",typeArguments:[S],arguments:[borrowed]});
const inputValue=tx.moveCall({target:"0x2::coin::value",typeArguments:[S],arguments:[swapInput]});
const usdc=await aggregator.routerSwap({router:forward,inputCoin:swapInput,slippage:0.005,txb:tx});
const actualUsdc=tx.moveCall({target:"0x2::coin::value",typeArguments:[C],arguments:[usdc]});
const [backInput]=tx.splitCoins(usdc,[tx.pure.u64(BigInt(back.amountIn.toString()))]); tx.transferObjects([usdc],SENDER); const sui=await aggregator.routerSwap({router:back,inputCoin:backInput,slippage:0.005,txb:tx});
const actualSui=tx.moveCall({target:"0x2::coin::value",typeArguments:[S],arguments:[sui]});
tx.mergeCoins(borrowed,[sui]);
const beforeRepayment=tx.moveCall({target:"0x2::coin::value",typeArguments:[S],arguments:[borrowed]});
const [repayment]=tx.splitCoins(borrowed,[tx.pure.u64(PRINCIPAL)]);
const afterRepayment=tx.moveCall({target:"0x2::coin::value",typeArguments:[S],arguments:[borrowed]});
tx.moveCall({target:DB+"::pool::return_flashloan_base",typeArguments:[S,SU],arguments:[sh(),repayment,receipt]});
tx.transferObjects([borrowed],SENDER);

const data=tx.getData();
const ref=x=>x?.Input!==undefined?"I"+x.Input:x?.Result!==undefined?"R"+x.Result:x?.NestedResult?"N"+x.NestedResult.join(":"):JSON.stringify(x);
const commandMap=data.commands.map((c,i)=>{
 const kind=Object.keys(c)[0];
 if(c.MoveCall)return {i,kind,target:c.MoveCall.package+"::"+c.MoveCall.module+"::"+c.MoveCall.function,
  types:c.MoveCall.typeArguments,args:c.MoveCall.arguments.map(ref)};
 if(c.SplitCoins)return {i,kind,coin:ref(c.SplitCoins.coin),amounts:c.SplitCoins.amounts.map(ref)};
 if(c.MergeCoins)return {i,kind,destination:ref(c.MergeCoins.destination),sources:c.MergeCoins.sources.map(ref)};
 if(c.TransferObjects)return {i,kind,objects:c.TransferObjects.objects.map(ref),address:ref(c.TransferObjects.address)};
 return {i,kind};
});
const walletObjectInputs=data.inputs.filter(x=>x.Object?.ImmOrOwnedObject||x.Object?.Receiving);
if(walletObjectInputs.length)throw new Error("Wallet-owned object input detected in swap/repayment PTB; refusing simulation.");
const result=await tatum.simulateTransaction({transaction:tx,
 include:{effects:true,transaction:true,bcs:true,commandResults:true,balanceChanges:true},doGasSelection:false});
const body=result.Transaction||result.FailedTransaction||{};
const error=body.status?.error?.message??body.status?.error??null;
const decode=r=>{
 const b=Buffer.from(result.commandResults?.[r?.Result]?.returnValues?.[0]?.bcs||[]);
 return b.length===8?b.readBigUInt64LE(0).toString():null;
};
const actualTradeNet=decode(actualSui)?BigInt(decode(actualSui))-SWAP_SIZE:null;
const before=decode(beforeRepayment);
const after=decode(afterRepayment);
const changes=result.balanceChanges||body.balanceChanges||[];
const gasChange=changes.find(x=>x.coinType?.endsWith("::sui::SUI")&&x.address?.toLowerCase()===SENDER.toLowerCase());
const gasCost=gasChange&&BigInt(gasChange.amount)<0n?-BigInt(gasChange.amount):0n;
const netAfterGas=actualTradeNet===null?null:actualTradeNet-gasCost;
const simSuccess=result.$kind==="Transaction"&&body.status?.success===true;
const guard=assessRepaymentCandidate({principalMist:PRINCIPAL,untouchedReserveMist:(PRINCIPAL-SWAP_SIZE),quotedOutputMist:(PRINCIPAL-SWAP_SIZE+BigInt(back.amountOut.toString())),minimumProfitMist:1000000n,
 atomicSimulation:{outcome:result.$kind,success:simSuccess,error},walletCoinFunding:false});
const entry={
 schema:"casewake-full-flashloan-repair-simulation/v2",
 originalDigest:"BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6",
 network:"sui-mainnet",provider:"Tatum Sui Mainnet gRPC TransactionExecutionService.SimulateTransaction",
 principalMist:PRINCIPAL.toString(),swapSizeMist:SWAP_SIZE.toString(),reservedSuiMist:(PRINCIPAL-SWAP_SIZE).toString(),
 providers:PROVIDERS,splitCount:SPLIT_COUNT,slippage:0.005,
 quote:{forwardQuoteId:forward.quoteID,forwardAmountIn:forward.amountIn.toString(),forwardAmountOut:forward.amountOut.toString(),
  forwardPaths:forward.paths.map(p=>({provider:p.provider,from:p.from,to:p.target,amountIn:String(p.amountIn),amountOut:String(p.amountOut)})),
  backQuoteId:back.quoteID,backAmountIn:back.amountIn.toString(),backAmountOut:back.amountOut.toString(),
  backPaths:back.paths.map(p=>({provider:p.provider,from:p.from,to:p.target,amountIn:String(p.amountIn),amountOut:String(p.amountOut)})),
  quotedGrossNetMist:quotedNet.toString()},
 simulation:{outcome:result.$kind,success:simSuccess,error,gasPaymentMocked:result.gasPaymentMocked??null,
  commandResultCount:result.commandResults?.length??0,commandMap:commandMap,
  borrowedSuiMist:decode(borrowedValue),reservedAfterSplitMist:decode(afterSplit),
  actualSwapInputMist:decode(inputValue),actualUsdcMicros:decode(actualUsdc),actualReturnedSuiMist:decode(actualSui),
  beforeRepaymentSuiMist:before,afterRepaymentSuiMist:after,gasBalanceChangeMist:gasChange?.amount??null,
  gasCostMist:gasCost.toString(),actualGrossNetMist:actualTradeNet?.toString()??null,netAfterGasMist:netAfterGas?.toString()??null,
  balanceChanges:changes},
 guard,walletOwnedObjectInputs:walletObjectInputs.length,signed:false,onchainExecuted:false,walrusWritten:false,
 checkedAt:new Date().toISOString()
};
const accepted=simSuccess&&BigInt(before||"0")>=PRINCIPAL&&walletObjectInputs.length===0&&
  actualTradeNet!==null&&netAfterGas!==null&&netAfterGas>=0n;
entry.acceptedForGate1=accepted&&guard.quotePass;
const out=path.join(ROOT,"evidence","route-repair-v2-"+SWAP_SIZE.toString()+"-mainnet.json");
fs.writeFileSync(out,JSON.stringify(entry,null,2)+"\n");
console.log("ROUTE_REPAIR_V2",JSON.stringify({outcome:entry.simulation.outcome,success:entry.simulation.success,
 error:entry.simulation.error,quoteNet:entry.quote.quotedGrossNetMist,actualNet:entry.simulation.actualGrossNetMist,
 gasCost:entry.simulation.gasCostMist,netAfterGas:entry.simulation.netAfterGasMist,
 beforeRepayment:entry.simulation.beforeRepaymentSuiMist,afterRepayment:entry.simulation.afterRepaymentSuiMist,
 commandResultCount:entry.simulation.commandResultCount,acceptedForGate1:accepted,commandMap}));
console.log("EVIDENCE_SAVED",out);
