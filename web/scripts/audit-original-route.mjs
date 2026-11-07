// Read-only reconstruction of the exact historical DeepBook flashloan PTB.
// Resolves original Move signatures and shared-object identities from Sui Mainnet.
// Does not quote, simulate, sign, submit, or write Walrus.
import fs from 'node:fs';
import path from 'node:path';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';

const ROOT=path.resolve(import.meta.dirname,'../..');
const sourcePath=path.join(ROOT,'evidence','context-BbRZD7YfTiiN.json');
const saved=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
const pt=saved.transactionData?.kind?.data?.programmableTransaction;
if(!pt?.commands?.length||!pt?.inputs?.length)throw new Error('Original BCS evidence is incomplete.');
const asBigIntLE=bytes=>bytes.reduce((n,b,i)=>n+(BigInt(b)<<(8n*BigInt(i))),0n);
const inputs=pt.inputs.map((input,index)=>{
  if(input.kind===3)return {index,kind:'object',objectId:input.objectId,version:input.version??null,mutable:input.mutable??null};
  const bytes=input.pure?.data||[];
  return {index,kind:'pure',byteLength:bytes.length,hex:bytes.map(x=>x.toString(16).padStart(2,'0')).join(''),
    ...(bytes.length===8?{u64LE:asBigIntLE(bytes).toString()}:{}),
    ...(bytes.length===16?{u128LE:asBigIntLE(bytes).toString()}:{}),
    ...(bytes.length===1?{u8:bytes[0],bool:bytes[0]===0?false:bytes[0]===1?true:null}:{})};
});
const commands=pt.commands.map((entry,index)=>{
  const kind=entry.command?.oneofKind;
  const body=entry.command?.[kind]||{};
  const mapArg=a=>{
    if(!a||typeof a!=='object')return {source:'unknown',raw:a??null};
    if(a.kind===2)return {source:'input',index:a.input,input:inputs[a.input]||null};
    if(a.kind===3)return {source:'result',command:a.result,subresult:a.subresult??0};
    return {source:'other',...a};
  };
  if(kind==='moveCall')return {index,kind,target:body.package+'::'+body.module+'::'+body.function,
    packageId:body.package,module:body.module,function:body.function,typeArguments:body.typeArguments||[],
    arguments:(body.arguments||[]).map(mapArg)};
  if(kind==='mergeCoins')return {index,kind,destination:mapArg(body.destination),sources:(body.sources||[]).map(mapArg)};
  if(kind==='splitCoins')return {index,kind,coin:mapArg(body.coin),amounts:(body.amounts||[]).map(mapArg)};
  if(kind==='makeMoveVector')return {index,kind,elements:(body.elements||[]).map(mapArg)};
  return {index,kind,body};
});
const uniqueMoves=[...new Map(commands.filter(c=>c.kind==='moveCall').map(c=>[c.target,c])).values()];
const transport=new GrpcTransport({host:'dns://8.8.8.8/fullnode.mainnet.sui.io:443',channelCredentials:ChannelCredentials.createSsl()});
const client=new SuiGrpcClient({network:'mainnet',transport});
const signatures=[];
for(const call of uniqueMoves){
  try{
    const response=await client.getMoveFunction({packageId:call.packageId,moduleName:call.module,name:call.function});
    signatures.push({target:call.target,available:true,function:response.function});
  }catch(error){
    signatures.push({target:call.target,available:false,error:String(error?.message||error).slice(0,500)});
  }
}
const objectIds=[...new Set(inputs.filter(x=>x.kind==='object').map(x=>x.objectId))];
const objects=[];
for(const objectId of objectIds){
  try{
    const response=await client.getObject({objectId,include:{type:true,owner:true,content:true}});
    const object=response.object||response;
    objects.push({objectId,available:true,type:object.type??null,owner:object.owner??null,
      version:object.version??null,content:object.content??null});
  }catch(error){objects.push({objectId,available:false,error:String(error?.message||error).slice(0,300)});}
}
const report={
 schema:'casewake-original-flashloan-ptb-audit/v1',
 purpose:'Resolve exact original Mainnet PTB Move signatures, object references and result handoffs before modifying the historical route.',
 digest:saved.digest,network:'sui-mainnet',checkpoint:saved.checkpoint,originalOutcome:saved.success?'success':'failed',
 originalError:saved.error,sender:saved.transactionData.sender,
 flashloanPrincipalMist:inputs[1]?.u64LE??null,gasPayment:saved.transactionData.gasPayment,
 inputs,commands,signatures,objects,
 routeSummary:[
  {step:1,protocol:'DeepBook',function:'borrow_flashloan_base',from:'SUI flashloan pool',to:'borrowed SUI + FlashLoan receipt'},
  {step:2,protocol:'router package 0xa5a0…',function:'swap_b_a_with_return_',from:'SUI',to:'USDSUI plus any returned SUI'},
  {step:3,protocol:'Bluefin CLMM',function:'pool::swap',from:'USDSUI balance',to:'USDC balance plus any USDSUI remainder'},
  {step:4,protocol:'DeepBook',function:'swap_exact_quote_for_base',from:'USDC',to:'SUI base output + USDC remainder + DEEP remainder'},
  {step:5,protocol:'PTB coin accounting',function:'mergeCoins → splitCoins',from:'all returned SUI coins',to:'exact principal repayment coin'},
  {step:6,protocol:'DeepBook',function:'return_flashloan_base',from:'repayment coin + FlashLoan receipt',to:'flashloan repaid'}
 ],
 limitations:[
  'This audit reads public Mainnet package/object state and the committed original PTB; it does not simulate execution.',
  'A current object state does not reconstruct historical liquidity at the transaction checkpoint.',
  'No route economics, repaired transaction, human approval or Walrus resolution is claimed.'
 ],
 generatedAt:new Date().toISOString()
};
const out=path.join(ROOT,'evidence','original-route-ptb-audit.json');
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('ORIGINAL_ROUTE_AUDIT',JSON.stringify({digest:report.digest,principalMist:report.flashloanPrincipalMist,
 commandCount:commands.length,objectCount:objects.length,moveFunctions:signatures.map(x=>({target:x.target,available:x.available})),
 auditFile:out}));
