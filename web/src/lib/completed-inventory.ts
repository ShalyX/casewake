export type ListedMemory={blob_id?:string;status?:string};
/** An accepted/running job is not a completed Mainnet memory. */
export function completedBlobIds(memories:ListedMemory[]):string[]{
  return [...new Set(memories.filter(item=>item.status==="active"&&typeof item.blob_id==="string"&&item.blob_id.length>0).map(item=>item.blob_id!))];
}

type InventoryPage={memories:ListedMemory[];has_more?:boolean;next_cursor?:string|null;must_resync?:boolean};
/** Count a consistent snapshot; pagination gaps are a lower bound, never a verified total. */
export async function readCompletedInventory(list:(cursor?:string)=>Promise<InventoryPage>,namespace:string){
  let cursor:string|undefined;const seenCursors=new Set<string>();const completed=new Set<string>();
  const snapshot=(complete:boolean)=>({namespace,allStoredMemories:completed.size,sampleBlobIds:[...completed].slice(0,15),complete});
  for(let page=0;page<30;page++){
    const result=await list(cursor);
    if(result.must_resync)throw new Error('Walrus inventory snapshot expired. Retry a fresh read.');
    for(const id of completedBlobIds(result.memories))completed.add(id);
    if(!result.has_more)return snapshot(true);
    if(!result.next_cursor||seenCursors.has(result.next_cursor))return snapshot(false);
    seenCursors.add(result.next_cursor);cursor=result.next_cursor;
  }
  return snapshot(false);
}
