import { NextRequest, NextResponse } from "next/server";
import { getTatumTransaction } from "@/lib/tatum";
import { recallAllPrecedents } from "@/lib/unified-recall";
import { isAllowedPublicDemoDigest, isReviewerKeyValid } from "@/lib/public-demo";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: NextRequest) {
  let digest: string;
  try {
    const body = await request.json() as { digest?: unknown };
    if (typeof body.digest !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(body.digest)) {
      return NextResponse.json({error:"Enter a valid Sui transaction digest."},{status:400});
    }
    digest = body.digest;
    if (!isAllowedPublicDemoDigest(digest, isReviewerKeyValid(request.headers.get("x-workspace-key")))) {
      return NextResponse.json({error:"Only the published real evidence examples are available in the public demo. Reviewer access enables other digests."},{status:403});
    }
  } catch {
    return NextResponse.json({error:"Invalid request body."},{status:400});
  }

  let transaction: Awaited<ReturnType<typeof getTatumTransaction>>;
  try {
    transaction = await getTatumTransaction(digest);
  } catch (error) {
    console.error("[incident-recall] Tatum lookup failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({error:"Tatum transaction lookup temporarily unavailable."},{status:502});
  }

  if (transaction.outcome !== "failed") {
    return NextResponse.json({
      transaction,candidates:[],observedPrecedents:[],simulationRunbooks:[],
      recallDegraded:false,walrusHitsExamined:0,
      reason: transaction.outcome === "succeeded"
        ? "This transaction succeeded. Casewake only recalls resolution precedents for confirmed onchain failures."
        : transaction.outcomeReason || "Tatum could not establish a finalized execution outcome. Casewake will not infer success or failure, and no resolution recall is attempted.",
    });
  }

  try {
    const results = await recallAllPrecedents(transaction);
    const { candidates, observedPrecedents, simulationRunbooks } = results;
    const reason = candidates.some(c=>c.verdict==="eligible-for-review")
      ? "A compatible human-reviewed resolution exists for review."
      : simulationRunbooks.length
      ? "A controlled Mainnet simulation reproduced the error and validated a correction. This is guidance for review, NOT a proven repair of the historical transaction."
      : observedPrecedents.length
      ? "Similar real onchain failures were observed before. No resolution has been independently verified for these historical transactions."
      : "No compatible saved precedent or simulation-tested procedure was found in the returned Walrus results.";
    return NextResponse.json({
      transaction, ...results, recallDegraded:false, reason,
    });
  } catch (error) {
    // Separate Walrus degradation from actual Tatum transaction evidence.
    // Only error class is logged; credentials and server responses are not.
    console.error("[incident-recall] Walrus read failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({
      transaction,candidates:[],observedPrecedents:[],simulationRunbooks:[],
      walrusHitsExamined:0,recallDegraded:true,
      reason:"Walrus recall is temporarily unavailable. Tatum transaction evidence is still valid; no conclusion can be drawn about stored matching cases.",
    });
  }
}
