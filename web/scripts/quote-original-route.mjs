// Exact, read-only per-hop quote reconstruction of the original Casewake route.
// Uses the live Turbos, Bluefin and DeepBook on-chain quote functions.
// No wallet coins, signing, transaction submission, or Walrus write.
import fs from 'node:fs';
import path from 'node:path';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';

const ROOT=path.resolve(import.meta.dirname,'../..');
const saved=JSON.parse(fs.readFileSync(path.join(ROOT,'evidence','context-BbRZD7YfTiiN.json'),'utf8'));
const SENDER=saved.transactionData.sender;
const PRINCIPAL=BigInt('65265188650');
const SUI='0x2::sui::SUI';
const USDSUI='0x44f838219cf67b058f3b37907b655f226153c18e33dfcd0da559a844fea9b1c1::usdsui::USDSUI';
const USDC='0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';
const FEE='0x38a236095cb5a4fec3bdf42cf3e9c80f7ef68f1a835290a6cd107f156f8747f4::fee1500bps::FEE1500BPS';
const DEEPBOOK='0x0e735f8c93a95722efd73521aca7a7652c0bb71ed1daf41b26dfd7d1ff71f748';
const TURBOS_LATEST='0xa5a0c25c79e428eba04fb98b3fb2a34db45ab26d4c8faf0d7e39d66a63891e64';
const BLUEFIN_LATEST='0xd075338d105482f1527cbfd363d6413558f184dec36d9138a70261e87f486e9c';
const TURBOS_POOL='0x835effa94dba86cf354ced62e33ce59ce6754cd0e57e7ee84a6ede2f7d7f8056';
const TURBOS_POOL_ISV='812864564';
const TURBOS_VERSIONED='0xf1cf0e81048df168ebeb1b8030fad24b3e0b53ae827c25053fff0779c1445b6f';
const TURBOS_VERSIONED_ISV='1621135';
const BLUEFIN_POOL='0x3fe620cd2b94ed7bc333f46e984cdea6cf42cfd9ddd54f15016d61c2f8149a90';
const BLUEFIN_POOL_ISV='808468881';
const DEEPBOOK_POOL='0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407';
const DEEPBOOK_POOL_ISV='389750322';
const CLOCK='0x6';
const CLOCK_ISV='1';
const TURBOS_MAX_SQRT=79226673515401279992447579055n; // exact original PTB input[4]
const BLUEFIN_SQRT_LIMIT=4295048017n; // exact original PTB input[12]
const transport=new GrpcTransport({host:'dns://8.8.8.8/fullnode.mainnet.sui.io:443',channelCredentials:ChannelCredentials.createSsl()});
const client=new SuiGrpcClient({network:'mainnet',transport});

function decodeLE(bytes){
 const b=Buffer.from(bytes||[]);
 let n=0n;for(let i=b.length-1;i>=0;i--)n=(n<<8n)|BigInt(b[i]);
 return n;
}
function resultValues(sim,index=0){
 const command=sim.commandResults?.[index];
 if(!command)throw new Error('No commandResults for quote call '+index+': '+JSON.stringify({kind:sim.$kind,error:sim.FailedTransaction?.status?.error||sim.Transaction?.status?.error}));
 return (command.returnValues||[]).map(v=>({type:v.type??null,bcsHex:Buffer.from(v.bcs||[]).toString('hex'),valueMist:decodeLE(v.bcs).toString()}));
}
async function runView(label,build,decode){
 const tx=new Transaction();tx.setSender(SENDER);tx.setGasBudget(50000000);
 build(tx);
 const sim=await client.simulateTransaction({transaction:tx,include:{effects:true,transaction:true,commandResults:true,balanceChanges:true},doGasSelection:false});
 const status=sim.Transaction?.status||sim.FailedTransaction?.status||{};
 if(sim.$kind!=='Transaction'||status.success!==true)throw new Error(label+' view simulation failed: '+JSON.stringify(status.error||status));
 return {label,commandResultCount:sim.commandResults?.length??0,decoded:decode(sim),gasUsed:sim.Transaction?.effects?.gasUsed??null};
}

// Hop 1 exactly mirrors command 3: SUI (type B) -> USDSUI (type A), exact input,
// full borrowed principal, B->A, same max sqrt-price limit and versioned object.
const hop1=await runView('turbos-sui-to-usdsui',tx=>{
 const pool=tx.sharedObjectRef({objectId:TURBOS_POOL,initialSharedVersion:TURBOS_POOL_ISV,mutable:true});
 const clock=tx.sharedObjectRef({objectId:CLOCK,initialSharedVersion:CLOCK_ISV,mutable:false});
 const versioned=tx.sharedObjectRef({objectId:TURBOS_VERSIONED,initialSharedVersion:TURBOS_VERSIONED_ISV,mutable:false});
 tx.moveCall({target:TURBOS_LATEST+'::pool_fetcher::compute_swap_result',typeArguments:[USDSUI,SUI,FEE],
  arguments:[pool,tx.pure.bool(false),tx.pure.u128(PRINCIPAL),tx.pure.bool(true),tx.pure.u128(TURBOS_MAX_SQRT),clock,versioned]});
},sim=>{
 const b=Buffer.from(sim.commandResults[0].returnValues[0].bcs||[]);
 if(b.length<64)throw new Error('Unexpected Turbos ComputeSwapState BCS length '+b.length);
 return {amountSpecifiedRemainingSuiMist:decodeLE(b.subarray(32,48)).toString(),
  amountCalculatedUsdsuiMist:decodeLE(b.subarray(48,64)).toString(),
  rawReturnHex:b.toString('hex')};
});
const usdsuiIn=BigInt(hop1.decoded.amountCalculatedUsdsuiMist);
const turbosSuiRemainder=BigInt(hop1.decoded.amountSpecifiedRemainingSuiMist);

