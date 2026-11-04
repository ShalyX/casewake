// Authenticated, read-only Tatum Sui Mainnet transaction context.
import fs from 'node:fs';
import path from 'node:path';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';
const env=Object.fromEntries(fs.readFileSync(path.resolve(import.meta.dirname,'..','.env.local'),'utf8').split(/\r?\n/).filter(s=>/^[A-Z_]+=.*/.test(s)).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]}));
const c=new SuiGrpcClient({network:'mainnet',transport:new GrpcTransport({host:'sui-mainnet-grpc.gateway.tatum.io:443',channelCredentials:ChannelCredentials.createSsl()})});
const opts={meta:{'x-api-key':env.TATUM_API_KEY},timeout:16000};
const ds=process.argv.slice(2);if(ds.length===0)ds.push('XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue','BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6');
for(const digest of ds){
  try {
    const {response}=await c.ledgerService.getTransaction({digest,readMask:{paths:['digest','transaction','effects','checkpoint','timestamp']}},opts);
    const x=response.transaction;
    const t=x?.transaction;
    const result={digest:x?.digest,txKeys:Object.keys(t||{}),executedKeys:Object.keys(x||{}),transactionData:t||{},success:x?.effects?.status?.success,error:x?.effects?.status?.error?.description,checkpoint:x?.checkpoint};
    const f=path.resolve(import.meta.dirname,'..','..','evidence','context-'+digest.slice(0,12)+'.json');
    fs.writeFileSync(f,JSON.stringify(result,(_k,v)=>typeof v==='bigint' ? v.toString() : v,2));
    console.log('TX_CONTEXT',JSON.stringify({digest:result.digest,success:result.success,error:result.error,txKeys:result.txKeys,checkpoint:String(result.checkpoint||''),output:f}).slice(0,900));
  } catch(e){console.log('TX_CONTEXT_ERROR',digest,e?.code||e?.name);}
}
