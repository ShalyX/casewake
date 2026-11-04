import "server-only";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { ChannelCredentials } from "@grpc/grpc-js";
import { fingerprintError, type ObservedTransaction } from "./incidents";

export class ConfigurationError extends Error {}

export async function getTatumTransaction(digest: string): Promise<ObservedTransaction> {
  const apiKey = process.env.TATUM_API_KEY?.trim();
  if (!apiKey) throw new ConfigurationError("Tatum API key not configured on server.");
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(digest)) throw new Error("Enter a valid base58 Sui transaction digest.");

  const transport = new GrpcTransport({
    host: "sui-mainnet-grpc.gateway.tatum.io:443",
    channelCredentials: ChannelCredentials.createSsl(),
  });
  const client = new SuiGrpcClient({ network: "mainnet", transport });
  const { response } = await client.ledgerService.getTransaction(
    { digest, readMask: { paths: ["digest", "effects", "transaction"] } },
    { meta: { "x-api-key": apiKey }, timeout: 15000 },
  );
  const transaction = response.transaction;
  if (!transaction) throw new Error("Tatum did not return transaction data for this digest.");
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
  type TxCommands = {kind?:{data?:{programmableTransaction?:{commands?:Array<{command?:{oneofKind?:string}}>}}}};
  const txCommands = (transaction.transaction as TxCommands | undefined)?.kind?.data?.programmableTransaction?.commands;
  const failedCommandKind = failedCommandIndex !== null ? txCommands?.[failedCommandIndex]?.command?.oneofKind ?? null : null;
  return {
    digest: transaction.digest || digest,
    network: "sui-mainnet",
    source: "Tatum Sui gRPC",
    observedAt: new Date().toISOString(),
    outcome,
    errorText,
    fingerprint: errorText ? fingerprintError(errorText) : null,
    // Never invent a Move package from an error string; fill only from verified decoded input.
    packageId: null,
    failedCommandIndex,
    failedCommandKind,
  };
}
