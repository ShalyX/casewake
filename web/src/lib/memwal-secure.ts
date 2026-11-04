import "server-only";
import { MemWal } from "@mysten-incubation/memwal";
import { SessionKey } from "@mysten/seal";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { ChannelCredentials } from "@grpc/grpc-js";
import { retryReadOnly } from "./retry-reads";

/**
 * The MemWal SDK currently reads the managed relayer's /config and attempts
 * a public gRPC endpoint, then falls back to retired JSON-RPC if that fails.
 * On this host, public Sui RPC is unavailable. Build the ordinary signed,
 * short-lived SEAL session via our already-verified Tatum native gRPC path.
 * The private delegate key NEVER leaves the server.
 *
 * Temporary compatibility adaptation; revisit when SDK exposes client injection.
 */
let cached: { client: MemWal; validUntil: number } | null = null;
let pending: Promise<{ client: MemWal; validUntil: number }> | null = null;

type ScopedTransport = GrpcTransport;

function getTatumGrpcClient(apiKey: string): SuiGrpcClient {
  const native = new GrpcTransport({
    host: "sui-mainnet-grpc.gateway.tatum.io:443",
    channelCredentials: ChannelCredentials.createSsl(),
  });
  const withAuth = (options?: { meta?: Record<string, string | string[]>; timeout?: number | Date }) => ({
    ...options, meta: { ...options?.meta, "x-api-key": apiKey },
    timeout: 22000,
  });
  const transport = {
    mergeOptions: (options: Parameters<typeof native.mergeOptions>[0]) => withAuth(native.mergeOptions(options)),
    unary: (method: Parameters<typeof native.unary>[0], input: Parameters<typeof native.unary>[1], options: Parameters<typeof native.unary>[2]) =>
      native.unary(method, input, withAuth(options)),
    serverStreaming: (method: Parameters<typeof native.serverStreaming>[0], input: Parameters<typeof native.serverStreaming>[1], options: Parameters<typeof native.serverStreaming>[2]) =>
      native.serverStreaming(method, input, withAuth(options)),
    clientStreaming: (method: Parameters<typeof native.clientStreaming>[0], options: Parameters<typeof native.clientStreaming>[1]) =>
      native.clientStreaming(method, withAuth(options)),
    duplex: (method: Parameters<typeof native.duplex>[0], options: Parameters<typeof native.duplex>[1]) =>
      native.duplex(method, withAuth(options)),
  } as unknown as ScopedTransport;
  return new SuiGrpcClient({ network: "mainnet", transport });
}

async function prepareMemwal(): Promise<{ client: MemWal; validUntil: number }> {
  const key = process.env.MEMWAL_PRIVATE_KEY?.trim();
  const accountId = process.env.MEMWAL_ACCOUNT_ID?.trim();
  const apiKey = process.env.TATUM_API_KEY?.trim();
  const serverUrl = process.env.MEMWAL_SERVER_URL || "https://relayer.memory.walrus.xyz";
  if (!key || !accountId || !apiKey) throw new Error("Tatum and Walrus server credentials are required.");

  const rawKey = key.replace(/^0x/, "");
  if (!/^[a-f0-9]{64}$/i.test(rawKey)) throw new Error("Expected a 32-byte hexadecimal MemWal delegate key.");
  const signer = Ed25519Keypair.fromSecretKey(new Uint8Array(Buffer.from(rawKey, "hex")));
  const configRes = await fetch(new URL("/config", serverUrl), {
    cache: "no-store", signal: AbortSignal.timeout(12000),
  });
  if (!configRes.ok) throw new Error("Walrus public configuration is temporarily unavailable.");
  const remote = await configRes.json() as { network?: string; packageId?: string };
  if (remote.network !== "mainnet" || !/^0x[a-f0-9]{64}$/i.test(remote.packageId || "")) {
    throw new Error("Unexpected Walrus Mainnet configuration.");
  }
  const session = await SessionKey.create({
    address: signer.getPublicKey().toSuiAddress(),
    packageId: remote.packageId!,
    ttlMin: 5,
    signer,
    suiClient: getTatumGrpcClient(apiKey),
  });
  const signed = await signer.signPersonalMessage(session.getPersonalMessage());
  await session.setPersonalMessageSignature(signed.signature);
  const exported = session.export();
  // SEAL export() intentionally rejects JSON.stringify directly; use the explicit wire fields.
  const payload = {
    address: exported.address,
    packageId: exported.packageId,
    mvrName: exported.mvrName,
    creationTimeMs: exported.creationTimeMs,
    ttlMin: exported.ttlMin,
    personalMessageSignature: exported.personalMessageSignature,
    sessionKey: exported.sessionKey,
  };
  const bytes = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  const validUntil = Date.now() + 4 * 60_000;
  const client = MemWal.create({
    key, accountId, serverUrl,
    namespace: process.env.MEMWAL_NAMESPACE || "incident-memory-v1",
  });
  // The SDK has no public session injection API. This is isolated and version-pinned.
  const sealSessionClient = client as unknown as { sessionCache: { bytes: string; expiresAt: number } };
  sealSessionClient.sessionCache = { bytes, expiresAt: validUntil };
  return { client, validUntil };
}

export async function secureMemwalClient(): Promise<MemWal> {
  if (cached && Date.now() < cached.validUntil - 30_000) return cached.client;
  if (!pending) pending = retryReadOnly(prepareMemwal).finally(() => { pending = null; });
  const prepared = await pending;
  cached = prepared;
  return prepared.client;
}
