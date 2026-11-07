// Search better SUI -> USDSUI upstream routes while preserving the original
// Bluefin USDSUI -> USDC and DeepBook USDC -> SUI downstream hops.
// Read-only quotes only: no signing, transaction submission or Walrus writes.
import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns';
import https from 'node:https';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';

dns.setServers(['1.1.1.1','8.8.8.8']);
const lookup=(hostname,options,callback)=>{
 if(typeof options==='function'){callback=options;options={};}
 dns.resolve4(hostname,(err,addresses)=>{
  if(err)return callback(err);
  if(options?.all)return callback(null,addresses.map(address=>({address,family:4})));
  return callback(null,addresses[0],4);
 });
};
globalThis.fetch=(input,init={})=>new Promise((resolve,reject)=>{
 const url=new URL(typeof input==='string'?input:input.url);
 const headers=init.headers instanceof Headers?Object.fromEntries(init.headers.entries()):(init.headers||{});
 const req=https.request({hostname:url.hostname,port:Number(url.port||443),path:url.pathname+url.search,
  method:init.method||'GET',headers,lookup},res=>{
  const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>{
   const body=Buffer.concat(chunks).toString('utf8');
   resolve({status:res.statusCode||0,ok:(res.statusCode||0)>=200&&(res.statusCode||0)<300,
    headers:{get:n=>res.headers[String(n).toLowerCase()]??null},text:async()=>body,json:async()=>JSON.parse(body)});
  });
 });
 req.setTimeout(20000,()=>req.destroy(new Error('Cetus upstream quote timeout')));
 req.on('error',reject);if(init.body)req.write(init.body);req.end();
});
const ROOT=path.resolve(import.meta.dirname,'../..');
const saved=JSON.parse(fs.readFileSync(path.join(ROOT,'evidence','context-BbRZD7YfTiiN.json'),'utf8'));
const baseline=JSON.parse(fs.readFileSync(path.join(ROOT,'evidence','original-route-live-quotes.json'),'utf8'));
const SENDER=saved.transactionData.sender;
const PRINCIPAL=65265188650n;
const SUI='0x2::sui::SUI';
const USDSUI='0x44f838219cf67b058f3b37907b655f226153c18e33dfcd0da559a844fea9b1c1::usdsui::USDSUI';
const USDC='0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';
const BLUEFIN='0xd075338d105482f1527cbfd363d6413558f184dec36d9138a70261e87f486e9c';
const BLUEFIN_POOL='0x3fe620cd2b94ed7bc333f46e984cdea6cf42cfd9ddd54f15016d61c2f8149a90';
const BLUEFIN_POOL_ISV='808468881';
const DEEPBOOK='0x0e735f8c93a95722efd73521aca7a7652c0bb71ed1daf41b26dfd7d1ff71f748';
const DEEPBOOK_POOL='0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407';
const DEEPBOOK_POOL_ISV='389750322';
const CLOCK='0x6',CLOCK_ISV='1';
const BLUEFIN_SQRT_LIMIT=4295048017n;
const transport=new GrpcTransport({host:'dns://8.8.8.8/fullnode.mainnet.sui.io:443',channelCredentials:ChannelCredentials.createSsl()});
const client=new SuiGrpcClient({network:'mainnet',transport});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const decodeLE=bytes=>{const b=Buffer.from(bytes||[]);let n=0n;for(let i=b.length-1;i>=0;i--)n=(n<<8n)|BigInt(b[i]);return n;};
const completeCoinType=type=>{
 const index=type.indexOf('::');if(index<0)return type;
 const prefix=type.slice(0,index);if(!prefix.startsWith('0x'))return type;
 return '0x'+prefix.slice(2).padStart(64,'0')+type.slice(index);
};
const ROUTER_ENDPOINT='https://api-sui.cetus.zone/router_v3';
const AGGREGATOR_SDK_VERSION=1010705;
// Never reuse any of the three original incident pools in the upstream candidate.
const EXCLUDED_ORIGINAL_POOLS=[
 '0x835effa94dba86cf354ced62e33ce59ce6754cd0e57e7ee84a6ede2f7d7f8056', // original Turbos SUI/USDSUI
 '0x3fe620cd2b94ed7bc333f46e984cdea6cf42cfd9ddd54f15016d61c2f8149a90', // original Bluefin USDSUI/USDC
 '0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407'  // original DeepBook SUI/USDC
];
// Exclude the original Turbos pool so other Turbos pools can still be considered.
const ALTERNATIVE_PROVIDERS=[
 'CETUS','KRIYA','DIPCOIN','FLOWX','FLOWXV3','KRIYAV3','TURBOS','AFTERMATH','HAEDAL',
 'VOLO','AFSUI','BLUEMOVE','DEEPBOOKV3','SCALLOP','SUILEND','BLUEFIN',
 'HAEDALPMM','ALPHAFI','SPRINGSUI','STEAMM','METASTABLE','OBRIC','HAWAL',
 'STEAMM_OMM','MOMENTUM','STEAMM_OMM_V2','MAGMA','HAEDALHMMV2','FULLSAIL',
 'CETUSDLMM','FERRADLMM','FERRACLMM','BOLT','MAGMAPROPAMM','HAEDALPROPAMM','CETUS_TIDE'
];
async function findAlternativeRoute(amount,splitCount){
 const params=new URLSearchParams({
  from:completeCoinType(SUI),target:completeCoinType(USDSUI),amount:amount.toString(),
  by_amount_in:'true',split_count:String(splitCount),providers:ALTERNATIVE_PROVIDERS.join(','),
  exclude_pools:EXCLUDED_ORIGINAL_POOLS.join(','),v:String(AGGREGATOR_SDK_VERSION)
 });
 const response=await fetch(ROUTER_ENDPOINT+'/find_routes?'+params.toString());
 const body=await response.json();
 if(!response.ok)throw new Error('Cetus route API HTTP '+response.status+': '+JSON.stringify(body).slice(0,500));
 if(!body?.data)return {available:false,error:body?.msg||body?.message||JSON.stringify(body).slice(0,500)};
 const data=body.data;
 return {available:true,quoteId:data.request_id||null,amountInMist:String(data.amount_in),amountOutMist:String(data.amount_out),
  paths:(data.paths||[]).map(p=>({id:p.id,direction:p.direction,provider:p.provider,from:p.from,target:p.target,
   feeRate:p.fee_rate,amountInMist:String(p.amount_in),amountOutMist:String(p.amount_out),version:p.version,
   extendedDetails:p.extended_details||null}))};
}
async function quoteBluefin(usdsuiIn){
 const tx=new Transaction();tx.setSender(SENDER);tx.setGasBudget(50000000);
 const pool=tx.sharedObjectRef({objectId:BLUEFIN_POOL,initialSharedVersion:BLUEFIN_POOL_ISV,mutable:false});
 tx.moveCall({target:BLUEFIN+'::pool::calculate_swap_results',typeArguments:[USDSUI,USDC],
  arguments:[pool,tx.pure.bool(true),tx.pure.bool(true),tx.pure.u64(usdsuiIn),tx.pure.u128(BLUEFIN_SQRT_LIMIT)]});
 const sim=await client.simulateTransaction({transaction:tx,include:{effects:true,transaction:true,commandResults:true},doGasSelection:false});
 if(sim.$kind!=='Transaction'||sim.Transaction?.status?.success!==true)throw new Error('Bluefin quote failed: '+JSON.stringify(sim.FailedTransaction?.status?.error));
 const b=Buffer.from(sim.commandResults?.[0]?.returnValues?.[0]?.bcs||[]);
 if(b.length<26)throw new Error('Bad Bluefin SwapResult length '+b.length);
 return {usdsuiRemainderMist:decodeLE(b.subarray(10,18)).toString(),usdcOutMist:decodeLE(b.subarray(18,26)).toString()};
}
async function quoteDeepbook(usdcIn){
 const tx=new Transaction();tx.setSender(SENDER);tx.setGasBudget(50000000);
 const pool=tx.sharedObjectRef({objectId:DEEPBOOK_POOL,initialSharedVersion:DEEPBOOK_POOL_ISV,mutable:false});
 const clock=tx.sharedObjectRef({objectId:CLOCK,initialSharedVersion:CLOCK_ISV,mutable:false});
 tx.moveCall({target:DEEPBOOK+'::pool::get_base_quantity_out_input_fee',typeArguments:[SUI,USDC],
  arguments:[pool,tx.pure.u64(usdcIn),clock]});
 const sim=await client.simulateTransaction({transaction:tx,include:{effects:true,transaction:true,commandResults:true},doGasSelection:false});
 if(sim.$kind!=='Transaction'||sim.Transaction?.status?.success!==true)throw new Error('DeepBook quote failed: '+JSON.stringify(sim.FailedTransaction?.status?.error));
 const v=sim.commandResults?.[0]?.returnValues||[];
 if(v.length<3)throw new Error('DeepBook quote missing tuple');
 return {suiOutMist:decodeLE(v[0].bcs).toString(),usdcRemainderMist:decodeLE(v[1].bcs).toString(),deepRequiredMist:decodeLE(v[2].bcs).toString()};
}
const sizes=[PRINCIPAL,65000000000n,64900000000n];
const candidates=[];
for(const tradeSize of sizes){
 for(const splitCount of [1,2]){
  const route=await findAlternativeRoute(tradeSize,splitCount);
  const amountOut=BigInt(route?.amountOutMist||'0');
  if(!route?.available||!route.quoteId||!route.paths?.length||amountOut<=0n){
   candidates.push({tradeSizeMist:tradeSize.toString(),splitCount,available:false,error:route?.error||'no alternative route'});
   continue;
  }
  await delay(250);
  const bluefin=await quoteBluefin(amountOut);
  await delay(250);
  const deepbook=await quoteDeepbook(BigInt(bluefin.usdcOutMist));
  const reserve=PRINCIPAL-tradeSize;
  const availableSui=reserve+BigInt(deepbook.suiOutMist);
  candidates.push({tradeSizeMist:tradeSize.toString(),untouchedReserveMist:reserve.toString(),splitCount,
   quoteId:route.quoteId,upstreamProviders:route.paths.map(p=>p.provider),upstreamPaths:route.paths,
   usdsuiOutMist:amountOut.toString(),bluefin,deepbook,
   repayment:{availableSuiMist:availableSui.toString(),principalMist:PRINCIPAL.toString(),
    marginMist:(availableSui-PRINCIPAL).toString(),repayable:availableSui>=PRINCIPAL}});
  await delay(300);
 }
}
const report={schema:'casewake-original-upstream-route-candidates/v1',originalDigest:saved.digest,
 network:'sui-mainnet',routeIntent:'SUI -> USDSUI -> USDC -> SUI (preserve original Bluefin and DeepBook downstream legs)',
 baselineOriginalTurbos:{tradeSizeMist:PRINCIPAL.toString(),
  usdsuiOutMist:baseline.sweep[0].hop1.decoded.usdsuiOutMist,
  bluefinUsdcOutMist:baseline.sweep[0].hop2.decoded.usdcOutMist,
  deepbookSuiOutMist:baseline.sweep[0].hop3.decoded.suiOutMist,
  availableSuiMist:baseline.sweep[0].repayment.availableSuiMist,
  marginMist:baseline.sweep[0].repayment.marginMist},
 candidates,bestRepayable:candidates.filter(x=>x.repayment?.repayable).sort((a,b)=>BigInt(b.repayment.marginMist)>BigInt(a.repayment.marginMist)?-1:1)[0]||null,
 limitations:['Cetus Aggregator quotes are upstream quote candidates only; all three original pools (Turbos, Bluefin, DeepBook) are excluded so the candidate cannot route through the original pools; no PTB built or simulated.',
  'Downstream Bluefin and DeepBook quotes are read-only live view calls.',
  'A quote candidate must be assembled into a complete flashloan PTB and pass Tatum plus an independent full simulation before Gate 1.'],
 safety:{signed:false,onchainExecuted:false,walletFunded:false,walrusWritten:false,gate1Eligible:false},generatedAt:new Date().toISOString()};
const out=path.join(ROOT,'evidence','original-upstream-route-candidates.json');
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('ORIGINAL_UPSTREAM_CANDIDATES',JSON.stringify({baseline:report.baselineOriginalTurbos,
 candidates:candidates.map(x=>({tradeSizeMist:x.tradeSizeMist,splitCount:x.splitCount,providers:x.upstreamProviders,usdsuiOutMist:x.usdsuiOutMist,
  bluefinUsdcOutMist:x.bluefin?.usdcOutMist,deepbookSuiOutMist:x.deepbook?.suiOutMist,marginMist:x.repayment?.marginMist,repayable:x.repayment?.repayable,error:x.error})),
 bestRepayable:report.bestRepayable?.quoteId||null,file:out}));
