import "server-only";
import type { ObservedTransaction } from "./incidents";
import type { VerifiedRouteSimulation } from "./route-repair-proof";

// Historical read-only simulation evidence for existing prevention records.
// This artifact does not establish a repaired historical swap.
const PROOF_COMMIT = "f9d3ea32e24f84f2306cd2533d92dbfd0cb62f2e";
const PROOF_PATH = "evidence/deepbook-repayment-guard-proof.json";
export const GUARD_EVIDENCE_URL = `https://github.com/ShalyX/casewake/blob/${PROOF_COMMIT}/${PROOF_PATH}`;
const RAW_PROOF_URL = `https://raw.githubusercontent.com/ShalyX/casewake/${PROOF_COMMIT}/${PROOF_PATH}`;
export const DEEPBOOK_SOURCE_DIGEST = "BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6";

export type ResolutionKind = "prevention-guard" | "route-repair" | "onchain-successor" | "reviewed-evidence";
export type VerificationMethod =
  | "reproduction-test"
  | "unit-test"
  | "integration-test"
  | "deployed-fix"
  | "maintainer-confirmed-fix";
export type ValidatedEvidence = {
  schema: "casewake-validated-evidence/v1";
  sourceCommit: string;
  sourceUrl: string;
  originalDigest: string;
  proofType: "mainnet-simulation";
  scope: "prevention-guard-only";
  acceptedTests: ["original-three-hop-route", "deepbook-overdraw-control", "deepbook-exact-repayment-control"];
  originalHistoricalRouteRepaired: false;
  mockedGas: true;
  onchainExecuted: false;
} | (VerifiedRouteSimulation & {
  schema: "casewake-validated-evidence/v1";
  scope: "full-flashloan-route-repair";
  proofType: "mainnet-simulation";
  originalHistoricalRouteRepaired: true;
}) | {
  schema: "casewake-validated-evidence/v1";
  scope: "human-reviewed-successor-transaction";
  proofType: "tatum-executed-successor";
  originalDigest: string;
  successorDigest: string;
  originalTimestampMs: number;
  successorTimestampMs: number;
  originalCheckpoint: string;
  successorCheckpoint: string;
  provider: "Tatum Sui gRPC";
  originalSender: string;
  successorSender: string;
  matchedOperations: string[];
  successorOutcome: "succeeded";
  reviewerConfirmedCausality: true;
  reviewedChange: string;
  verifiedAt: string;
  originalHistoricalRouteRepaired: false;
} | {
  schema: "casewake-validated-evidence/v1";
  scope: "human-reviewed-engineering-artifact";
  proofType: "reviewer-attested-github-artifact";
  originalDigest: string;
  originalTimestampMs: number;
  originalCheckpoint: string;
  provider: "GitHub public API";
  evidenceUrl: string;
  evidenceApiUrl: string;
  evidenceTitle: string;
  evidenceCommitSha: string;
  evidenceFileCount: number;
  evidenceSha256: string;
  verificationMethod: VerificationMethod;
  reviewerConfirmedCausality: true;
  reviewedChange: string;
  verifiedAt: string;
  originalHistoricalRouteRepaired: false;
};

type Result = {
  case?: string; digest?: string; provider?: string;
  decision?: string; simulationOutcome?: string; statusSuccess?: boolean;
  error?: string | null; failedAtCommand?: string | null;
  gasPaymentMocked?: boolean; signed?: boolean; onchainExecuted?: boolean;
  commandResultCount?: number;
};
type GuardProof = { schema?: string; results?: Result[] };

function assertResult(
  result: Result | undefined,
  label: string,
  decision: string,
  outcome: string,
  success: boolean,
) {
  if (!result || result.case !== label || result.decision !== decision ||
      result.simulationOutcome !== outcome || result.statusSuccess !== success ||
      result.provider !== "Tatum Sui Mainnet gRPC SimulateTransaction" ||
      result.gasPaymentMocked !== true || result.signed !== false ||
      result.onchainExecuted !== false) {
    throw new Error("Gate 1 rejected: missing or inconsistent independent Mainnet simulation evidence.");
  }
}

export async function validateCasewakeEvidence(
  observed: ObservedTransaction,
  kind: ResolutionKind,
  evidenceUrl: string,
  diagnosis: string,
  resolutionSteps: string,
): Promise<ValidatedEvidence> {
  if (kind === "route-repair") {
    throw new Error("Gate 1 blocked: no corrected successful simulation of the historical three-hop route has been proven.");
  }
  if (kind !== "prevention-guard" || observed.digest !== DEEPBOOK_SOURCE_DIGEST ||
      observed.outcome !== "failed" || !observed.errorText?.includes("InsufficientCoinBalance") ||
      observed.failedCommandIndex !== 16 || observed.failedCommandKind !== "splitCoins") {
    throw new Error("Gate 1 blocked: this incident is not covered by the independently tested DeepBook prevention proof.");
  }
  if (evidenceUrl !== GUARD_EVIDENCE_URL) {
    throw new Error("Gate 2 blocked: attach the exact commit-pinned independent guard evidence URL, not an arbitrary link.");
  }
  if (!/insufficientcoinbalance/i.test(diagnosis) || !/repayment/i.test(diagnosis) ||
      !/simulat/i.test(resolutionSteps) || !/block/i.test(resolutionSteps) ||
      !/sign/i.test(resolutionSteps) || /(?:route|swap)\s+(?:was\s+)?(?:repaired|fixed|profitable)/i.test(resolutionSteps)) {
    throw new Error("Gate 2 blocked: describe the proven repayment failure and pre-signing simulation guard without claiming a repaired or profitable historical route.");
  }
  const response = await fetch(RAW_PROOF_URL, { cache: "no-store", signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error("Gate 2 blocked: immutable proof could not be independently retrieved.");
  const proof = await response.json() as GuardProof;
  if (proof.schema !== "deepbook-repayment-guard-proof/v1" ||
      !Array.isArray(proof.results) || proof.results.length !== 3) {
    throw new Error("Gate 1 blocked: the independent evidence is incomplete.");
  }
  const [original, overdraw, corrected] = [
    proof.results.find(r => r.case === "original-three-hop-route"),
    proof.results.find(r => r.case === "deepbook-overdraw-control"),
    proof.results.find(r => r.case === "deepbook-exact-repayment-control"),
  ];
  assertResult(original, "original-three-hop-route", "BLOCK", "FailedTransaction", false);
  assertResult(overdraw, "deepbook-overdraw-control", "BLOCK", "FailedTransaction", false);
  assertResult(corrected, "deepbook-exact-repayment-control", "ALLOW", "Transaction", true);
  if (original?.digest !== observed.digest || original.failedAtCommand !== "16" ||
      !String(original.error).includes("InsufficientCoinBalance") ||
      overdraw?.failedAtCommand !== "1" ||
      !String(overdraw.error).includes("InsufficientCoinBalance") ||
      corrected?.commandResultCount !== 4) {
    throw new Error("Gate 1 blocked: repayment proof does not match the failed transaction and successful control.");
  }
  // Strict three-gate acceptance: a different successful DeepBook control does
  // not satisfy the user's requirement to correct and successfully simulate
  // the ORIGINAL three-hop transaction. Do not promote a prevention runbook to
  // a human-verified historical resolution on this evidence alone.
  throw new Error("Gate 1 incomplete: original three-hop route was blocked, but no corrected version of that same route passed Tatum Mainnet simulation. This prevention procedure remains a simulation-tested runbook, not a verified incident resolution.");
}
