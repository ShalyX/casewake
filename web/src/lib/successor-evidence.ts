import "server-only";
import type { ObservedTransaction } from "./incidents";
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
  if (original.packageId && successor.packageId && original.packageId !== successor.packageId)
    throw new Error("The successful transaction targets a different confirmed package.");
  return {
    schema: "casewake-validated-evidence/v1",
    scope: "human-reviewed-successor-transaction",
    proofType: "tatum-executed-successor",
    originalDigest: original.digest,
    successorDigest: successor.digest,
    originalSender: original.sender.toLowerCase(),
    successorSender: successor.sender.toLowerCase(),
    provider: "Tatum Sui gRPC",
    successorOutcome: "succeeded",
    reviewerConfirmedCausality: true,
    reviewedChange: reviewedChange.trim(),
    verifiedAt: new Date().toISOString(),
    originalHistoricalRouteRepaired: false,
  };
}
