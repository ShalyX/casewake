import { NextRequest, NextResponse } from "next/server";
import { isReviewerKeyValid } from "@/lib/public-demo";
import { getTatumTransaction } from "@/lib/tatum";
import { recallAllPrecedents } from "@/lib/unified-recall";
import { DEEPBOOK_SOURCE_DIGEST } from "@/lib/guard-evidence";
import { isLaterCheckpoint } from "@/lib/incidents";

export const runtime = "nodejs";
export const maxDuration = 90;

const SECOND_INCIDENT = "XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue";

// An actual new Tatum lookup plus signed MemWal recall, never an in-memory mock.
// Gate 3 passes only when the exact stored Walrus blob reappears for a *different*
// comparable failed transaction with a reviewer-eligible case.
export async function POST(request: NextRequest) {
  if (!isReviewerKeyValid(request.headers.get("x-workspace-key"))) {
    return NextResponse.json({ error: "Reviewer authorization required for production recall acceptance." }, { status: 403 });
  }
  try {
    const body = await request.json() as Record<string, unknown>;
    const sourceDigest = body.sourceDigest;
    const secondDigest = body.secondDigest;
    const strictDeepbook = sourceDigest === DEEPBOOK_SOURCE_DIGEST;
    if (typeof sourceDigest !== "string" || typeof secondDigest !== "string" ||
        !/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(sourceDigest) ||
        !/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(secondDigest) ||
        sourceDigest === secondDigest ||
        (strictDeepbook && secondDigest !== SECOND_INCIDENT) ||
        typeof body.expectedBlobId !== "string" ||
        body.expectedBlobId.length < 20 || body.expectedBlobId.length > 256) {
      return NextResponse.json({ error: "A distinct genuine recurrence and completed Walrus blob ID are required. DeepBook must use its locked independent recurrence." }, { status: 400 });
    }
    const second = await getTatumTransaction(secondDigest);
    if (second.outcome !== "failed" ||
        (strictDeepbook && (second.failedCommandIndex !== 16 || second.failedCommandKind !== "splitCoins" || !second.errorText?.includes("InsufficientCoinBalance")))) {
      return NextResponse.json({ error: "The second real transaction is not a compatible onchain failure." }, { status: 409 });
    }
    const recall = await recallAllPrecedents(second);
    const match = recall.candidates.find(candidate => {
      const evidence = candidate.record.validatedEvidence;
      const genericProof = (
        candidate.record.resolutionKind === "onchain-successor" &&
        evidence?.scope === "human-reviewed-successor-transaction" &&
        evidence.reviewerConfirmedCausality === true
      ) || (
        candidate.record.resolutionKind === "reviewed-evidence" &&
        evidence?.scope === "human-reviewed-engineering-artifact" &&
        evidence.reviewerConfirmedCausality === true
      );
      const laterThanSource = strictDeepbook || (
        !!evidence && "originalCheckpoint" in evidence &&
        "originalTimestampMs" in evidence &&
        typeof evidence.originalCheckpoint === "string" &&
        typeof evidence.originalTimestampMs === "number" &&
        Number.isFinite(second.transactionTimestampMs) &&
        second.transactionTimestampMs! >= evidence.originalTimestampMs &&
        isLaterCheckpoint(evidence.originalCheckpoint, second.checkpoint)
      );
      return candidate.record.digest === sourceDigest &&
        (strictDeepbook
          ? candidate.record.resolutionKind === "route-repair" &&
            evidence?.scope === "full-flashloan-route-repair" &&
            evidence.originalHistoricalRouteRepaired === true
          : genericProof && laterThanSource) &&
        candidate.verdict === "eligible-for-review" &&
        candidate.walrusReceipt?.blobId === body.expectedBlobId;
    });
    if (!match) {
      return NextResponse.json({
        error: "Gate 3 not yet proven: Walrus did not return the exact reviewed resolution blob as an eligible precedent for the second incident.",
        secondDigest: second.digest,
        walrusHitsExamined: recall.walrusHitsExamined,
      }, { status: 409 });
    }
    return NextResponse.json({
      gate3: "verified",
      proofScope: strictDeepbook ? "full-flashloan-route-repair" : String(match.record.validatedEvidence?.scope || "human-reviewed-resolution"),
      originalThreeHopCorrection: strictDeepbook ? "full-route-simulation-passed" : "not-applicable",
      originalDigest: sourceDigest,
      secondTransaction: second,
      matchedCandidate: match,
      walrusReceipt: match.walrusReceipt,
      walrusHitsExamined: recall.walrusHitsExamined,
      note: strictDeepbook
        ? "Independent Tatum recurrence recalled the same human-reviewed full-route repair simulation evidence from the exact Walrus blob. The repair passed simulation only; no onchain execution is claimed."
        : match.record.resolutionKind === "reviewed-evidence"
          ? "A distinct later Tatum-confirmed failure recalled the exact Walrus blob containing a human-reviewed GitHub engineering artifact snapshot. The artifact hash and verification method are preserved; causal relevance remains the reviewer's attested judgment."
          : "A different later Tatum-confirmed onchain failure recalled the same reviewer-attested successful follow-up record from the exact Walrus blob. The onchain success is independently observed; causal relevance remains a human-reviewed claim.",
    });
  } catch (error) {
    console.error("[casewake-three-gates] proof unavailable", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "Gate 3 could not complete the live Tatum and Walrus verification. It remains unproven." }, { status: 502 });
  }
}