// Hop 2 exactly mirrors command 7: USDSUI (A) -> USDC (B), exact input,
// a2b=true, same min sqrt-price limit as the original PTB.
const hop2=await runView('bluefin-usdsui-to-usdc',tx=>{
 const pool=tx.sharedObjectRef({objectId:BLUEFIN_POOL,initialSharedVersion:BLUEFIN_POOL_ISV,mutable:false});
 tx.moveCall({target:BLUEFIN_LATEST+'::pool::calculate_swap_results',typeArguments:[USDSUI,USDC],
  arguments:[pool,tx.pure.bool(true),tx.pure.bool(true),tx.pure.u64(usdsuiIn),tx.pure.u128(BLUEFIN_SQRT_LIMIT)]});
},sim=>{
 const b=Buffer.from(sim.commandResults[0].returnValues[0].bcs||[]);
 if(b.length<26)throw new Error('Unexpected Bluefin SwapResult BCS length '+b.length);
 return {amountSpecifiedUsdsuiMist:decodeLE(b.subarray(2,10)).toString(),
  amountSpecifiedRemainingUsdsuiMist:decodeLE(b.subarray(10,18)).toString(),
  amountCalculatedUsdcMist:decodeLE(b.subarray(18,26)).toString(),rawReturnHex:b.toString('hex')};
});
const usdcIn=BigInt(hop2.decoded.amountCalculatedUsdcMist);

// Hop 3 exactly mirrors command 12 with a zero DEEP coin: use DeepBook's
// input-token-fee quote, SUI base output against the quoted USDC input.
const hop3=await runView('deepbook-usdc-to-sui',tx=>{
 const pool=tx.sharedObjectRef({objectId:DEEPBOOK_POOL,initialSharedVersion:DEEPBOOK_POOL_ISV,mutable:false});
 const clock=tx.sharedObjectRef({objectId:CLOCK,initialSharedVersion:CLOCK_ISV,mutable:false});
 tx.moveCall({target:DEEPBOOK+'::pool::get_base_quantity_out_input_fee',typeArguments:[SUI,USDC],
  arguments:[pool,tx.pure.u64(usdcIn),clock]});
},sim=>resultValues(sim,0).map(x=>x.valueMist));
const deepbookSuiOut=BigInt(hop3.decoded[0]);
const deepbookUsdcRemainder=BigInt(hop3.decoded[1]);
const deepbookDeepFee=BigInt(hop3.decoded[2]);
const totalSuiForRepayment=turbosSuiRemainder+deepbookSuiOut;
const shortfall=PRINCIPAL>totalSuiForRepayment?PRINCIPAL-totalSuiForRepayment:0n;
const surplus=totalSuiForRepayment>PRINCIPAL?totalSuiForRepayment-PRINCIPAL:0n;
const report={
 schema:'casewake-original-route-live-quote/v1',
 originalDigest:saved.digest,network:'sui-mainnet',source:'Sui Mainnet gRPC simulateTransaction view calls',
 principalMist:PRINCIPAL.toString(),
 exactOriginalParameters:{turbosDirection:'B->A (SUI->USDSUI)',turbosByAmountIn:true,turbosSqrtPriceLimit:TURBOS_MAX_SQRT.toString(),
  bluefinDirection:'A->B (USDSUI->USDC)',bluefinByAmountIn:true,bluefinSqrtPriceLimit:BLUEFIN_SQRT_LIMIT.toString(),
  deepbookDirection:'quote USDC -> base SUI',deepbookFeeMode:'input token (original PTB supplies zero DEEP coin)',deepbookMinBaseOutMist:'0'},
 hops:[{...hop1,inputSuiMist:PRINCIPAL.toString()},
  {...hop2,inputUsdsuiMist:usdsuiIn.toString()},
  {...hop3,inputUsdcMist:usdcIn.toString()}],
  handoffs:{turbosSuiRemainderMist:turbosSuiRemainder.toString(),bluefinUsdsuiRemainderMist:hop2.decoded.amountSpecifiedRemainingUsdsuiMist,
   deepbookUsdcRemainderMist:deepbookUsdcRemainder.toString(),deepbookDeepFeeMist:deepbookDeepFee.toString(),
   deepbookSuiOutputMist:deepbookSuiOut.toString()},
  repayment:{availableSuiMist:totalSuiForRepayment.toString(),requiredPrincipalMist:PRINCIPAL.toString(),
   shortfallMist:shortfall.toString(),surplusMist:surplus.toString()},
  safety:{signed:false,onchainExecuted:false,walletFunded:false,walrusWritten:false,gate1Eligible:false},
 limitations:['These are live independent view quotes, not a full PTB simulation.','Pool states can move between quotes and full transaction execution.','A successful quote does not satisfy Gate 1; full Tatum and independent transaction simulations are still required.'],
 generatedAt:new Date().toISOString()
};
const out=path.join(ROOT,'evidence','original-route-live-quotes.json');
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('ORIGINAL_ROUTE_LIVE_QUOTES',JSON.stringify({digest:report.originalDigest,hop1:report.hops[0].decoded,hop2:report.hops[1].decoded,hop3:report.hops[2].decoded,repayment:report.repayment,file:out}));
