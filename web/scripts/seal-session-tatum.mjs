// Constructs a Walrus SEAL session using authenticated Tatum Sui gRPC rather than a retired JSON-RPC endpoint.
// Never prints secrets or the session certificate.
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';
import { SessionKey } from '@mysten/seal';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export async function makeTatumSealSession(cfg) {
  const native=new GrpcTransport({
    host:'sui-mainnet-grpc.gateway.tatum.io:443',
    channelCredentials:ChannelCredentials.createSsl(),
  });
  const withAuth=options=>({
    ...options,meta:{...options?.meta, 'x-api-key':cfg.TATUM_API_KEY},timeout:22000
  });
  const transport={
    mergeOptions:(o)=>withAuth(native.mergeOptions(o)),
    unary:(method,input,options)=>native.unary(method,input,withAuth(options)),
    serverStreaming:(method,input,options)=>native.serverStreaming(method,input,withAuth(options)),
    clientStreaming:(method,options)=>native.clientStreaming(method,withAuth(options)),
    duplex:(method,options)=>native.duplex(method,withAuth(options)),
  };
  const suiClient=new SuiGrpcClient({network:'mainnet',transport});
  const configRes=await fetch(new URL('/config',cfg.MEMWAL_SERVER_URL),{signal:AbortSignal.timeout(16000)});
  if(!configRes.ok) throw new Error('Walrus relayer public config unavailable');
  const serverCfg=await configRes.json();
  if(serverCfg.network!=='mainnet' || !/^0x[a-f0-9]{64}$/i.test(serverCfg.packageId||''))
    throw new Error('Walrus config unexpected; refusing to generate a session');
  const raw=cfg.MEMWAL_PRIVATE_KEY.replace(/^0x/,'');
  if(!/^[a-f0-9]{64}$/i.test(raw)) throw new Error('This compatibility probe expects a 32-byte hex delegate key');
  const signer=Ed25519Keypair.fromSecretKey(new Uint8Array(Buffer.from(raw,'hex')));
  const session=await SessionKey.create({
    address:signer.getPublicKey().toSuiAddress(),
    packageId:serverCfg.packageId,
    ttlMin:5,
    signer,
    suiClient,
  });
  const signed=await signer.signPersonalMessage(session.getPersonalMessage());
  await session.setPersonalMessageSignature(signed.signature);
  const exported=session.export();
  const json={
    address:exported.address,
    packageId:exported.packageId,
    mvrName:exported.mvrName,
    creationTimeMs:exported.creationTimeMs,
    ttlMin:exported.ttlMin,
    personalMessageSignature:exported.personalMessageSignature,
    sessionKey:exported.sessionKey,
  };
  return {bytes:Buffer.from(JSON.stringify(json),'utf8').toString('base64'),ttlMin:5};
}
