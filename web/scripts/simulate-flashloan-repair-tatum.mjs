// Independent Tatum Sui Mainnet simulation of the same full Casewake flashloan PTB.
// No signing, submission, wallet-funded swap/repayment input or Walrus write.
import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns';
import https from 'node:https';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';
import { AggregatorClient, Env } from '@cetusprotocol/aggregator-sdk';

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
 req.setTimeout(20000,()=>req.destroy(new Error('Cetus quote timeout')));
 req.on('error',reject);if(init.body)req.write(init.body);req.end();
});

const ROOT=path.resolve(import.meta.dirname,'../..');
const saved=JSON.parse(fs.readFileSync(path.join(ROOT,'evidence','context-BbRZD7YfTiiN.json'),'utf8'));
const TATUM_API_KEY=process.env.TATUM_API_KEY;
if(!TATUM_API_KEY)throw new Error('TATUM_API_KEY missing; no Tatum simulation attempted.');
const SENDER=saved.transactionData.sender;
const PRINCIPAL=65265188650n;
const TRADE_SIZE=BigInt(process.env.CASEWAKE_TRADE_SIZE_MIST||'64600000000');
const QUOTE_SLIPPAGE=0.001;
const SWAP_SLIPPAGE=Number(process.env.CASEWAKE_SWAP_SLIPPAGE||'0.005');
const SUI='0x2::sui::SUI';
const SUI_USDE='0x41d587e5336f1c86cad50d38a7136db99333bb9bda91cea4ba69115defeb1402::sui_usde::SUI_USDE';
const USDSUI='0x44f838219cf67b058f3b37907b655f226153c18e33dfcd0da559a844fea9b1c1::usdsui::USDSUI';
const USDC='0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';
const DEEPBOOK='0x0e735f8c93a95722efd73521aca7a7652c0bb71ed1daf41b26dfd7d1ff71f748';
const LOAN_POOL='0x034f3a42e7348de2084406db7a725f9d9d132a56c68324713e6e623601fb4fd7';
const LOAN_POOL_ISV='773317532';
const ORIGINAL_SWAP_POOLS=[
 '0x835effa94dba86cf354ced62e33ce59ce6754cd0e57e7ee84a6ede2f7d7f8056',
 '0x3fe620cd2b94ed7bc333f46e984cdea6cf42cfd9ddd54f15016d61c2f8149a90',
 '0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407'
];
const publicTransport=new GrpcTransport({host:'dns://8.8.8.8/fullnode.mainnet.sui.io:443',channelCredentials:ChannelCredentials.createSsl()});
const publicClient=new SuiGrpcClient({network:'mainnet',transport:publicTransport});
const aggregator=new AggregatorClient({env:Env.Mainnet,signer:SENDER,client:publicClient});
const native=new GrpcTransport({host:'dns://1.1.1.1/sui-mainnet-grpc.gateway.tatum.io:443',channelCredentials:ChannelCredentials.createSsl()});
const auth=o=>({...o,meta:{...o?.meta,'x-api-key':TATUM_API_KEY},timeout:60000});
const tatumTransport={
 mergeOptions:o=>auth(native.mergeOptions(o)),
 unary:(m,i,o)=>native.unary(m,i,auth(o)),
 serverStreaming:(m,i,o)=>native.serverStreaming(m,i,auth(o)),
 clientStreaming:(m,o)=>native.clientStreaming(m,auth(o)),
 duplex:(m,o)=>native.duplex(m,auth(o))
};
const tatum=new SuiGrpcClient({network:'mainnet',transport:tatumTransport});
async function findRoute(from,target,amount,excludePools){
 const route=await aggregator.findRouters({from,target,amount,byAmountIn:true,splitCount:1,
  excludePools:[...new Set(excludePools)],slippage:QUOTE_SLIPPAGE});
 if(!route?.quoteID||!route.paths?.length||route.error)throw new Error('No route '+from+' -> '+target+': '+JSON.stringify(route?.error||route));
 return route;
}
const tx=new Transaction();tx.setSender(SENDER);tx.setGasPrice(333);tx.setGasBudget(100000000);
const [borrowedSui,flashLoanReceipt]=tx.moveCall({target:DEEPBOOK+'::pool::borrow_flashloan_base',
 typeArguments:[SUI,SUI_USDE],arguments:[tx.sharedObjectRef({objectId:LOAN_POOL,initialSharedVersion:LOAN_POOL_ISV,mutable:true}),tx.pure.u64(PRINCIPAL)]});
