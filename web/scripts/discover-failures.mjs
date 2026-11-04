// Read-only Tatum Mainnet transaction and failure discovery. No secrets are logged.
import fs from 'node:fs';
import path from 'node:path';
import { SuiGrpcClient, GrpcTypes } from '@mysten/sui/grpc';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';

const root = path.resolve(import.meta.dirname, '..');
const env = Object.fromEntries(fs.readFileSync(path.join(root,'.env.local'),'utf8').split(/\r?\n/).filter(x=>/^[A-Z_]+=/i.test(x)).map(s=>{const i=s.indexOf('='); return [s.slice(0,i),s.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]}));
if (!env.TATUM_API_KEY) throw Error('Missing TATUM_API_KEY in server environment');
const client = new SuiGrpcClient({ network:'mainnet', transport: new GrpcTransport({host:'sui-mainnet-grpc.gateway.tatum.io:443',channelCredentials:ChannelCredentials.createSsl()})});
const opts = {meta:{'x-api-key':env.TATUM_API_KEY},timeout:18000};

function outcome(tx){
 const status=tx?.effects?.status;
 return {
   digest: tx?.digest || '',
   success: status?.success,
   errorText:status?.error?.description || '',
   code: status?.error ? Object.keys(status.error) : []
 };
}
const sourceDigest='J4NvV5iQZQFm1xKPYv9ffDCCPW6cZ4yFKsCqFUiDX5L4';
const command = process.argv[2] || 'sample';
if(command==='sample'){
 try{
  const {response}=await client.ledgerService.getTransaction({digest:sourceDigest,readMask:{paths:['digest','effects']}},opts);
  const tx=response.transaction;
  const result=outcome(tx);
  console.log('TATUM_SAMPLE_FETCH=OK');
  console.log('DIGEST='+result.digest);
  console.log('OUTCOME='+JSON.stringify({success:result.success,errorText:result.errorText,code:result.code}).slice(0,300));
  console.log('RESPONSE_FIELDS='+Object.keys(tx||{}).join(','));
 }catch(e){console.log('TATUM_SAMPLE_FETCH=FAILED'); console.log('ERROR_CLASS='+String(e?.constructor?.name||'unknown'));console.log('RPC_STATUS='+String(e?.code||'')); process.exitCode=1;}
}else if(command==='scan'){
 const limit=Math.min(100,Math.max(10,Number(process.argv[3]||100)));
 try {
   const list = client.ledgerService.listTransactions({readMask:{paths:['digest','effects.status']},options:{ordering:GrpcTypes.Ordering.DESCENDING,limit}},opts);
   const failures=[]; let count=0, frames=0, watermark='',end='';
   for await(const frame of list.responses){
      frames++;
      const item=frame.transaction;
      if(item?.digest) {
         count++;
         const data=outcome(item);
         if(data.success===false && data.errorText) failures.push({digest:data.digest,error:data.errorText,status:'onchain-failed',source:'Tatum Sui Mainnet gRPC'});
      }
      if(frame.watermark?.cursor) watermark='present';
      if(frame.end) end=JSON.stringify(frame.end).slice(0,140);
      if(count>=limit) break;
   }
   const file=path.join(root,'..','evidence','failed-sui-transaction-candidates.json');
   fs.mkdirSync(path.dirname(file),{recursive:true});
   fs.writeFileSync(file,JSON.stringify({date:new Date().toISOString(),source:'Tatum Sui Mainnet gRPC',scanned:count,failures},null,2)+'\n');
   console.log('TATUM_SCAN_FRAMES='+frames);
   console.log('TATUM_SCAN_TX_COUNT='+count);
   console.log('TATUM_SCAN_FAILED_COUNT='+failures.length);
   console.log('TATUM_SCAN_WATERMARK='+watermark);
   console.log('TATUM_SCAN_END='+end);
   console.log('TATUM_SCAN_OUTPUT='+file);
   for(const x of failures.slice(0,10)) console.log('REAL_FAILED='+x.digest+' ERROR='+x.error.slice(0,145));
 }catch(e){ console.log('TATUM_SCAN=FAILED');console.log('ERROR_CLASS='+String(e?.constructor?.name||'unknown'));console.log('RPC_STATUS='+String(e?.code||''));process.exitCode=1;}
}else{console.error('Use sample or scan');process.exitCode=1;}
