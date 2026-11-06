import { NextRequest, NextResponse } from "next/server";
import { isReviewerKeyValid } from "@/lib/public-demo";
import { getTatumTransaction } from "@/lib/tatum";
import { recallAllPrecedents } from "@/lib/unified-recall";
import { DEEPBOOK_SOURCE_DIGEST } from "@/lib/guard-evidence";

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
    if (body.sourceDigest !== DEEPBOOK_SOURCE_DIGEST ||
        body.secondDigest !== SECOND_INCIDENT ||
        typeof body.expectedBlobId !== "string" ||
        body.expectedBlobId.length < 20 || body.expectedBlobId.length > 256) {
      return NextResponse.json({ error: "The original digest, independent recurrence and stored Walrus blob ID are required." }, { status: 400 });
    }
    const second = await getTatumTransaction(SECOND_INCIDENT);
    if (second.outcome !== "failed" || second.failedCommandIndex !== 16 ||
        second.failedCommandKind !== "splitCoins" || !second.errorText?.includes("InsufficientCoinBalance")) {
      return NextResponse.json({ error: "Gate 3 blocked: the second real transaction does not verify as a compatible repayment failure." }, { status: 409 });
    }
    const recall = await recallAllPrecedents(second);
    const match = recall.candidates.find(candidate =>
      candidate.record.digest === DEEPBOOK_SOURCE_DIGEST &&
      candidate.verdict === "eligible-for-review" &&
      candidate.walrusReceipt?.blobId === body.expectedBlobId
    );
    if (!match) {
      return NextResponse.json({
        error: "Gate 3 not yet proven: Walrus did not return the exact reviewed resolution blob as an eligible precedent for the second incident.",
        secondDigest: second.digest,
        walrusHitsExamined: recall.walrusHitsExamined,
      }, { status: 409 });
    }
    return NextResponse.json({
      gate3: "verified",
      originalDigest: DEEPBOOK_SOURCE_DIGEST,
      secondTransaction: second,
      matchedCandidate: match,
      walrusReceipt: match.walrusReceipt,
      walrusHitsExamined: recall.walrusHitsExamined,
      note: "Independent Tatum recurrence retrieved the reviewer-approved prevention procedure from the exact Walrus blob. This is not proof the historical swap was repaired.",
    });
  } catch (error) {
    console.error("[casewake-three-gates] proof unavailable", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "Gate 3 could not complete the live Tatum and Walrus verification. It remains unproven." }, { status: 502 });
  }
}
