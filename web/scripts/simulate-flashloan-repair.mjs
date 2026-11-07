// Build and simulate the full Casewake flashloan PTB using the best
// quote-only candidate that deliberately reuses the flashloan pool AFTER borrow.
// This is a read-only simulation: no signing, submission, wallet top-up for repayment,
// human approval or Walrus write.
import fs from 'node:fs';
import path from 'node:path';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';
import { AggregatorClient, Env } from '@cetusprotocol/aggregator-sdk';

const ROOT=path.resolve(import.meta.dirname,'../..');
const saved=JSON.parse(fs.readFileSync(path.join(ROOT,'evidence','context-BbRZD7YfTiiN.json'),'utf8'));
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
const LOAN_POOL_INITIAL_SHARED_VERSION='773317532';
const ORIGINAL_SWAP_POOLS=[
 '0x835effa94dba86cf354ced62e33ce59ce6754cd0e57e7ee84a6ede2f7d7f8056',
 '0x3fe620cd2b94ed7bc333f46e984cdea6cf42cfd9ddd54f15016d61c2f8149a90',
 '0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407'
];
const transport=new GrpcTransport({host:'dns://8.8.8.8/fullnode.mainnet.sui.io:443',channelCredentials:ChannelCredentials.createSsl()});
const client=new SuiGrpcClient({network:'mainnet',transport});
const aggregator=new AggregatorClient({env:Env.Mainnet,signer:SENDER,client});

const summarizeRoute=route=>({
 quoteId:route.quoteID||null,amountInMist:route.amountIn?.toString(),amountOutMist:route.amountOut?.toString(),
 paths:(route.paths||[]).map(p=>({id:p.id,provider:p.provider,from:p.from,target:p.target,
  direction:p.direction,amountInMist:String(p.amountIn),amountOutMist:String(p.amountOut),
  feeRate:p.feeRate,extendedDetails:p.extendedDetails||null}))
});
async function findRoute(from,target,amount,excludePools){
 const route=await aggregator.findRouters({from,target,amount,byAmountIn:true,splitCount:1,
  excludePools:[...new Set(excludePools)],slippage:QUOTE_SLIPPAGE});
 if(!route?.quoteID||!route.paths?.length||route.error)throw new Error('No route '+from+' -> '+target+': '+JSON.stringify(route?.error||route));
 return route;
}
const tx=new Transaction();
tx.setSender(SENDER);
tx.setGasPrice(333);
tx.setGasBudget(100000000);

// 1. Borrow the exact historical principal from the original DeepBook pool.
const loanPoolRef=tx.sharedObjectRef({objectId:LOAN_POOL,initialSharedVersion:LOAN_POOL_INITIAL_SHARED_VERSION,mutable:true});
const [borrowedSui,flashLoanReceipt]=tx.moveCall({
 target:DEEPBOOK+'::pool::borrow_flashloan_base',typeArguments:[SUI,SUI_USDE],
 arguments:[loanPoolRef,tx.pure.u64(PRINCIPAL)]
});

// 2. Leave 0.665188650 SUI untouched as a repayment reserve.
// Only the other 64.6 SUI is supplied to the alternative swap route.
const [tradeInput]=tx.splitCoins(borrowedSui,[tx.pure.u64(TRADE_SIZE)]);
const reserveMist=PRINCIPAL-TRADE_SIZE;

// 3. Quote/build SUI -> USDSUI. The first route is allowed to use the loan
// pool, but only AFTER the flashloan command has mutated it in this PTB.
const route1=await findRoute(SUI,USDSUI,TRADE_SIZE,ORIGINAL_SWAP_POOLS);
const usdsuiCoin=await aggregator.routerSwap({router:route1,inputCoin:tradeInput,slippage:SWAP_SLIPPAGE,txb:tx});
const pools1=route1.paths.map(p=>p.id);

// 4. USDSUI -> USDC. Exclude all pools already touched by the first route,
// the loan source pool, and the three original incident swap pools.
const route2=await findRoute(USDSUI,USDC,route1.amountOut,[...ORIGINAL_SWAP_POOLS,LOAN_POOL,...pools1]);
const usdcCoin=await aggregator.routerSwap({router:route2,inputCoin:usdsuiCoin,slippage:SLIPPAGE,txb:tx});
const pools2=route2.paths.map(p=>p.id);

// 5. USDC -> SUI, again using only fresh pools.
const route3=await findRoute(USDC,SUI,route2.amountOut,[...ORIGINAL_SWAP_POOLS,LOAN_POOL,...pools1,...pools2]);
const returnedSui=await aggregator.routerSwap({router:route3,inputCoin:usdcCoin,slippage:SLIPPAGE,txb:tx});
const pools3=route3.paths.map(p=>p.id);

