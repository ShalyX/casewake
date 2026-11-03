import { NextRequest, NextResponse } from "next/server";
import { getTatumTransaction } from "@/lib/tatum";
import { recallIncidentCandidates } from "@/lib/walrus";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { digest?: unknown };
    if (typeof body.digest !== "string" || body.digest.length > 100)
      return NextResponse.json({ error: "Enter a Sui transaction digest." }, { status: 400 });
    const transaction = await getTatumTransaction(body.digest.trim());
    if (transaction.outcome !== "failed")
      return NextResponse.json({ transaction, candidates: [], reason: "Only confirmed failed transactions are eligible for incident-resolution recall." });
    const candidates = await recallIncidentCandidates(transaction);
    return NextResponse.json({ transaction, candidates,
      reason: candidates.some((c) => c.verdict === "eligible-for-review")
        ? "Relevant, human-reviewed precedent found. This is a recommendation, not a guaranteed fix."
        : "No compatible previously verified resolution was found." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Recall failed." }, { status: 502 });
  }
}
