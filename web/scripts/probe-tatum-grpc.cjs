// Read-only Tatum Sui Mainnet gRPC smoke test. Built-in node:http2; no npm dependencies.
// Does not print the API key. Request is an empty GetServiceInfo protobuf message.
const fs = require('node:fs');
const http2 = require('node:http2');
const envPath = require('node:path').join(__dirname, '..', '.env.local');
const envText = fs.readFileSync(envPath, 'utf8');
const entry = envText.split(/\r?\n/).find(x => x.startsWith('TATUM_API_KEY='));
const key = entry ? entry.slice('TATUM_API_KEY='.length).trim().replace(/^["']|["']$/g, '') : '';
if (!key || /^(your_|paste_|placeholder)/i.test(key)) {
  console.log('TATUM_CONFIG=INCOMPLETE'); process.exit(2);
}
const host = 'sui-mainnet-grpc.gateway.tatum.io';
let finished = false;
let stream;
const session = http2.connect('https://' + host);
const timeout = setTimeout(() => {
  if (finished) return;
  finished = true;
  console.log('TATUM_GRPC=TIMEOUT');
  try { stream?.close(); session.destroy(); } catch {}
  process.exitCode = 3;
}, 16000);
let httpStatus = 0, grpcStatus = '', parts = [];
session.on('error', () => {
 if (!finished) { finished = true; clearTimeout(timeout); console.log('TATUM_GRPC=NETWORK_ERROR'); process.exitCode = 3; }
});
stream = session.request({
  ':method':'POST', ':path':'/sui.rpc.v2.LedgerService/GetServiceInfo',
  ':scheme':'https', ':authority':host,
  'content-type':'application/grpc', 'te':'trailers', 'x-api-key':key,
});
stream.on('response', h => { httpStatus = Number(h[':status'] || 0); if (h['grpc-status'] !== undefined) grpcStatus = String(h['grpc-status']); });
stream.on('trailers', h => { if (h['grpc-status'] !== undefined) grpcStatus = String(h['grpc-status']); });
stream.on('data', chunk => parts.push(chunk));
stream.on('error', () => {
 if (!finished) { finished = true; clearTimeout(timeout); console.log('TATUM_GRPC=STREAM_ERROR'); process.exitCode = 3; session.close(); }
});
stream.on('end', () => {
 if (finished) return;
 finished=true; clearTimeout(timeout);
 const bytes=Buffer.concat(parts);
 const protobufBytes=bytes.length>=5 ? bytes.readUInt32BE(1) : 0;
 console.log('TATUM_HTTP_STATUS=' + httpStatus);
 console.log('TATUM_GRPC_STATUS=' + (grpcStatus || 'missing'));
 console.log('TATUM_RESPONSE_MESSAGE_BYTES=' + protobufBytes);
 if (httpStatus===200 && grpcStatus==='0' && bytes.length>=5 && protobufBytes>0 && bytes.length>=5+protobufBytes) {
   console.log('TATUM_GRPC=VERIFIED_AUTHENTICATED_MAINNET_READ');
 } else { console.log('TATUM_GRPC=NOT_VERIFIED'); process.exitCode=4; }
 session.close();
});
stream.end(Buffer.from([0,0,0,0,0]));
