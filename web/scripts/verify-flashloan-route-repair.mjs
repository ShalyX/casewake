/**
 * Read-only atomic repair replay for the genuine 65.265188650 SUI DeepBook flashloan.
 * The principal stays unchanged. Real Cetus-aggregated swaps use only a split
 * of the borrowed SUI, with the unused amount reserved for exact repayment.
 * Never sends a transaction or spends a wallet coin to fund the swaps.
 */
import fs from 'node:fs';
import path from 'node:path';
import {AggregatorClient,Env} from '@cetusprotocol/aggregator-sdk';
import {SuiGrpcClient} from '@mysten/sui/grpc';
import {Transaction} from '@mysten/sui/transactions';
import {GrpcTransport} from '@protobuf-ts/grpc-transport';
import {ChannelCredentials} from '@grpc/grpc-js';
const S='0x2::sui::SUI',C='0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';
const SU='0x41d587e5336f1c86cad50d38a7136db99333bb9bda91cea4ba69115defeb1402::sui_usde::SUI_USDE';
const sender='0x457d5ecda9f125053adf94fe357549e11e6fa688679cf94ababb5793ed3916ce';
const pool='0x034f3a42e7348de2084406db7a725f9d9d132a56c68324713e6e623601fb4fd7';
const DB='0x0e735f8c93a95722efd73521aca7a7652c0bb71ed1daf41b26dfd7d1ff71f748';
const PRINCIPAL=65265188650n, SWAP_SIZE=BigInt(process.env.SWAP_SIZE_MIST||'2500000000');
const ZERO=0n;
if(SWAP_SIZE<=ZERO||SWAP_SIZE>=PRINCIPAL)throw Error('Swap size must be >0 and below the exact historical principal');
const client=new SuiGrpcClient({network:'mainnet',baseUrl:'https://fullnode.mainnet.sui.io:443'});
const ag=new AggregatorClient({env:Env.Mainnet,signer:sender,client});
const forward=await ag.findRouters({from:S,target:C,amount:SWAP_SIZE,byAmountIn:true,slippage:0.005});
if(!forward?.quoteID||!forward.paths?.length||BigInt(forward.amountOut.toString())<=ZERO)throw Error('No fresh SUI -> USDC route');
const back=await ag.findRouters({from:C,target:S,amount:BigInt(forward.amountOut.toString()),byAmountIn:true,slippage:0.005});
if(!back?.quoteID||!back.paths?.length||BigInt(back.amountOut.toString())<=ZERO)throw Error('No fresh USDC -> SUI route');
const quotedNet=BigInt(back.amountOut.toString())-SWAP_SIZE;
const tx=new Transaction();tx.setSender(sender);tx.setGasBudget(50000000);
const sh=()=>tx.sharedObjectRef({objectId:pool,initialSharedVersion:773317532,mutable:true});
const [borrowed,receipt]=tx.moveCall({target:DB+'::pool::borrow_flashloan_base',
 typeArguments:[S,SU],arguments:[sh(),tx.pure.u64(PRINCIPAL)]});
const borrowedAmount=tx.moveCall({target:'0x2::coin::value',typeArguments:[S],arguments:[borrowed]});
const [swapInput]=tx.splitCoins(borrowed,[tx.pure.u64(SWAP_SIZE)]);
const afterSplit=tx.moveCall({target:'0x2::coin::value',typeArguments:[S],arguments:[borrowed]});
const usdc=await ag.routerSwap({router:forward,inputCoin:swapInput,slippage:0.005,txb:tx});
const actualUsdc=tx.moveCall({target:'0x2::coin::value',typeArguments:[C],arguments:[usdc]});
const sui=await ag.routerSwap({router:back,inputCoin:usdc,slippage:0.005,txb:tx});
const actualSui=tx.moveCall({target:'0x2::coin::value',typeArguments:[S],arguments:[sui]});
tx.mergeCoins(borrowed,[sui]);
const afterMerge=tx.moveCall({target:'0x2::coin::value',typeArguments:[S],arguments:[borrowed]});
const [repayment]=tx.splitCoins(borrowed,[tx.pure.u64(PRINCIPAL)]);
const postRepay=tx.moveCall({target:'0x2::coin::value',typeArguments:[S],arguments:[borrowed]});
tx.moveCall({target:DB+'::pool::return_flashloan_base',typeArguments:[S,SU],arguments:[sh(),repayment,receipt]});
tx.transferObjects([borrowed],sender);
const d=tx.getData();
const walletSwapFunding=d.inputs.some(x=>x.Object?.ImmOrOwnedObject||x.Object?.Receiving)||
 d.commands.some(x=>JSON.stringify(x).includes('GasCoin'));
