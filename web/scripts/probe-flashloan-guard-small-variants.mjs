// Read-only Tatum Mainnet simulation of smaller borrowed-principal variants.
import fs from 'node:fs';import path from 'node:path';
import {SuiGrpcClient} from '@mysten/sui/grpc';import {Transaction} from '@mysten/sui/transactions';
import {GrpcTransport} from '@protobuf-ts/grpc-transport';import {ChannelCredentials} from '@grpc/grpc-js';
const w=path.resolve(import.meta.dirname,'..');const root=path.resolve(w,'..');
const cfg=Object.fromEntries(fs.readFileSync(path.join(w,'.env.local'),'utf8').split(/\r?\n/).filter(x=>/^[A-Z_]+=.*/.test(x)).map(x=>{const i=x.indexOf('=');return[x.slice(0,i),x.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]}));
const n=new GrpcTransport({host:'sui-mainnet-grpc.gateway.tatum.io:443',channelCredentials:ChannelCredentials.createSsl()});const a=o=>({...o,meta:{...o?.meta,'x-api-key':cfg.TATUM_API_KEY},timeout:45000});
const t={mergeOptions:o=>a(n.mergeOptions(o)),unary:(m,i,o)=>n.unary(m,i,a(o)),serverStreaming:(m,i,o)=>n.serverStreaming(m,i,a(o)),clientStreaming:(m,o)=>n.clientStreaming(m,a(o)),duplex:(m,o)=>n.duplex(m,a(o))};const client=new SuiGrpcClient({network:'mainnet',transport:t});
const saved=JSON.parse(fs.readFileSync(path.join(root,'evidence','context-BbRZD7YfTiiN.json'),'utf8'));
const original=Transaction.from(Uint8Array.from(saved.transactionData.bcs.value.data));const base=original.getData();
const originalAmount=Buffer.from(base.inputs[1].Pure.bytes,'base64').readBigUInt64LE(0);
const results=[];
for(const [i,factor] of [0.25,0.1,0.01].entries()){
 if(i)await new Promise(r=>setTimeout(r,4000));
 const amount=BigInt(Math.floor(Number(originalAmount)*factor));const data=JSON.parse(JSON.stringify(base));
 const b=Buffer.alloc(8);b.writeBigUInt64LE(amount);data.inputs[1].Pure.bytes=b.toString('base64');data.expiration=null;
 try{
  const sim=await client.simulateTransaction({transaction:Transaction.from(JSON.stringify(data)),include:{effects:true,transaction:true},doGasSelection:false});
  const body=sim.Transaction||sim.FailedTransaction||{};
  const row={digest:saved.digest,factor,amountMist:amount.toString(),outcome:sim.$kind,success:body.status?.success??null,error:body.status?.error?.message??body.status?.error??null,gasPaymentMocked:sim.gasPaymentMocked??null,checkedAt:new Date().toISOString(),signed:false,onchainExecuted:false};
  results.push(row);console.log('SMALL_VARIANT',JSON.stringify(row));
 }catch(e){const row={digest:saved.digest,factor,amountMist:amount.toString(),outcome:'error',code:e?.code||null,error:String(e?.message||e).slice(0,300),checkedAt:new Date().toISOString(),signed:false,onchainExecuted:false};results.push(row);console.log('SMALL_VARIANT',JSON.stringify(row));}
}
fs.writeFileSync(path.join(root,'evidence','flashloan-guard-small-variants.json'),JSON.stringify(results,null,2)+'\n');
