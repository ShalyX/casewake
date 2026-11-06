import { NextResponse } from "next/server";
import { getTatumTransaction } from "@/lib/tatum";
import { recallAllPrecedents } from "@/lib/unified-recall";
import { DEEPBOOK_SOURCE_DIGEST, GUARD_EVIDENCE_URL } from "@/lib/guard-evidence";

export const runtime = "nodejs";
export const maxDuration = 90;
const RECURRENCE = "XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue";
const NEGATIVE = "Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp";
const TTL_MS = 90_000;

type Payload = Record<string, unknown>;
let cached: { at: number; payload: Payload } | null = null;

async function inspect() {
  const [original, recurrence, negative] = await Promise.all([
    getTatumTransaction(DEEPBOOK_SOURCE_DIGEST),
    getTatumTransaction(RECURRENCE),
    getTatumTransaction(NEGATIVE),
  ]);
  // Independent sources: fresh chain reads and signed Walrus retrieval. Do not
  // infer a historical route repair from the unrelated successful control.
  const matches = await recallAllPrecedents(recurrence);
  const negativeMatches = negative.outcome === "failed"
    ? await recallAllPrecedents(negative) : null;
  const eligible = matches.candidates.find(c =>
    c.verdict === "eligible-for-review" &&
    c.record.digest === DEEPBOOK_SOURCE_DIGEST &&
    c.record.resolutionKind === "prevention-guard" &&
    c.walrusReceipt?.blobId
  );
  const negativeAccepted = Boolean(negativeMatches?.candidates.some(c =>
    c.verdict === "eligible-for-review" &&
    c.record.digest === DEEPBOOK_SOURCE_DIGEST
  ));
  const comparable = original.outcome === "failed" &&
    recurrence.outcome === "failed" &&
    original.errorText === recurrence.errorText &&
    original.digest !== recurrence.digest &&
    original.failedCommandIndex === 16 &&
    recurrence.failedCommandIndex === 16 &&
    original.failedCommandKind === "splitCoins" &&
    recurrence.failedCommandKind === "splitCoins";

  return {
    audit: "live-tatum-walrus-read-only",
    generatedAt: new Date().toISOString(),
    gate1: {
      state: "partial",
      historicalFailureReproduced: true,
      preSignGuardSimulation: "historical-route-blocked",
      correctedDeepBookControlSimulation: "succeeded",
      originalThreeHopCorrectedSimulation: false,
      immutableEvidence: GUARD_EVIDENCE_URL,
      note: "A successful exact-repayment control is NOT a successful correction of the original three-hop swap.",
    },
    gate2: {
      state: eligible ? "stored-human-reviewed-prevention" : "blocked-pending-successful-original-route-simulation",
      reviewerWrite: eligible ? "confirmed-by-recall" : "not-allowed-with-current-proof",
      walrusBlobId: eligible?.walrusReceipt?.blobId ?? null,
    },
    gate3: {
      state: comparable && eligible && !negativeAccepted ? "verified-repeat-recall" : "blocked-until-gate1-and-gate2-pass",
      originalDigest: original.digest,
      secondDigest: recurrence.digest,
      comparableFailedTransactions: comparable,
      exactRetrievedBlobId: eligible?.walrusReceipt?.blobId ?? null,
      negativeControlExcluded: !negativeAccepted,
      walrusHitsExamined: matches.walrusHitsExamined,
    },
    constraints: {
      historicalRouteRepaired: false,
      signedOrExecuted: false,
      readOnly: true,
      automaticRemediation: false,
    }
  };
}
export async function GET() {
  if (cached && Date.now() - cached.at < TTL_MS) {
    return NextResponse.json(cached.payload);
  }
  try {
    const payload = await inspect();
    cached = { at: Date.now(), payload };
    return NextResponse.json(payload, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[casewake-acceptance] unavailable", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({
      audit: "unavailable",
      gate1: { state: "partial" },
      gate2: { state: "unverified" },
      gate3: { state: "unverified" },
      error: "Live Tatum/Walrus acceptance check unavailable. Never interpret this as a passed gate.",
    }, { status: 502 });
  }
}
