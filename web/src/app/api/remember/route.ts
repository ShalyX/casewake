import { randomUUID, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getTatumTransaction } from "@/lib/tatum";
import { safeText, type VerifiedCase } from "@/lib/incidents";
import { storeVerifiedIncident } from "@/lib/walrus";
import { validateCasewakeEvidence, type ResolutionKind, type ValidatedEvidence } from "@/lib/guard-evidence";
import { ROUTE_INCIDENT_DIGEST, RECALL_TEST_DIGEST, independentlyVerifyRouteRepair } from "@/lib/route-repair-proof";
import { verifyOnchainSuccessor } from "@/lib/successor-evidence";
import { verifyReviewedEvidence } from "@/lib/reviewed-evidence";
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
    const reviewedChange = safeText(body.reviewedChange, 1000);
    const verificationMethod = safeText(body.verificationMethod, 60);
    if (body.verified !== true || diagnosis.length < 20 || resolutionSteps.length < 20 || reviewer.length < 2 ||
        !/^https:\/\/[^\s]+$/i.test(evidenceUrl))
      return NextResponse.json({ error: "Human verification, diagnosis, a concrete resolution, reviewer and HTTPS evidence URL are required." }, { status: 400 });
    const observed = await getTatumTransaction(digest);
    if (observed.outcome !== "failed" || !observed.fingerprint || !observed.errorText)
      return NextResponse.json({ error: "Only a Tatum-confirmed onchain failed transaction can become a verified incident memory." }, { status: 400 });
    // The server inspects the Tatum source and the selected case-specific proof
    // artifact BEFORE touching Walrus. A reviewer checkbox or bare URL alone never passes Gate 2.
    if (observed.digest === RECALL_TEST_DIGEST)
      return NextResponse.json({ error: "This second incident is reserved for independent recall, not resolution storage." }, {status:409});
    if (observed.digest === ROUTE_INCIDENT_DIGEST && resolutionKind !== "route-repair")
      return NextResponse.json({ error: "This DeepBook incident requires the strict full-route three-gate verification; generic evidence cannot bypass it." }, { status: 409 });
    let validatedEvidence: ValidatedEvidence;
    if (resolutionKind === "route-repair") {
      if (observed.digest !== ROUTE_INCIDENT_DIGEST)
        return NextResponse.json({error:"The repair evidence does not belong to this incident."},{status:409});
      try {
        const confirmed = await independentlyVerifyRouteRepair(safeText(body.repairTransactionBcs, 350000));
        validatedEvidence = {...confirmed,schema:"casewake-validated-evidence/v1",scope:"full-flashloan-route-repair",proofType:"mainnet-simulation",originalHistoricalRouteRepaired:true};
      } catch(error) {
        return NextResponse.json({error:"Gate 1 locked: " + (error instanceof Error ? error.message : "Independent flashloan simulation failed.")},{status:409});
      }
    } else if (resolutionKind === "onchain-successor") {
      if (body.confirmedCausalLink !== true)
        return NextResponse.json({ error: "A reviewer must explicitly confirm the specific causal relationship between the failed and successful transaction." }, { status: 400 });
      try {
        validatedEvidence = await verifyOnchainSuccessor(
          observed,
          safeText(body.successorDigest, 100),
          evidenceUrl,
          reviewedChange,
        );
      } catch (error) {
        return NextResponse.json({ error: "General verified-case proof blocked: " + (error instanceof Error ? error.message : "Independent successful execution could not be confirmed.") }, { status: 409 });
      }
    } else if (resolutionKind === "reviewed-evidence") {
      if (body.confirmedCausalLink !== true)
        return NextResponse.json({ error: "A reviewer must explicitly confirm that the linked engineering artifact resolves this specific incident." }, { status: 400 });
      try {
        validatedEvidence = await verifyReviewedEvidence(
          observed, evidenceUrl, reviewedChange, verificationMethod, body.confirmedCausalLink === true,
        );
      } catch (error) {
        return NextResponse.json({ error: "Reviewed engineering evidence blocked: " + (error instanceof Error ? error.message : "The case-specific artifact could not be verified.") }, { status: 409 });
      }
    } else {
      // Historical prevention-only evidence is a runbook, not a verified fix.
      await validateCasewakeEvidence(observed, resolutionKind, evidenceUrl, diagnosis, resolutionSteps);
      return NextResponse.json({ error: "A prevention runbook cannot be saved as a human-verified historical repair." }, { status: 409 });
    }
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
    return NextResponse.json({ record, proof, gates: { proofMethod: validatedEvidence.proofType, guardControlEvidence: "validated", originalThreeHopCorrection: validatedEvidence.originalHistoricalRouteRepaired ? "full-route-simulation-passed" : "not-claimed", humanReview: "approved", walrusWrite: "completed" } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Memory write failed." }, { status: 502 });
  }
}
