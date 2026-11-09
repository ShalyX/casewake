export type StorageReceipt = {jobId:string;blobId:string;namespace:string;owner?:string;status?:string};
export type StorageAttempt = {
  sourceDigest:string; kind:"resolution"|"observation"; requestId:string;
  jobId?:string; namespace?:string; receipt?:StorageReceipt;
};
export const STORAGE_SESSION_KEY = "casewake-storage-v1";
const bounded=(v:unknown,max=256):v is string=>typeof v==="string"&&v.trim().length>0&&v.length<=max;
export function parseStorageReceipt(value:unknown):StorageReceipt|null{
  if(!value||typeof value!=="object"||Array.isArray(value))return null;
  const r=value as Record<string,unknown>;
  if(!bounded(r.blobId)||!bounded(r.jobId)||!bounded(r.namespace,128)||(r.status!==undefined&&r.status!=="mainnet-stored"))return null;
  return {blobId:r.blobId,jobId:r.jobId,namespace:r.namespace,...(r.status==="mainnet-stored"?{status:r.status}:{})};
}
export function decodeStorageAttempt(text: string | null): StorageAttempt | null {
  try {
    if (!text) return null;
    const value = JSON.parse(text) as StorageAttempt;
    if (!value||typeof value!=="object"||Array.isArray(value)||
        typeof value.sourceDigest!=="string"||typeof value.requestId!=="string"||
        !/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(value.sourceDigest) ||
        !/^[a-f0-9-]{36}$/i.test(value.requestId) || !["resolution","observation"].includes(value.kind)) return null;
    if(value.jobId!==undefined&&!bounded(value.jobId))return null;
    if(value.namespace!==undefined&&!bounded(value.namespace,128))return null;
    if (value.receipt && (!parseStorageReceipt(value.receipt)||
        (value.jobId!==undefined&&value.jobId!==value.receipt.jobId)||(value.namespace!==undefined&&value.namespace!==value.receipt.namespace))) return null;
    return {sourceDigest:value.sourceDigest,kind:value.kind,requestId:value.requestId,
      ...(value.jobId?{jobId:value.jobId}:{}),...(value.namespace?{namespace:value.namespace}:{}),
      ...(value.receipt?{receipt:{jobId:value.receipt.jobId,blobId:value.receipt.blobId,namespace:value.receipt.namespace}}:{})};
  } catch { return null; }
}