const borrowedValue=tx.moveCall({target:'0x2::coin::value',typeArguments:[SUI],arguments:[borrowedSui]});
const [tradeInput]=tx.splitCoins(borrowedSui,[tx.pure.u64(TRADE_SIZE)]);
const reserveValue=tx.moveCall({target:'0x2::coin::value',typeArguments:[SUI],arguments:[borrowedSui]});
const inputValue=tx.moveCall({target:'0x2::coin::value',typeArguments:[SUI],arguments:[tradeInput]});
const reserveMist=PRINCIPAL-TRADE_SIZE;
const route1=await findRoute(SUI,USDSUI,TRADE_SIZE,ORIGINAL_SWAP_POOLS);
const usdsuiCoin=await aggregator.routerSwap({router:route1,inputCoin:tradeInput,slippage:SWAP_SLIPPAGE,txb:tx});
const usdsuiValue=tx.moveCall({target:'0x2::coin::value',typeArguments:[USDSUI],arguments:[usdsuiCoin]});
const pools1=route1.paths.map(p=>p.id);
const route2=await findRoute(USDSUI,USDC,route1.amountOut,[...ORIGINAL_SWAP_POOLS,LOAN_POOL,...pools1]);
const usdcCoin=await aggregator.routerSwap({router:route2,inputCoin:usdsuiCoin,slippage:SWAP_SLIPPAGE,txb:tx});
const usdcValue=tx.moveCall({target:'0x2::coin::value',typeArguments:[USDC],arguments:[usdcCoin]});
const pools2=route2.paths.map(p=>p.id);
const route3=await findRoute(USDC,SUI,route2.amountOut,[...ORIGINAL_SWAP_POOLS,LOAN_POOL,...pools1,...pools2]);
const returnedSui=await aggregator.routerSwap({router:route3,inputCoin:usdcCoin,slippage:SWAP_SLIPPAGE,txb:tx});
const returnedSuiValue=tx.moveCall({target:'0x2::coin::value',typeArguments:[SUI],arguments:[returnedSui]});
const pools3=route3.paths.map(p=>p.id);
tx.mergeCoins(borrowedSui,[returnedSui]);
const beforeRepayment=tx.moveCall({target:'0x2::coin::value',typeArguments:[SUI],arguments:[borrowedSui]});
const [repaymentCoin]=tx.splitCoins(borrowedSui,[tx.pure.u64(PRINCIPAL)]);
const repaymentValue=tx.moveCall({target:'0x2::coin::value',typeArguments:[SUI],arguments:[repaymentCoin]});
const remainderValue=tx.moveCall({target:'0x2::coin::value',typeArguments:[SUI],arguments:[borrowedSui]});
tx.moveCall({target:DEEPBOOK+'::pool::return_flashloan_base',typeArguments:[SUI,SUI_USDE],
 arguments:[tx.sharedObjectRef({objectId:LOAN_POOL,initialSharedVersion:LOAN_POOL_ISV,mutable:true}),repaymentCoin,flashLoanReceipt]});
tx.moveCall({target:'0x2::coin::send_funds',typeArguments:[SUI],arguments:[borrowedSui,tx.pure.address(SENDER)]});

const data=tx.getData();
const ref=x=>x?.Input!==undefined?'I'+x.Input:x?.Result!==undefined?'R'+x.Result:x?.NestedResult?'N'+x.NestedResult.join(':'):JSON.stringify(x);
const commandMap=data.commands.map((c,i)=>{
 const kind=Object.keys(c)[0];
 if(c.MoveCall)return {i,kind,target:c.MoveCall.package+'::'+c.MoveCall.module+'::'+c.MoveCall.function,
  types:c.MoveCall.typeArguments,args:c.MoveCall.arguments.map(ref)};
 if(c.SplitCoins)return {i,kind,coin:ref(c.SplitCoins.coin),amounts:c.SplitCoins.amounts.map(ref)};
 if(c.MergeCoins)return {i,kind,destination:ref(c.MergeCoins.destination),sources:c.MergeCoins.sources.map(ref)};
 if(c.TransferObjects)return {i,kind,objects:c.TransferObjects.objects.map(ref),address:ref(c.TransferObjects.address)};
 return {i,kind};
});
const walletObjectInputs=data.inputs.filter(x=>x.Object?.ImmOrOwnedObject||x.Object?.Receiving);
if(walletObjectInputs.length)throw new Error('Wallet-owned object input detected in swap/repayment PTB; refusing Tatum simulation.');
const result=await tatum.simulateTransaction({transaction:tx,
 include:{effects:true,transaction:true,bcs:true,commandResults:true,balanceChanges:true},doGasSelection:false});
