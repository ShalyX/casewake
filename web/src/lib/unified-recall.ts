import "server-only";
import { secureMemwalClient } from "./memwal-secure";
import { retryReadOnly } from "./retry-reads";
import { decodeMemory, assessCase, type Candidate, type ObservedTransaction } from "./incidents";
import { decodeObservedCase, type ObservedCaseMemory } from "./observations";
import { decodeRunbook, assessSimulationRunbook, type SimulationCandidate } from "./simulation-runbooks";

export type ObservedPrecedent = {
  case: ObservedCaseMemory;
  distance: number;
};

export type AllRecallResults = {
  candidates: Candidate[];
  observedPrecedents: ObservedPrecedent[];
  simulationRunbooks: SimulationCandidate[];
  walrusHitsExamined: number;
};

/**
 * One signed Walrus recall per investigated transaction, with deterministic
 * evidence-tier classification after retrieval. This avoids three competing
 * encrypted requests on the same relayer/client.
 */
export async function recallAllPrecedents(tx: ObservedTransaction): Promise<AllRecallResults> {
  const empty: AllRecallResults = {
    candidates: [], observedPrecedents: [], simulationRunbooks: [], walrusHitsExamined: 0,
  };
  if (tx.outcome !== "failed" || !tx.errorText || !tx.fingerprint) return empty;

  const memwal = await secureMemwalClient();
  const query = [
    "Sui Mainnet onchain execution failure", tx.errorText,
    tx.failedCommandKind || "",
    "human-reviewed resolution, independently corroborated successful follow-up,",
    "same error fingerprint, past observed failure or simulation-tested troubleshooting runbook",
  ].join(" ");

  // Twelve total memories were known at the last independently verified check.
  // A single 25-hit search covers this small workspace without 3 x 30-75 requests.
  const result = await retryReadOnly(() => memwal.recall({ query, limit: 25 }));
  const hits = result.results || [];
  const candidates: Candidate[] = [];
  const observedPrecedents: ObservedPrecedent[] = [];
  const simulationRunbooks: SimulationCandidate[] = [];
  const seen = new Set<string>();

  for (const hit of hits) {
    if (!hit || typeof hit.text !== "string") continue;
    const distance = Number(hit.distance || 0);
    const verified = decodeMemory(hit.text);
    if (verified) {
      if (!seen.has("v:" + verified.id)) {
        seen.add("v:" + verified.id);
        if (typeof hit.blob_id === "string" && hit.blob_id.length > 0) {
          candidates.push({ ...assessCase(tx, verified, distance),
            walrusReceipt: { blobId: hit.blob_id,
              namespace: process.env.MEMWAL_NAMESPACE || "incident-memory-v1",
              verifiedThrough: "signed-walrus-recall" } });
        }
      }
      continue;
    }
    const observed = decodeObservedCase(hit.text);
    if (observed) {
      if (observed.digest !== tx.digest &&
          observed.network === tx.network &&
          observed.fingerprint === tx.fingerprint &&
          observed.errorText === tx.errorText &&
          !seen.has("o:" + observed.digest)) {
        seen.add("o:" + observed.digest);
        observedPrecedents.push({ case: observed, distance });
      }
      continue;
    }
    const runbook = decodeRunbook(hit.text);
    if (runbook) {
      const match = assessSimulationRunbook(tx, runbook, distance);
      if (match && !seen.has("s:" + runbook.id)) {
        seen.add("s:" + runbook.id);
        simulationRunbooks.push(match);
      }
    }
  }
  candidates.sort((a,b) =>
    a.verdict === b.verdict ? a.distance - b.distance :
    a.verdict === "eligible-for-review" ? -1 : 1
  );
  observedPrecedents.sort((a,b) => a.distance - b.distance);
  simulationRunbooks.sort((a,b) => a.distance - b.distance);
  return {
    candidates: candidates.slice(0, 8),
    observedPrecedents: observedPrecedents.slice(0, 8),
    simulationRunbooks: simulationRunbooks.slice(0, 3),
    walrusHitsExamined: hits.length,
  };
}
