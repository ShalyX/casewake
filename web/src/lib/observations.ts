import "server-only";
import { secureMemwalClient } from "./memwal-secure";
import { type ObservedTransaction } from "./incidents";
import { readCompletedInventory } from "./completed-inventory";

export type ObservedCaseMemory = {
  requestId?:string;
  schema: "incident-observation/v1";
  kind: "onchain-observed-not-human-verified";
  digest: string;
  network: "sui-mainnet";
  source: "Tatum Sui gRPC";
  observedAt: string;
  errorText: string;
  fingerprint: string;
  resolutionVerified: false;
  sourceUrl: string;
};

export async function memwalClient() {
  return secureMemwalClient();
}
export function observedCase(tx: ObservedTransaction): ObservedCaseMemory {
  if (tx.outcome !== "failed" || !tx.errorText || !tx.fingerprint) throw new Error("Transaction must be a Tatum-confirmed onchain failure.");
  return {
    schema: "incident-observation/v1",
    kind: "onchain-observed-not-human-verified",
    digest: tx.digest,
    network: tx.network,
    source: tx.source,
    observedAt: tx.observedAt,
    errorText: tx.errorText,
    fingerprint: tx.fingerprint,
    resolutionVerified: false,
    sourceUrl: "https://suivision.xyz/txblock/" + tx.digest,
  };
}
export function encodeObservedCase(c: ObservedCaseMemory): string {
  return "SUI_INCIDENT_OBSERVATION_V1\n" +
    "Factual mainnet failure observation from Tatum; no resolution has been verified. " +
    "Digest: " + c.digest + "; failure: " + c.errorText + "\n" + JSON.stringify(c);
}
export function decodeObservedCase(text: string): ObservedCaseMemory | null {
  if (!text.startsWith("SUI_INCIDENT_OBSERVATION_V1\n")) return null;
  const sep=text.indexOf("\n{");
  if(sep<0) return null;
  try {
    const c=JSON.parse(text.slice(sep+1)) as Partial<ObservedCaseMemory>;
    if(c.schema !== "incident-observation/v1" || c.kind !== "onchain-observed-not-human-verified" ||
       c.network !== "sui-mainnet" || c.resolutionVerified !== false ||
       typeof c.digest !== "string" || typeof c.fingerprint !== "string" ||
       typeof c.errorText !== "string" || !c.sourceUrl?.startsWith("https://suivision.xyz/txblock/")) return null;
    return c as ObservedCaseMemory;
  } catch { return null; }
}
export async function storeObservedCase(tx: ObservedTransaction) {
  const c=observedCase(tx);
  const walrus=await memwalClient();
  const done=await walrus.rememberAndWait(encodeObservedCase(c));
  if(!done.blob_id) throw new Error("No completed Walrus Mainnet storage receipt.");
  return {case:c,proof:{jobId:done.job_id,blobId:done.blob_id,namespace:process.env.MEMWAL_NAMESPACE || "incident-memory-v1"}};
}
export async function beginObservedCase(tx:ObservedTransaction,requestId:string){
  const walrus=await memwalClient();
  const accepted=await walrus.rememberAsync(encodeObservedCase({...observedCase(tx),requestId}),undefined,{dedupe:true,idempotencyKey:"casewake-observation-"+requestId});
  if(!accepted.job_id)throw new Error("Walrus did not return a storage job ID.");
  return {jobId:accepted.job_id,namespace:process.env.MEMWAL_NAMESPACE||"incident-memory-v1",status:"pending" as const};
}
export async function recallObservedCases(tx: ObservedTransaction) {
  if(tx.outcome !== "failed" || !tx.fingerprint || !tx.errorText) return [];
  const walrus=await memwalClient();
  const out=await walrus.recall({query:"Sui onchain failure with technical execution error: "+tx.errorText+" digest "+tx.digest,limit:40});
  return out.results
    .map(x=>{const c=decodeObservedCase(x.text);return c?{case:c,distance:x.distance}:null})
    .filter((x):x is NonNullable<typeof x>=>x!==null)
    .filter(x=>x.case.digest!==tx.digest && x.case.fingerprint===tx.fingerprint && x.case.errorText===tx.errorText)
    .sort((a,b)=>a.distance-b.distance).slice(0,8);
}
export async function memoryInventory() {
  const walrus=await memwalClient();
  const namespace=process.env.MEMWAL_NAMESPACE || "incident-memory-v1";
  return readCompletedInventory(cursor=>walrus.listMemories({namespace,limit:100,cursor}),namespace);
}
