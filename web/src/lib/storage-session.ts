export type StorageReceipt = {jobId:string;blobId:string;namespace:string;owner?:string;status?:string};
export type StorageAttempt = {
  sourceDigest:string; kind:"resolution"|"observation"; requestId:string;
  jobId?:string; namespace?:string; receipt?:StorageReceipt;
};
export const STORAGE_SESSION_KEY = "casewake-storage-v1";
export function decodeStorageAttempt(text: string | null): StorageAttempt | null {
  try {
    if (!text) return null;
    const value = JSON.parse(text) as StorageAttempt;
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(value.sourceDigest) ||
        !/^[a-f0-9-]{36}$/i.test(value.requestId) || !["resolution","observation"].includes(value.kind)) return null;
    if (value.receipt && (!value.receipt.blobId || !value.receipt.jobId || !value.receipt.namespace)) return null;
    return {sourceDigest:value.sourceDigest,kind:value.kind,requestId:value.requestId,
      ...(value.jobId?{jobId:value.jobId}:{}),...(value.namespace?{namespace:value.namespace}:{}),
      ...(value.receipt?{receipt:{jobId:value.receipt.jobId,blobId:value.receipt.blobId,namespace:value.receipt.namespace,status:value.receipt.status}}:{})};
  } catch { return null; }
}
