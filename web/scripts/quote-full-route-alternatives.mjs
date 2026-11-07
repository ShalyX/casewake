// Search a complete three-hop alternative route for the historical Casewake
// flashloan, without reusing any original or previously used pool.
// Read-only aggregator quotes only. No transaction signing/submission or Walrus write.
import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns';
import https from 'node:https';

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
 req.setTimeout(20000,()=>req.destroy(new Error('Cetus route quote timeout')));
 req.on('error',reject);if(init.body)req.write(init.body);req.end();
});

const ROOT=path.resolve(import.meta.dirname,'../..');
const saved=JSON.parse(fs.readFileSync(path.join(ROOT,'evidence','context-BbRZD7YfTiiN.json'),'utf8'));
const PRINCIPAL=65265188650n;
const SUI='0x2::sui::SUI';
const USDSUI='0x44f838219cf67b058f3b37907b655f226153c18e33dfcd0da559a844fea9b1c1::usdsui::USDSUI';
const USDC='0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';
const ENDPOINT='https://api-sui.cetus.zone/router_v3';
const SDK_VERSION=1010705;
const ORIGINAL_POOLS=[
 '0x034f3a42e7348de2084406db7a725f9d9d132a56c68324713e6e623601fb4fd7', // original DeepBook SUI/SUI_USDE flashloan source pool
 '0x835effa94dba86cf354ced62e33ce59ce6754cd0e57e7ee84a6ede2f7d7f8056',
 '0x3fe620cd2b94ed7bc333f46e984cdea6cf42cfd9ddd54f15016d61c2f8149a90',
 '0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407'
];
const PROVIDERS=[
 'CETUS','KRIYA','DIPCOIN','FLOWX','FLOWXV3','KRIYAV3','TURBOS','AFTERMATH','HAEDAL',
 'VOLO','AFSUI','BLUEMOVE','DEEPBOOKV3','SCALLOP','SUILEND','BLUEFIN','HAEDALPMM',
 'ALPHAFI','SPRINGSUI','STEAMM','METASTABLE','OBRIC','HAWAL','STEAMM_OMM','MOMENTUM',
 'STEAMM_OMM_V2','MAGMA','HAEDALHMMV2','FULLSAIL','CETUSDLMM','FERRADLMM','FERRACLMM',
 'BOLT','MAGMAPROPAMM','HAEDALPROPAMM','CETUS_TIDE'
];
const complete=t=>{
 const i=t.indexOf('::');if(i<0)return t;
 const p=t.slice(0,i);return p.startsWith('0x')?'0x'+p.slice(2).padStart(64,'0')+t.slice(i):t;
};
async function findRoute(from,target,amount,splitCount,excluded){
 try{
  const params=new URLSearchParams({from:complete(from),target:complete(target),amount:amount.toString(),
   by_amount_in:'true',split_count:String(splitCount),providers:PROVIDERS.join(','),
   exclude_pools:[...new Set(excluded)].join(','),v:String(SDK_VERSION)});
  const response=await fetch(ENDPOINT+'/find_routes?'+params.toString());
  const body=await response.json();
  if(!response.ok)return {available:false,error:'Aggregator HTTP '+response.status+': '+JSON.stringify(body).slice(0,500)};
  if(!body?.data)return {available:false,error:body?.msg||body?.message||JSON.stringify(body).slice(0,500)};
  const data=body.data;
  return {available:true,quoteId:data.request_id||null,amountInMist:String(data.amount_in),
   amountOutMist:String(data.amount_out),paths:(data.paths||[]).map(p=>({id:p.id,provider:p.provider,
    from:p.from,target:p.target,direction:p.direction,amountInMist:String(p.amount_in),
    amountOutMist:String(p.amount_out),feeRate:p.fee_rate,extendedDetails:p.extended_details||null}))};
 }catch(error){return {available:false,error:String(error?.message||error).slice(0,500)};}
}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const tradeSizes=[64600000000n,64500000000n,64400000000n,64300000000n,64200000000n,64100000000n,64000000000n,63900000000n,63800000000n,63700000000n,63600000000n,63500000000n];
const MIN_SAFETY_MARGIN=100000000n; // 0.1 SUI reserve above flashloan principal
const splitCounts=[1,2,3,4];
const results=[];
for(const tradeSize of tradeSizes){
 for(const splitCount of splitCounts){
  const leg1=await findRoute(SUI,USDSUI,tradeSize,splitCount,ORIGINAL_POOLS);
  if(!leg1.available||!leg1.paths.length){
   results.push({tradeSizeMist:tradeSize.toString(),splitCount,complete:false,failedLeg:1,leg1});
   continue;
  }
  const used1=leg1.paths.map(p=>p.id);
  await delay(200);
  const leg2=await findRoute(USDSUI,USDC,BigInt(leg1.amountOutMist),splitCount,[...ORIGINAL_POOLS,...used1]);
  if(!leg2.available||!leg2.paths.length){
   results.push({tradeSizeMist:tradeSize.toString(),splitCount,complete:false,failedLeg:2,
    leg1,leg2,excludedForLeg2:[...ORIGINAL_POOLS,...used1]});
   continue;
  }
  const used2=leg2.paths.map(p=>p.id);
  await delay(200);
  const leg3=await findRoute(USDC,SUI,BigInt(leg2.amountOutMist),splitCount,[...ORIGINAL_POOLS,...used1,...used2]);
  if(!leg3.available||!leg3.paths.length){
   results.push({tradeSizeMist:tradeSize.toString(),splitCount,complete:false,failedLeg:3,
    leg1,leg2,leg3,excludedForLeg3:[...ORIGINAL_POOLS,...used1,...used2]});
   continue;
  }
  const reserve=PRINCIPAL-tradeSize;
  const available=reserve+BigInt(leg3.amountOutMist);
  const allPaths=[...leg1.paths,...leg2.paths,...leg3.paths];
  const usedPools=allPaths.map(p=>p.id);
  const originalPoolReuse=usedPools.filter(id=>ORIGINAL_POOLS.includes(id));
  const duplicatePools=usedPools.filter((id,index)=>usedPools.indexOf(id)!==index);
  const margin=available-PRINCIPAL;
  const providerSet=[...new Set(allPaths.map(p=>p.provider))];
  results.push({tradeSizeMist:tradeSize.toString(),untouchedReserveMist:reserve.toString(),splitCount,
   complete:true,leg1,leg2,leg3,routeComplexity:{swapCalls:allPaths.length,uniquePools:usedPools.length,
    uniqueProviders:providerSet,passesPoolIsolation:originalPoolReuse.length===0&&duplicatePools.length===0},
   poolReuseCheck:{originalPoolReuse,duplicatePools,passed:originalPoolReuse.length===0&&duplicatePools.length===0},
   repayment:{availableSuiMist:available.toString(),principalMist:PRINCIPAL.toString(),
    marginMist:margin.toString(),repayable:available>=PRINCIPAL,safetyMarginRequiredMist:MIN_SAFETY_MARGIN.toString(),
    safetyMarginPassed:margin>=MIN_SAFETY_MARGIN}});
  await delay(250);
 }
}
const completeResults=results.filter(x=>x.complete);
const bestMarginCandidate=completeResults.sort((a,b)=>BigInt(a.repayment.marginMist)>BigInt(b.repayment.marginMist)?-1:BigInt(a.repayment.marginMist)<BigInt(b.repayment.marginMist)?1:0)[0]||null;
const bestSafetyCandidate=completeResults.filter(x=>x.repayment.safetyMarginPassed).sort((a,b)=>BigInt(a.repayment.marginMist)>BigInt(b.repayment.marginMist)?-1:BigInt(a.repayment.marginMist)<BigInt(b.repayment.marginMist)?1:0)[0]||null;
const report={schema:'casewake-full-three-hop-alternatives/v3',originalDigest:saved.digest,
 network:'sui-mainnet',routeIntent:'Flashloan SUI -> USDSUI -> USDC -> SUI; each leg excludes the original flashloan source pool, all three original swap pools, and all previously used pools.',
 originalPoolsExcluded:ORIGINAL_POOLS,tradeSizesMist:tradeSizes.map(String),splitCounts,minimumSafetyMarginMist:MIN_SAFETY_MARGIN.toString(),results,
 bestMarginCandidate,bestRepayable:completeResults.filter(x=>x.repayment.repayable).sort((a,b)=>BigInt(a.repayment.marginMist)>BigInt(b.repayment.marginMist)?-1:BigInt(a.repayment.marginMist)<BigInt(b.repayment.marginMist)?1:0)[0]||null,bestSafetyCandidate,
 limitations:['Aggregator outputs are read-only quotes, not a built transaction or a full PTB simulation.',
  'Each leg excludes the flashloan source pool, all original swap pools and every pool used by previous legs to prevent stale same-pool quotes and artificial round-trip reuse.',
  'A candidate must still be assembled into the exact flashloan PTB and pass full Tatum Mainnet and independent simulation.',
  'No wallet-funded repayment, signing, execution, human approval or Walrus write occurred.'],
 safety:{signed:false,onchainExecuted:false,walletFunded:false,walrusWritten:false,gate1Eligible:false},
 generatedAt:new Date().toISOString()};
const out=path.join(ROOT,'evidence','full-three-hop-alternatives.json');
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('FULL_THREE_HOP_ALTERNATIVES',JSON.stringify({results:results.map(x=>({
 tradeSizeMist:x.tradeSizeMist,splitCount:x.splitCount,complete:x.complete,failedLeg:x.failedLeg,
 leg1Providers:x.leg1?.paths?.map(p=>p.provider),leg2Providers:x.leg2?.paths?.map(p=>p.provider),
 leg3Providers:x.leg3?.paths?.map(p=>p.provider),marginMist:x.repayment?.marginMist,
 repayable:x.repayment?.repayable,safetyMarginPassed:x.repayment?.safetyMarginPassed,swapCalls:x.routeComplexity?.swapCalls,poolReusePassed:x.poolReuseCheck?.passed,error:x.leg1?.error||x.leg2?.error||x.leg3?.error})),
 bestMargin:report.bestMarginCandidate?.repayment?.marginMist||null,bestRepayable:report.bestRepayable?.repayment?.marginMist||null,bestSafetyMargin:report.bestSafetyCandidate?.repayment?.marginMist||null,file:out}));
