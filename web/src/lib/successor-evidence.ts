import "server-only";
import { isLaterCheckpoint, type ObservedTransaction } from "./incidents";
import { getTatumTransaction } from "./tatum";
import type { ValidatedEvidence } from "./guard-evidence";

// This path is for other legitimate Sui incidents. The selected DeepBook
// flashloan has a stricter, non-bypassable route-specific proof gate.
export type SuccessorEvidence = Extract<ValidatedEvidence, { scope: "human-reviewed-successor-transaction" }>;

export function successorExplorerUrl(digest: string) {
  return "https://suivision.xyz/txblock/" + digest;
}

export async function verifyOnchainSuccessor(
  original: ObservedTransaction,
  successorDigest: string,
  evidenceUrl: string,
  reviewedChange: string,
): Promise<SuccessorEvidence> {
  if (original.outcome !== "failed" || !original.fingerprint)
    throw new Error("The source must be a Tatum-confirmed failed onchain execution.");
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(successorDigest) || successorDigest === original.digest)
    throw new Error("Supply a distinct, valid Sui transaction digest for the corrected execution.");
  if (evidenceUrl !== successorExplorerUrl(successorDigest))
    throw new Error("Evidence URL must identify the exact corrected transaction, not an unrelated link.");
  if (reviewedChange.trim().length < 30)
    throw new Error("Explain the specific technical change between the failed and successful execution.");
  const successor = await getTatumTransaction(successorDigest);
  if (successor.outcome !== "succeeded" || successor.network !== original.network)
    throw new Error("Tatum Mainnet did not confirm successful onchain execution of the submitted follow-up.");
  // Do not mistake an unrelated successful transaction for a correction.
  // A missing authenticated sender identity fails closed, rather than
  // claiming that two independent transactions belong to one engineer.
  if (!original.sender || !successor.sender ||
      original.sender.toLowerCase() !== successor.sender.toLowerCase())
    throw new Error("The failed and successful transactions must have the same independently observed sender.");
  if (original.transactionTimestampMs == null || successor.transactionTimestampMs == null ||
      !Number.isFinite(original.transactionTimestampMs) || !Number.isFinite(successor.transactionTimestampMs))
    throw new Error("Tatum did not return authenticated chain timestamps for both transactions.");
  if (!isLaterCheckpoint(original.checkpoint, successor.checkpoint))
    throw new Error("The successful follow-up must be finalized in a strictly later Sui checkpoint than the failed incident.");
  if (successor.transactionTimestampMs < original.transactionTimestampMs)
    throw new Error("The successful follow-up timestamp precedes the failed incident.");
  if (original.packageId && successor.packageId && original.packageId !== successor.packageId)
    throw new Error("The successful transaction targets a different confirmed package.");
  const originalCalls = original.operationMarkers || [];
  const confirmedCalls = new Set(successor.operationMarkers || []);
  const matchedCalls = originalCalls.filter(m => confirmedCalls.has(m));
  const sourceKinds = original.commandKinds || [];
  const successorKinds = successor.commandKinds || [];
  const sameProgramShape = sourceKinds.length > 0 && sourceKinds.length === successorKinds.length &&
    sourceKinds.every((kind, index) => kind !== "unknown" && kind === successorKinds[index]);
  if (originalCalls.length > 0 && matchedCalls.length === 0)
    throw new Error("No matching Move call target between the failed and successful transaction; a same-sender unrelated success is not a verified correction.");
  if (originalCalls.length === 0 && !sameProgramShape)
    throw new Error("No shared independently decoded operation or matching programmable transaction shape was found.");
  const matchedOperations = matchedCalls.length > 0 ? matchedCalls : ["sequence:" + sourceKinds.join(">")];
  return {
    schema: "casewake-validated-evidence/v1",
    scope: "human-reviewed-successor-transaction",
    proofType: "tatum-executed-successor",
    originalDigest: original.digest,
    successorDigest: successor.digest,
    originalTimestampMs: original.transactionTimestampMs,
    successorTimestampMs: successor.transactionTimestampMs,
    originalCheckpoint: original.checkpoint!,
    successorCheckpoint: successor.checkpoint!,
    originalSender: original.sender.toLowerCase(),
    successorSender: successor.sender.toLowerCase(),
    matchedOperations,
    provider: "Tatum Sui gRPC",
    successorOutcome: "succeeded",
    reviewerConfirmedCausality: true,
    reviewedChange: reviewedChange.trim(),
    verifiedAt: new Date().toISOString(),
    originalHistoricalRouteRepaired: false,
  };
}
