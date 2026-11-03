import "server-only";
import { MemWal } from "@mysten-incubation/memwal";
import { encodeMemory, decodeMemory, assessCase, type ObservedTransaction, type VerifiedCase } from "./incidents";

function client() {
  const key = process.env.MEMWAL_PRIVATE_KEY?.trim();
  const accountId = process.env.MEMWAL_ACCOUNT_ID?.trim();
  if (!key || !accountId) throw new Error("Walrus Memory credentials missing on server.");
  return MemWal.create({
    key,
    accountId,
    serverUrl: process.env.MEMWAL_SERVER_URL || "https://relayer.memory.walrus.xyz",
    namespace: process.env.MEMWAL_NAMESPACE || "incident-memory-v1",
  });
}

export async function storeVerifiedIncident(record: VerifiedCase) {
  const memwal = client();
  // Completion proof requires the blob ID; accepted jobs do not count.
  const stored = await memwal.rememberAndWait(encodeMemory(record));
  if (!stored.blob_id) throw new Error("Walrus did not confirm a completed Mainnet memory write.");
  return {
    jobId: stored.job_id, blobId: stored.blob_id,
    owner: stored.owner, namespace: stored.namespace,
    status: "mainnet-stored" as const,
  };
}

export async function recallIncidentCandidates(observation: ObservedTransaction) {
  if (observation.outcome !== "failed" || !observation.fingerprint) return [];
  const memwal = client();
  const recalled = await memwal.recall({
    query: "Sui mainnet failed execution with error " + observation.errorText +
      ". Find a human-verified incident and recorded engineering resolution.",
    limit: 30,
  });
  return recalled.results
    .map((hit) => {
      const record = decodeMemory(hit.text);
      return record ? assessCase(observation, record, hit.distance) : null;
    })
    .filter((value) => value !== null)
    .sort((a, b) => {
      if (a.verdict !== b.verdict) return a.verdict === "eligible-for-review" ? -1 : 1;
      return a.distance - b.distance;
    });
}