// 6. Merge swap output with untouched reserve, split exact principal,
// return the flashloan receipt, and send only genuine surplus to the sender.
tx.mergeCoins(borrowedSui,[returnedSui]);
const [repaymentCoin]=tx.splitCoins(borrowedSui,[tx.pure.u64(PRINCIPAL)]);
tx.moveCall({target:DEEPBOOK+'::pool::return_flashloan_base',typeArguments:[SUI,SUI_USDE],
 arguments:[tx.sharedObjectRef({objectId:LOAN_POOL,initialSharedVersion:LOAN_POOL_INITIAL_SHARED_VERSION,mutable:true}),
  repaymentCoin,flashLoanReceipt]});
tx.moveCall({target:'0x2::coin::send_funds',typeArguments:[SUI],arguments:[borrowedSui,tx.pure.address(SENDER)]});

const routePools=[...pools1,...pools2,...pools3];
const duplicatePools=routePools.filter((id,index)=>routePools.indexOf(id)!==index);
const originalSwapPoolReuse=routePools.filter(id=>ORIGINAL_SWAP_POOLS.includes(id));
const loanPoolUseCount=routePools.filter(id=>id===LOAN_POOL).length;
const commandData=tx.getData().commands;
const commandCount=commandData.length;
const commandSummary=commandData.map((command,index)=>{
 const kind=Object.keys(command||{})[0]||'unknown';
 const body=command?.[kind]||{};
 return {index,kind,target:kind==='MoveCall'?[body.package,body.module,body.function].filter(Boolean).join('::'):null,
  summary:JSON.stringify(command).slice(0,900)};
});
let simulation;
let simulationError=null;
try{
 simulation=await client.simulateTransaction({transaction:tx,
  include:{effects:true,transaction:true,commandResults:true,balanceChanges:true},doGasSelection:true});
}catch(error){simulationError=String(error?.message||error).slice(0,3000);}
const status=simulation?.Transaction?.status||simulation?.FailedTransaction?.status||null;
const simulationSuccess=simulation?.$kind==='Transaction'&&status?.success===true;
const gasUsed=simulation?.Transaction?.effects?.gasUsed||simulation?.FailedTransaction?.effects?.gasUsed||null;
const balanceChanges=simulation?.balanceChanges||simulation?.Transaction?.effects?.balanceChanges||[];
const report={
 schema:'casewake-flashloan-sequential-pool-reuse-simulation/v1',
 originalDigest:saved.digest,network:'sui-mainnet',sender:SENDER,
 strategy:'Borrow from the original DeepBook SUI/SUI_USDE pool, then use that same pool in the first swap only after the borrow command. All later swap pools are distinct from the loan pool and from previously used pools.',
 inputs:{principalMist:PRINCIPAL.toString(),tradeSizeMist:TRADE_SIZE.toString(),untouchedReserveMist:reserveMist.toString(),
  quoteSlippage:QUOTE_SLIPPAGE,swapSlippage:SWAP_SLIPPAGE,gasBudget:100000000,gasPrice:333},
 routes:{suiToUsdsui:summarizeRoute(route1),usdsuiToUsdc:summarizeRoute(route2),usdcToSui:summarizeRoute(route3)},
 poolIsolation:{loanPoolId:LOAN_POOL,loanPoolUseCount,originalSwapPoolReuse,duplicatePools,
  passed:originalSwapPoolReuse.length===0&&duplicatePools.length===0&&loanPoolUseCount>=1},
 transaction:{commandCount,commandSummary,commandResultsSummary:(simulation?.commandResults||[]).map((result,index)=>({index,returnValues:(result.returnValues||[]).map(value=>({type:value.type||null,bcsLength:value.bcs?.length||0}))})),
  flashloanBorrowCommand:0,flashloanRepaymentCommand:commandCount-2,
  simulationKind:simulation?.$kind||null,status,success:simulationSuccess,error:simulationError||
   simulation?.FailedTransaction?.status?.error||null,gasUsed,balanceChanges},
 safety:{signed:false,onchainExecuted:false,walletFundedRepayment:false,gasPaidFromWallet:true,
  humanApproved:false,walrusWritten:false,gate1Eligible:false},
 limitations:['This is an official Sui Mainnet full-PTB simulation only; Tatum and a second independent simulator are still required.',
  'The transaction is not signed or submitted.',
  'A successful simulation does not authorize human approval or Walrus memory storage.'],
 generatedAt:new Date().toISOString()
};
const out=path.join(ROOT,'evidence','flashloan-sequential-pool-simulation.json');
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('FLASHLOAN_SEQUENTIAL_POOL_SIMULATION',JSON.stringify({
 success:simulationSuccess,status,error:report.transaction.error,commandCount,gasUsed,
 routeAmounts:{usdsui:route1.amountOut.toString(),usdc:route2.amountOut.toString(),sui:route3.amountOut.toString()},
 pools:{loanPoolUseCount,originalSwapPoolReuse,duplicatePools},
 file:out
}));