if(walletSwapFunding)throw Error('Unacceptable: wallet-owned coin object referenced by swap commands');
const sim=await client.simulateTransaction({transaction:tx,
 include:{effects:true,transaction:true,bcs:true,commandResults:true,balanceChanges:true},doGasSelection:false});
const body=sim.Transaction||sim.FailedTransaction;
const dec=r=>{const a=Buffer.from(sim.commandResults?.[r?.Result]?.returnValues?.[0]?.bcs||[]);
 return a.length===8?a.readBigUInt64LE(0).toString():null;};
const row={
 schema:'casewake-full-flashloan-repair-simulation/v1',
 network:'sui-mainnet',originalDigest:'BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6',
 principalMist:PRINCIPAL.toString(),tradedBorrowedSuiMist:SWAP_SIZE.toString(),
 reservedBorrowedSuiMist:(PRINCIPAL-SWAP_SIZE).toString(),borrowedSuiMist:dec(borrowedAmount),
 afterSplitSuiMist:dec(afterSplit),actualUsdcMicros:dec(actualUsdc),actualReturnedSuiMist:dec(actualSui),
 beforeRepaymentSuiMist:dec(afterMerge),actualPostRepaymentSuiMist:dec(postRepay),
 repaymentMist:PRINCIPAL.toString(),quotedTradeNetMist:quotedNet.toString(),
 actualTradeNetMist:dec(actualSui)?(BigInt(dec(actualSui))-SWAP_SIZE).toString():null,
 provider:'Sui Mainnet gRPC',simulatedAt:new Date().toISOString(),
 forward:{quoteId:forward.quoteID,input:forward.amountIn.toString(),expectedOutput:forward.amountOut.toString(),paths:forward.paths.map(x=>({provider:x.provider,from:x.from,to:x.target,amountIn:x.amountIn,amountOut:x.amountOut}))},
 back:{quoteId:back.quoteID,input:back.amountIn.toString(),expectedOutput:back.amountOut.toString(),paths:back.paths.map(x=>({provider:x.provider,from:x.from,to:x.target,amountIn:x.amountIn,amountOut:x.amountOut}))},
 commandCount:d.commands.length,inputCount:d.inputs.length,
 outcome:sim.$kind,success:sim.Transaction!==undefined && body?.status?.success===true,
 error:body?.status?.error??null,gasPaymentMocked:sim.gasPaymentMocked===true,
 balanceChanges:body?.balanceChanges??[],walletSwapFunding:false,
 signed:false,onchainExecuted:false,repairQualification:'partial-profit-routing-using-exact-original-loan'
};
let bytes=null;
if(row.success){
 const simBcs=sim.Transaction?.bcs || sim.Transaction?.transaction?.bcs?.value;
 const resolved=sim.Transaction?.transaction;
 row.simulatedTransactionKeys=Object.keys(resolved||{});
 row.resolvedGasData=resolved?.gasData??null;
 if(simBcs){bytes=Uint8Array.from(simBcs);}
 else {
   try {
     const g=resolved?.gasData;
     if(g?.price)tx.setGasPrice(BigInt(g.price));
     if(g?.payment?.length)tx.setGasPayment(g.payment);
     if(g?.owner)tx.setGasOwner(g.owner);
     bytes=await tx.build({client,onlyTransactionKind:false});
   }catch(e){row.transactionBcsBuildError=String(e.message||e);}
 }
 if(bytes){row.transactionBcs=Buffer.from(bytes).toString('base64');row.transactionBcsLength=bytes.length;}
 else row.transactionBcsUnavailable=true;
 row.noExternalInputCoinObjects=d.inputs.filter(x=>x.Object?.ImmOrOwnedObject||x.Object?.Receiving).length===0;
 if(BigInt(row.actualReturnedSuiMist||'0')<SWAP_SIZE || BigInt(row.beforeRepaymentSuiMist||'0')<PRINCIPAL)
    throw Error('Simulation success contradicts claimed repay balances');
}
const out=path.resolve('../evidence/route-repair-'+SWAP_SIZE.toString()+'-mainnet.json');
fs.writeFileSync(out,JSON.stringify(row,null,2)+'\n');
if(row.success){const successPath=path.resolve('../evidence/route-repair-'+SWAP_SIZE.toString()+'-SUCCESS-mainnet.json');fs.writeFileSync(successPath,JSON.stringify(row,null,2)+'\n');console.log('SUCCESS_PROOF_SAVED',successPath);}
const log={...row};delete log.transactionBcs;
console.log('ATOMIC_FLASHLOAN_REPLAY',JSON.stringify(log));
console.log('EVIDENCE_SAVED',out);
