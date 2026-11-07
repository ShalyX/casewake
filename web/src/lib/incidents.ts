import type { ResolutionKind, ValidatedEvidence } from "./guard-evidence";
export type ObservedTransaction = {
  digest: string;
  network: "sui-mainnet";
  source: "Tatum Sui gRPC";
  observedAt: string;
  transactionTimestampMs?: number | null;
  checkpoint?: string | null;
  outcome: "failed" | "succeeded" | "unknown";
  outcomeReason?: string | null;
  errorText: string | null;
  fingerprint: string | null;
  packageId: string | null;
  failedCommandIndex?: number | null;
  failedCommandKind?: string | null;
  sender?: string | null;
  operationMarkers?: string[];
  commandKinds?: string[];
};

export type VerifiedCase = {
  schema: "incident-memory/v1";
  id: string;
  digest: string;
  network: "sui-mainnet";
  fingerprint: string;
  errorText: string;
  packageId: string | null;
  sdkVersion: string | null;
  diagnosis: string;
  resolutionSteps: string;
  evidenceUrl: string;
  reviewer: string;
  verifiedAt: string;
  status: "human-verified";
  resolutionKind: ResolutionKind;
  validatedEvidence: ValidatedEvidence;
};

export type Candidate = {
  record: VerifiedCase;
  distance: number;
  verdict: "eligible-for-review" | "incompatible";
  reasons: string[];
  warnings?: string[];
  walrusReceipt?: { blobId: string; namespace: string; verifiedThrough: "signed-walrus-recall" };
};

const PREFIX = "SUI_INCIDENT_MEMORY_V1\n";

export function fingerprintError(value: string, commandKind?: string | null): string | null {
  const normalized = value.trim().toLowerCase();
  const moveAbort = normalized.match(/module:\s*moduleid\s*\{\s*address:\s*(?:0x)?([a-f0-9]{64}),\s*name:\s*identifier\("([^"]+)"\)\s*\}[\s\S]*?function_name:\s*some\("([^"]+)"\)\s*\},\s*(\d+)/i);
  if (moveAbort) return "move-abort:0x" + moveAbort[1] + "::" + moveAbort[2] + "::" + moveAbort[3] + ":abort-" + moveAbort[4];
  if (/insufficientcoinbalance/.test(normalized)) return "sui:insufficient-coin-balance:" + (commandKind || "unknown");
  if (/executioncancelledduetosharedobjectcongestion/.test(normalized)) {
    const objects = [...normalized.matchAll(/0x[a-f0-9]{64}/g)].map(match => match[0]).sort();
    return "sui:shared-object-congestion:" + (objects.join(",") || "unspecified");
  }
  const canonical = normalized
    .replace(/\bin command \d+\b/g, "in command <index>")
    .replace(/instruction:\s*\d+/g, "instruction:<index>")
    .replace(/0x[a-f0-9]{32,}/g, "0x<address>")
    .replace(/\s+/g, " ")
    .slice(0, 480);
  return canonical.length >= 4 ? canonical : null;
}

/** A successor must be finalized in a strictly later Sui checkpoint. */
export function isLaterCheckpoint(original: string | null | undefined, successor: string | null | undefined): boolean {
  if (!original || !successor || !/^\d+$/.test(original) || !/^\d+$/.test(successor)) return false;
  try { return BigInt(successor) > BigInt(original); } catch { return false; }
}

export function encodeMemory(record: VerifiedCase): string {
  return PREFIX +
    "Human-verified Sui onchain incident. " +
    "Failure: " + record.errorText + ". " +
    "Diagnosis: " + record.diagnosis + ". " +
    "Confirmed procedure: " + record.resolutionSteps + ".\n" +
    JSON.stringify(record);
}

