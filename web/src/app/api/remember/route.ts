import { randomUUID, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getTatumTransaction } from "@/lib/tatum";
import { safeText, type VerifiedCase } from "@/lib/incidents";
import { storeVerifiedIncident } from "@/lib/walrus";
import { validateCasewakeEvidence, type ResolutionKind } from "@/lib/guard-evidence";
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const requiredKey = process.env.WORKSPACE_WRITE_KEY;
  if (!requiredKey) return NextResponse.json({ error: "Write access is disabled until WORKSPACE_WRITE_KEY is configured." }, { status: 503 });
  // Reviewer token is never persisted in the browser; this route must remain server-only.
  const suppliedKey = Buffer.from(request.headers.get("x-workspace-key") || "", "utf8");
  const expectedKey = Buffer.from(requiredKey, "utf8");
  if (suppliedKey.length !== expectedKey.length || !timingSafeEqual(suppliedKey, expectedKey))
    return NextResponse.json({ error: "Reviewer access token is incorrect." }, { status: 403 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const digest = safeText(body.digest, 100);
    const diagnosis = safeText(body.diagnosis, 800);
    const resolutionSteps = safeText(body.resolutionSteps, 1800);
    const evidenceUrl = safeText(body.evidenceUrl, 500);
    const reviewer = safeText(body.reviewer, 120);
    const sdkVersion = safeText(body.sdkVersion, 80) || null;
    const resolutionKind = body.resolutionKind as ResolutionKind;
    if (body.verified !== true || !diagnosis || resolutionSteps.length < 15 || !reviewer ||
        !/^https:\/\/[^\s]+$/i.test(evidenceUrl))
      return NextResponse.json({ error: "Human verification, diagnosis, a concrete resolution, reviewer and HTTPS evidence URL are required." }, { status: 400 });
    const observed = await getTatumTransaction(digest);
    if (observed.outcome !== "failed" || !observed.fingerprint || !observed.errorText)
      return NextResponse.json({ error: "Only a Tatum-confirmed onchain failed transaction can become a verified incident memory." }, { status: 400 });
    // The server inspects an immutable, independently replayable Tatum proof
    // BEFORE touching Walrus. Reviewer attestation or a URL alone never passes Gate 2.
    const validatedEvidence = await validateCasewakeEvidence(observed, resolutionKind, evidenceUrl, diagnosis, resolutionSteps);
    const record: VerifiedCase = {
      schema: "incident-memory/v1", id: randomUUID(),
      digest: observed.digest, network: observed.network,
      fingerprint: observed.fingerprint, errorText: observed.errorText,
      packageId: observed.packageId, sdkVersion, diagnosis,
      resolutionSteps, evidenceUrl, reviewer,
      verifiedAt: new Date().toISOString(), status: "human-verified",
      resolutionKind, validatedEvidence,
    };
    const proof = await storeVerifiedIncident(record);
    return NextResponse.json({ record, proof, gates: { simulationEvidence: "validated", humanReview: "approved", walrusWrite: "completed" } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Memory write failed." }, { status: 502 });
  }
}
