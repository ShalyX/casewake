import type { ResolutionKind, ValidatedEvidence } from "./guard-evidence";
export type ObservedTransaction = {
  digest: string;
  network: "sui-mainnet";
  source: "Tatum Sui gRPC";
  observedAt: string;
  outcome: "failed" | "succeeded" | "unknown";
  errorText: string | null;
  fingerprint: string | null;
  packageId: string | null;
  failedCommandIndex?: number | null;
  failedCommandKind?: string | null;
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
  walrusReceipt?: { blobId: string; namespace: string; verifiedThrough: "signed-walrus-recall" };
};

const PREFIX = "SUI_INCIDENT_MEMORY_V1\n";

export function fingerprintError(value: string): string | null {
  const canonical = value
    .trim()
    .toLowerCase()
    .replace(/0x[a-f0-9]{32,}/g, "0x<address>")
    .replace(/\s+/g, " ")
    .slice(0, 480);
  return canonical.length >= 4 ? canonical : null;
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
        c.resolutionKind !== "prevention-guard" ||
        !c.validatedEvidence || typeof c.validatedEvidence !== "object" ||
        (c.validatedEvidence as Record<string, unknown>).schema !== "casewake-validated-evidence/v1" ||
        (c.validatedEvidence as Record<string, unknown>).scope !== "prevention-guard-only" ||
        (c.validatedEvidence as Record<string, unknown>).originalHistoricalRouteRepaired !== false ||
        (c.validatedEvidence as Record<string, unknown>).originalDigest !== c.digest) return null;
    return c as VerifiedCase;
  } catch { return null; }
}

export function assessCase(observation: ObservedTransaction, record: VerifiedCase, distance: number): Candidate {
  const reasons: string[] = [];
  if (observation.outcome !== "failed") reasons.push("The current transaction is not a confirmed onchain failure.");
  if (record.network !== observation.network) reasons.push("Network mismatch.");
  if (record.digest === observation.digest) reasons.push("Self-match cannot prove comparable-incident recall.");
  if (record.resolutionKind !== "prevention-guard" || record.validatedEvidence?.scope !== "prevention-guard-only") reasons.push("Unsupported or unproven fix scope.");
  if (!observation.fingerprint || record.fingerprint !== observation.fingerprint) reasons.push("Execution error fingerprint differs.");
  if (observation.packageId && record.packageId && observation.packageId !== record.packageId) reasons.push("Package mismatch.");
  if (record.errorText !== observation.errorText) reasons.push("Original error detail differs; do not automatically reuse this resolution.");
  if (record.sdkVersion) reasons.push("Cannot verify the caller's SDK version from an onchain digest; manual version confirmation required.");
  if (record.status !== "human-verified") reasons.push("Unverified case.");
  if (!record.evidenceUrl.startsWith("https://")) reasons.push("Missing secure evidence URL.");
  return { record, distance, verdict: reasons.length ? "incompatible" : "eligible-for-review", reasons };
}

export function safeText(input: unknown, max = 2000): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, max);
}