export function decodeMemory(text: string): VerifiedCase | null {
  if (!text.startsWith(PREFIX)) return null;
  const body = text.slice(PREFIX.length);
  const opening = body.indexOf("\n{");
  if (opening < 0) return null;
  try {
    const candidate: unknown = JSON.parse(body.slice(opening + 1));
    if (!candidate || typeof candidate !== "object") return null;
    const c = candidate as Record<string, unknown>;
    const required = ["id", "digest", "fingerprint", "errorText", "diagnosis", "resolutionSteps", "evidenceUrl", "reviewer", "verifiedAt"];
    if (c.schema !== "incident-memory/v1" || c.status !== "human-verified" || c.network !== "sui-mainnet" ||
        !required.every((key) => typeof c[key] === "string" && (c[key] as string).length > 0)) return null;
    if (!String(c.evidenceUrl).startsWith("https://") ||
        !c.validatedEvidence || typeof c.validatedEvidence !== "object") return null;
    const proof=c.validatedEvidence as Record<string,unknown>;
    if (proof.schema !== "casewake-validated-evidence/v1" || proof.originalDigest !== c.digest ||
        c.digest === "XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue") return null;
    const prevention = c.resolutionKind === "prevention-guard" &&
        proof.scope === "prevention-guard-only" && proof.originalHistoricalRouteRepaired === false;
    const repaired = c.resolutionKind === "route-repair" &&
        c.digest === "BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6" &&
        proof.scope === "full-flashloan-route-repair" && proof.originalHistoricalRouteRepaired === true &&
        proof.simulationSucceeded === true && proof.provider === "Tatum Sui Mainnet gRPC" &&
        proof.principalMist === "65265188650" && /^[a-f0-9]{64}$/.test(String(proof.routeTransactionSha256||""));
    const successor = c.resolutionKind === "onchain-successor" &&
        proof.scope === "human-reviewed-successor-transaction" &&
        proof.proofType === "tatum-executed-successor" &&
        proof.originalHistoricalRouteRepaired === false &&
        proof.provider === "Tatum Sui gRPC" &&
        proof.successorOutcome === "succeeded" &&
        proof.reviewerConfirmedCausality === true &&
        typeof proof.originalTimestampMs === "number" && Number.isFinite(proof.originalTimestampMs) &&
        typeof proof.successorTimestampMs === "number" && Number.isFinite(proof.successorTimestampMs) &&
        proof.successorTimestampMs >= proof.originalTimestampMs &&
        typeof proof.originalCheckpoint === "string" &&
        typeof proof.successorCheckpoint === "string" &&
        isLaterCheckpoint(proof.originalCheckpoint, proof.successorCheckpoint) &&
        typeof proof.successorDigest === "string" &&
        /^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(proof.successorDigest) &&
        proof.successorDigest !== c.digest &&
        typeof proof.originalSender === "string" &&
        typeof proof.successorSender === "string" &&
        /^0x[a-f0-9]{1,64}$/i.test(proof.originalSender) &&
        proof.originalSender === proof.successorSender &&
        Array.isArray(proof.matchedOperations) && proof.matchedOperations.length > 0 &&
        proof.matchedOperations.every((marker: unknown) => typeof marker === "string" && marker.length >= 8) &&
        typeof proof.reviewedChange === "string" && proof.reviewedChange.length >= 30 &&
        c.evidenceUrl === "https://suivision.xyz/txblock/" + proof.successorDigest;
    const reviewedMethods = ["reproduction-test", "unit-test", "integration-test", "deployed-fix", "maintainer-confirmed-fix"];
    const reviewedEvidence = c.resolutionKind === "reviewed-evidence" &&
        proof.scope === "human-reviewed-engineering-artifact" &&
        proof.proofType === "reviewer-attested-github-artifact" &&
        proof.originalHistoricalRouteRepaired === false &&
        proof.provider === "GitHub public API" &&
        proof.reviewerConfirmedCausality === true &&
        typeof proof.originalTimestampMs === "number" && Number.isFinite(proof.originalTimestampMs) &&
        typeof proof.originalCheckpoint === "string" && /^\d+$/.test(proof.originalCheckpoint) &&
        typeof proof.evidenceUrl === "string" &&
        /^https:\/\/github\.com\/[^/]+\/[^/]+\/(?:pull\/[1-9]\d*|commit\/[a-f0-9]{40})$/.test(proof.evidenceUrl) &&
        c.evidenceUrl === proof.evidenceUrl &&
        typeof proof.evidenceApiUrl === "string" &&
        /^https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/(?:pulls\/[1-9]\d*|commits\/[a-f0-9]{40})$/.test(proof.evidenceApiUrl) &&
        typeof proof.evidenceTitle === "string" && proof.evidenceTitle.length > 0 &&
        typeof proof.evidenceCommitSha === "string" && /^[a-f0-9]{40}$/.test(proof.evidenceCommitSha) &&
        typeof proof.evidenceFileCount === "number" && Number.isInteger(proof.evidenceFileCount) && proof.evidenceFileCount > 0 && proof.evidenceFileCount <= 100 &&
        typeof proof.evidenceSha256 === "string" && /^[a-f0-9]{64}$/.test(proof.evidenceSha256) &&
        reviewedMethods.includes(String(proof.verificationMethod)) &&
        typeof proof.reviewedChange === "string" && proof.reviewedChange.length >= 30;
    if (!prevention && !repaired && !successor && !reviewedEvidence) return null;
    return c as VerifiedCase;
  } catch { return null; }
}

export function assessCase(observation: ObservedTransaction, record: VerifiedCase, distance: number): Candidate {
  const reasons: string[] = [];
  const warnings: string[] = [];
  if (observation.outcome !== "failed") reasons.push("The current transaction is not a confirmed onchain failure.");
  if (record.network !== observation.network) reasons.push("Network mismatch.");
  if (record.digest === observation.digest) reasons.push("Self-match cannot prove comparable-incident recall.");
  if (!((record.resolutionKind === "prevention-guard" && record.validatedEvidence?.scope === "prevention-guard-only") ||
        (record.resolutionKind === "route-repair" && record.validatedEvidence?.scope === "full-flashloan-route-repair" && record.validatedEvidence.originalHistoricalRouteRepaired === true) ||
        (record.resolutionKind === "onchain-successor" && record.validatedEvidence?.scope === "human-reviewed-successor-transaction" && record.validatedEvidence.reviewerConfirmedCausality === true) ||
        (record.resolutionKind === "reviewed-evidence" && record.validatedEvidence?.scope === "human-reviewed-engineering-artifact" && record.validatedEvidence.reviewerConfirmedCausality === true)))
    reasons.push("Unsupported or unproven fix scope.");
  if (!observation.fingerprint || record.fingerprint !== observation.fingerprint) reasons.push("Execution error class or operation differs.");
  if (observation.packageId && record.packageId && observation.packageId !== record.packageId) reasons.push("Package mismatch.");
  if (record.errorText !== observation.errorText) warnings.push("The detailed trace differs from the source incident. Review the command position and transaction context before reusing the procedure.");
  if (record.sdkVersion) warnings.push("The saved procedure was reviewed against SDK " + record.sdkVersion + "; the current SDK version is not available from chain evidence and must be confirmed manually.");
  if (record.status !== "human-verified") reasons.push("Unverified case.");
  if (!record.evidenceUrl.startsWith("https://")) reasons.push("Missing secure evidence URL.");
  return { record, distance, verdict: reasons.length ? "incompatible" : "eligible-for-review", reasons, warnings };
}

export function safeText(input: unknown, max = 2000): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, max);
}
