export type ListedMemory={blob_id?:string;status?:string};
/** An accepted/running job is not a completed Mainnet memory. */
export function completedBlobIds(memories:ListedMemory[]):string[]{
  return [...new Set(memories.filter(item=>item.status==="active"&&typeof item.blob_id==="string"&&item.blob_id.length>0).map(item=>item.blob_id!))];
}
