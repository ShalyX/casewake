import "server-only";
import { secureMemwalClient } from "./memwal-secure";
import { encodeMemory, decodeMemory, assessCase, type ObservedTransaction, type VerifiedCase } from "./incidents";

async function client() {
  return secureMemwalClient();
}

export async function storeVerifiedIncident(record: VerifiedCase) {
  const memwal = await client();
  // Completion proof requires the blob ID; accepted jobs do not count.
  const stored = await memwal.rememberAndWait(encodeMemory(record), undefined, { dedupe: true });
  if (!stored.blob_id) throw new Error("Walrus did not confirm a completed Mainnet memory write.");
  return {
    jobId: stored.job_id, blobId: stored.blob_id,
    owner: stored.owner, namespace: stored.namespace,
    status: "mainnet-stored" as const,
  };
}

export async function beginVerifiedIncident(record: VerifiedCase, requestId:string) {
  const memwal=await client();
  const accepted=await memwal.rememberAsync(encodeMemory(record),undefined,{dedupe:true,idempotencyKey:"casewake-resolution-"+requestId});
  if(!accepted.job_id)throw new Error("Walrus did not return a storage job ID.");
  return {jobId:accepted.job_id,namespace:process.env.MEMWAL_NAMESPACE||"incident-memory-v1",status:"pending" as const};
}

export async function recallIncidentCandidates(observation: ObservedTransaction) {
  if (observation.outcome !== "failed" || !observation.fingerprint) return [];
  const memwal = await client();
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
