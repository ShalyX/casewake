// Read-only incident discovery. No signing, execution, or Walrus writes.
import fs from 'node:fs';
import path from 'node:path';
import { SuiGrpcClient, GrpcTypes } from '@mysten/sui/grpc';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';
const envFile = process.env.CASEWAKE_ENV_FILE;
if (!envFile) throw new Error('Set CASEWAKE_ENV_FILE to the existing local server environment file.');
const env = Object.fromEntries(fs.readFileSync(envFile,'utf8').split(/\r?\n/).filter(x=>/^[A-Z_]+=/.test(x)).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]}));
const client = new SuiGrpcClient({network:'mainnet',transport:new GrpcTransport({host:'dns://1.1.1.1/sui-mainnet-grpc.gateway.tatum.io:443',channelCredentials:ChannelCredentials.createSsl()})});
const opts={meta:{'x-api-key':env.TATUM_API_KEY},timeout:45000};
const mask={paths:['digest','transaction','effects','checkpoint','timestamp','events']};
const outputDir=path.resolve(import.meta.dirname,'../../evidence/real-case');
fs.mkdirSync(outputDir,{recursive:true});
const stringify=x=>JSON.stringify(x,(_k,v)=>typeof v==='bigint'?v.toString():v instanceof Uint8Array?{base64:Buffer.from(v).toString('base64')}:v,2);
const save=(name,x)=>fs.writeFileSync(path.join(outputDir,name),stringify(x)+'\n');
function summary(tx){
 const t=tx.transaction||{},p=t.kind?.data?.programmableTransaction||{};
 const cs=(p.commands||[]).map(x=>x.command||{});
 return {digest:tx.digest,success:tx.effects?.status?.success,error:tx.effects?.status?.error?.description||'',sender:t.sender,checkpoint:String(tx.checkpoint??''),timestamp:tx.timestamp,gas:t.gasPayment,commands:cs.map(c=>c.oneofKind),calls:cs.filter(c=>c.moveCall).map(c=>c.moveCall.package+'::'+c.moveCall.module+'::'+c.moveCall.function)};
}
const [mode,...args]=process.argv.slice(2);
if(mode==='get'){
 for(const digest of args)try{const {transaction}=await client.ledgerService.getTransaction({digest,readMask:mask},opts).response;save(digest+'.json',transaction);console.log(stringify(summary(transaction)));}catch(e){console.log('LOOKUP',digest,e.code||e.name);}
}else if(mode==='scan'||mode==='sender'||mode==='calls'){
 const limit=Math.min(3000,Number(mode==='calls'?args[3]||500:mode==='scan'?args[0]||500:args[2]||100));
 const query={readMask:mask,options:{ordering:mode==='sender'?GrpcTypes.Ordering.ASCENDING:GrpcTypes.Ordering.DESCENDING,limit}};
 if(mode==='sender'){query.startCheckpoint=args[1];query.filter={terms:[{literals:[{negated:false,predicate:{oneofKind:'sender',sender:{address:args[0]}}}]}]};}
 if(mode==='calls'){query.options.ordering=GrpcTypes.Ordering.DESCENDING; query.filter={terms:[{literals:[{negated:false,predicate:{oneofKind:'moveCall',moveCall:{function:'0x'+args[0].replace(/^0x/,'').padStart(64,'0')+'::'+args[1]+'::'+args[2]}}}]}]};}
 const rows=[];let count=0;
 try{for await(const frame of client.ledgerService.listTransactions(query,opts).responses){
  if(!frame.transaction?.digest)continue;
  const tx=frame.transaction;count++;const row=summary(tx);
  if(mode==='sender'||(row.success===false&&!row.calls.some(c=>/swap|flash|arbitrage/i.test(c)))){rows.push(row);save(tx.digest+'.json',tx);console.log(JSON.stringify({digest:row.digest,error:row.error,sender:row.sender,commands:row.commands.length}));}
  if(count>=limit)break;
 }}catch(e){console.log('SCAN_ERROR',e.code||e.name);}
 save(mode+'-index.json',{checkedAt:new Date().toISOString(),count,rows});console.log('SCANNED',count,'CANDIDATES',rows.length);
}else throw new Error('Use get DIGEST..., scan LIMIT, or sender ADDRESS CHECKPOINT LIMIT');
