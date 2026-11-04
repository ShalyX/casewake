// Read-only investigation of follow-up transactions for known real failures.
import fs from 'node:fs';import path from 'node:path';
import { SuiGrpcClient,GrpcTypes } from '@mysten/sui/grpc';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';
const env=Object.fromEntries(fs.readFileSync(path.resolve(import.meta.dirname,'..','.env.local'),'utf8').split(/\r?\n/).filter(s=>/^[A-Z_]+=.*/.test(s)).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]}));
const c=new SuiGrpcClient({network:'mainnet',transport:new GrpcTransport({host:'sui-mainnet-grpc.gateway.tatum.io:443',channelCredentials:ChannelCredentials.createSsl()})});
const opts={meta:{'x-api-key':env.TATUM_API_KEY},timeout:20000};
const dir=path.resolve(import.meta.dirname,'..','..','evidence');
for(const file of fs.readdirSync(dir).filter(x=>x.startsWith('context-')&&x.endsWith('.json'))){
 const source=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
 const sender=source.transactionData?.sender;
 if(!sender){console.log('NO_SENDER',file);continue;}
 const failedCheckpoint=String(source.checkpoint);
 let seen=0,successes=[],failureSame=0;
 const query={
   startCheckpoint:failedCheckpoint,filter:{terms:[{literals:[{sender:{address:sender}}]}]},
   readMask:{paths:['digest','transaction','effects']},
   options:{ordering:GrpcTypes.Ordering.ASCENDING,limit:70},
 };
 try{
   const stream=c.ledgerService.listTransactions(query,opts);
   for await(const frame of stream.responses){
     const tx=frame.transaction;
     if(!tx?.digest)continue;
     seen++;
     const t=tx.transaction||{};
     const commands=t.kind?.data?.programmableTransaction?.commands||[];
     const commandSig=commands.map(x=>x.command?.oneofKind||'unknown');
     const base={digest:tx.digest,success:tx.effects?.status?.success,commands:commandSig,commandCount:commands.length};
     if(base.success===true)successes.push(base);
     if(base.success===false)failureSame++;
     if(seen>=70)break;
   }
   const dest=path.join(dir,'followups-'+source.digest.slice(0,12)+'.json');
   fs.writeFileSync(dest,JSON.stringify({sender,sourceDigest:source.digest,sourceCheckpoint:failedCheckpoint,scanned:seen,failures:failureSame,successes},null,2));
   console.log('SENDER_FOLLOWUPS',JSON.stringify({source:source.digest,seen,successes:successes.length,failures:failureSame,firstSuccesses:successes.slice(0,5).map(x=>x.digest),file:dest}).slice(0,1200));
 }catch(e){console.log('SENDER_LOOKUP_FAILED',source.digest,e?.code||e?.name)}
}