const body=result.Transaction||result.FailedTransaction||{};
const error=body.status?.error?.message??body.status?.error??null;
const decode=r=>{
 const b=Buffer.from(result.commandResults?.[r?.Result]?.returnValues?.[0]?.bcs||[]);
 return b.length===8?b.readBigUInt64LE(0).toString():null;
};
const actualBorrowed=decode(borrowedValue),actualReserve=decode(reserveValue),actualInput=decode(inputValue);
const actualUsdsui=decode(usdsuiValue),actualUsdc=decode(usdcValue),actualSui=decode(returnedSuiValue);
const before=decode(beforeRepayment),actualRepay=decode(repaymentValue),actualRemainder=decode(remainderValue);
const simSuccess=result.$kind==='Transaction'&&body.status?.success===true;
const gasChanges=result.balanceChanges||body.balanceChanges||[];
const gasChange=gasChanges.find(x=>x.coinType?.endsWith('::sui::SUI')&&x.address?.toLowerCase()===SENDER.toLowerCase());
const gasCost=gasChange&&BigInt(gasChange.amount)<0n?-BigInt(gasChange.amount):0n;
const routePools=[...pools1,...pools2,...pools3];
const report={
 schema:'casewake-full-flashloan-tatum-simulation/v1',originalDigest:saved.digest,network:'sui-mainnet',
 provider:'Tatum Sui Mainnet gRPC TransactionExecutionService.SimulateTransaction',
 sender:SENDER,inputs:{principalMist:PRINCIPAL.toString(),tradeSizeMist:TRADE_SIZE.toString(),
  reserveMist:reserveMist.toString(),quoteSlippage:QUOTE_SLIPPAGE,swapSlippage:SWAP_SLIPPAGE,gasBudget:100000000,gasPrice:333},
 routes:{suiToUsdsui:{quoteId:route1.quoteID,amountIn:route1.amountIn.toString(),amountOut:route1.amountOut.toString(),paths:route1.paths.map(p=>({id:p.id,provider:p.provider,from:p.from,target:p.target,amountIn:String(p.amountIn),amountOut:String(p.amountOut)}))},
  usdsuiToUsdc:{quoteId:route2.quoteID,amountIn:route2.amountIn.toString(),amountOut:route2.amountOut.toString(),paths:route2.paths.map(p=>({id:p.id,provider:p.provider,from:p.from,target:p.target,amountIn:String(p.amountIn),amountOut:String(p.amountOut)}))},
  usdcToSui:{quoteId:route3.quoteID,amountIn:route3.amountIn.toString(),amountOut:route3.amountOut.toString(),paths:route3.paths.map(p=>({id:p.id,provider:p.provider,from:p.from,target:p.target,amountIn:String(p.amountIn),amountOut:String(p.amountOut)}))}},
 poolIsolation:{loanPoolId:LOAN_POOL,loanPoolUseCount:routePools.filter(x=>x===LOAN_POOL).length,
  originalSwapPoolReuse:routePools.filter(x=>ORIGINAL_SWAP_POOLS.includes(x)),
  duplicatePools:routePools.filter((x,i)=>routePools.indexOf(x)!==i)},
 transaction:{outcome:result.$kind,success:simSuccess,error,commandMap,commandResultsCount:result.commandResults?.length??0,
  commandResults:(result.commandResults||[]).map((x,i)=>({index:i,values:(x.returnValues||[]).map(v=>({type:v.type||null,bcsLength:v.bcs?.length||0}))})),
  actualBorrowedSuiMist:actualBorrowed,actualReserveAfterSplitMist:actualReserve,actualSwapInputMist:actualInput,
  actualUsdsuiMist:actualUsdsui,actualUsdcMist:actualUsdc,actualReturnedSuiMist:actualSui,
  totalBeforeRepaymentMist:before,actualRepaymentCoinMist:actualRepay,remainingSuiMist:actualRemainder,
  gasCostMist:gasCost.toString(),gasPaymentMocked:result.gasPaymentMocked??null,
  status:body.status||null},
 safety:{signed:false,onchainExecuted:false,walletOwnedSwapInputs:false,walletFundedRepayment:false,
  gasPaymentMocked:result.gasPaymentMocked??null,humanApproved:false,walrusWritten:false,gate1Eligible:false},
 limitations:['Independent Tatum full-PTB simulation only; compare with the official Sui Mainnet gRPC simulation.',
  'This transaction is not signed or submitted.','A successful simulation does not authorize human approval or Walrus write.'],
 generatedAt:new Date().toISOString()
};
const out=path.join(ROOT,'evidence','flashloan-tatum-simulation.json');
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('TATUM_FULL_FLASHLOAN_SIMULATION',JSON.stringify({success:simSuccess,error,
 commandCount:commandMap.length,actualReturnedSuiMist:actualSui,totalBeforeRepaymentMist:before,
 actualRepaymentCoinMist:actualRepay,remainingSuiMist:actualRemainder,gasCostMist:gasCost.toString(),file:out}));
