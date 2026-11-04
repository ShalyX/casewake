import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getTatumTransaction } from "@/lib/tatum";
import { safeText, type VerifiedCase } from "@/lib/incidents";
import { storeVerifiedIncident } from "@/lib/walrus";
import { isPublicDemoMode } from "@/lib/public-demo";
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  if (isPublicDemoMode()) return NextResponse.json({error:"Public demo is read-only; reviewer storage is disabled."},{status:403});
  const requiredKey = process.env.WORKSPACE_WRITE_KEY;
  if (!requiredKey) return NextResponse.json({ error: "Write access is disabled until WORKSPACE_WRITE_KEY is configured." }, { status: 503 });
  // Reviewer token is never persisted in the browser; this route must remain server-only.
  if (request.headers.get("x-workspace-key") !== requiredKey)
    return NextResponse.json({ error: "Reviewer access token is incorrect." }, { status: 403 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const digest = safeText(body.digest, 100);
    const diagnosis = safeText(body.diagnosis, 800);
    const resolutionSteps = safeText(body.resolutionSteps, 1800);
    const evidenceUrl = safeText(body.evidenceUrl, 500);
    const reviewer = safeText(body.reviewer, 120);
    const sdkVersion = safeText(body.sdkVersion, 80) || null;
    if (body.verified !== true || !diagnosis || resolutionSteps.length < 15 || !reviewer ||
        !/^https:\/\/[^\s]+$/i.test(evidenceUrl))
      return NextResponse.json({ error: "Human verification, diagnosis, a concrete resolution, reviewer and HTTPS evidence URL are required." }, { status: 400 });
    const observed = await getTatumTransaction(digest);
    if (observed.outcome !== "failed" || !observed.fingerprint || !observed.errorText)
      return NextResponse.json({ error: "Only a Tatum-confirmed onchain failed transaction can become a verified incident memory." }, { status: 400 });
    const record: VerifiedCase = {
      schema: "incident-memory/v1", id: randomUUID(),
      digest: observed.digest, network: observed.network,
      fingerprint: observed.fingerprint, errorText: observed.errorText,
      packageId: observed.packageId, sdkVersion, diagnosis,
      resolutionSteps, evidenceUrl, reviewer,
      verifiedAt: new Date().toISOString(), status: "human-verified",
    };
    const proof = await storeVerifiedIncident(record);
    return NextResponse.json({ record, proof }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Memory write failed." }, { status: 502 });
  }
}
