import "server-only";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { ChannelCredentials } from "@grpc/grpc-js";
import { fingerprintError, type ObservedTransaction } from "./incidents";
import { retryReadOnly } from "./retry-reads";
import { isTatumNotFound } from "./tatum-error";

export class ConfigurationError extends Error {}

function unknownTransaction(digest: string): ObservedTransaction {
  return {
    digest,
    network: "sui-mainnet",
    source: "Tatum Sui gRPC",
    observedAt: new Date().toISOString(),
    outcome: "unknown",
    outcomeReason: "Tatum returned NOT_FOUND. The digest may be unexecuted, pruned, or not yet indexed; no success or failure is inferred.",
    errorText: null,
    fingerprint: null,
    packageId: null,
    failedCommandIndex: null,
    failedCommandKind: null,
    sender: null,
    operationMarkers: [],
    commandKinds: [],
  };
}

export async function getTatumTransaction(digest: string): Promise<ObservedTransaction> {
  const apiKey = process.env.TATUM_API_KEY?.trim();
  if (!apiKey) throw new ConfigurationError("Tatum API key not configured on server.");
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(digest)) throw new Error("Enter a valid base58 Sui transaction digest.");

  const transport = new GrpcTransport({
    host: "sui-mainnet-grpc.gateway.tatum.io:443",
    channelCredentials: ChannelCredentials.createSsl(),
  });
  const client = new SuiGrpcClient({ network: "mainnet", transport });
  // Read-only lookup: a single bounded retry handles intermittent DNS/gRPC outages.
  const response = await retryReadOnly(
    () => client.ledgerService.getTransaction(
      { digest, readMask: { paths: ["digest", "effects", "transaction", "timestamp", "checkpoint"] } },
      { meta: { "x-api-key": apiKey }, timeout: 15000 },
    ).response,
  ).catch(error => {
    if (isTatumNotFound(error)) return { transaction: null };
    throw error;
  });
  const transaction = response.transaction;
  if (!transaction) return unknownTransaction(digest);
  const chainMetadata = transaction as typeof transaction & {
    timestamp?: { seconds?: bigint | string | number; nanos?: number };
    checkpoint?: bigint | string | number;
  };
  const timestampSeconds = chainMetadata.timestamp?.seconds === undefined ? Number.NaN : Number(chainMetadata.timestamp.seconds);
  const timestampNanos = Number(chainMetadata.timestamp?.nanos ?? 0);
  const transactionTimestampMs = Number.isFinite(timestampSeconds)
    ? timestampSeconds * 1000 + timestampNanos / 1_000_000
    : null;
  const checkpoint = chainMetadata.checkpoint == null ? null : String(chainMetadata.checkpoint);
  const effects = transaction.effects;
  const status = effects?.status;
  const outcome: ObservedTransaction["outcome"] =
    status?.success === true ? "succeeded" :
    status?.success === false && status?.error ? "failed" : "unknown";
  const errorObj = status?.error as { description?: string; message?: string } | undefined;
  const errorText = outcome === "failed"
    ? String(errorObj?.description || errorObj?.message || "Onchain execution failed (no details returned).")
    : null;
  const commandNumber = errorText?.match(/\bin command (\d+)\b/);
  const failedCommandIndex = commandNumber ? Number(commandNumber[1]) : null;
  type TxCommands = {sender?:string;kind?:{data?:{programmableTransaction?:{commands?:Array<{command?:{oneofKind?:string;moveCall?:{package?:string;module?:string;function?:string}}}>}}}};
  const decodedTransaction = transaction.transaction as TxCommands | undefined;
  const txCommands = decodedTransaction?.kind?.data?.programmableTransaction?.commands;
  const commandKinds = (txCommands || []).map(c => c.command?.oneofKind || "unknown");
  const operationMarkers = (txCommands || []).flatMap(c => {
    const call = c.command?.moveCall;
    if (c.command?.oneofKind !== "moveCall" || !call?.package || !call.module || !call.function) return [];
    return ["move:" + call.package.toLowerCase() + "::" + call.module + "::" + call.function];
  });
  const sender = typeof decodedTransaction?.sender === "string" && /^0x[a-f0-9]{1,64}$/i.test(decodedTransaction.sender)
    ? decodedTransaction.sender.toLowerCase() : null;
  const failedCommandKind = failedCommandIndex !== null ? txCommands?.[failedCommandIndex]?.command?.oneofKind ?? null : null;
  const moduleAddress = errorText?.match(/module:\s*ModuleId\s*\{\s*address:\s*(?:0x)?([a-f0-9]{64})/i)?.[1];
  return {
    digest: transaction.digest || digest,
    network: "sui-mainnet",
    source: "Tatum Sui gRPC",
    observedAt: new Date().toISOString(),
    transactionTimestampMs,
    checkpoint,
    outcome,
    outcomeReason: outcome === "unknown" ? "Tatum returned transaction data without a definitive execution status. No success or failure is inferred." : null,
    errorText,
    fingerprint: errorText ? fingerprintError(errorText, failedCommandKind) : null,
    // A Move package is captured only when Tatum's own MoveLocation names a full package address.
    packageId: moduleAddress ? "0x" + moduleAddress.toLowerCase() : null,
    failedCommandIndex,
    failedCommandKind,
    sender,
    operationMarkers,
    commandKinds,
  };
}
