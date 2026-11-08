import "server-only";
import { secureMemwalClient } from "./memwal-secure";
import { completedBlobIds } from "./completed-inventory";
import { retryReadOnly } from "./retry-reads";
import { decodeMemory } from "./incidents";
import { reviewedLibraryCases,type CaseCatalog } from "./case-discovery";

let last:{key:string;until:number;value:CaseCatalog}|null=null;
let pending:{key:string;promise:Promise<CaseCatalog>}|null=null;
async function readCatalog(namespace:string):Promise<CaseCatalog>{
  const client=await secureMemwalClient();
  const active=new Set<string>();let cursor:string|undefined;let inventoryComplete=false;
  for(let page=0;page<10;page++){
    const result=await retryReadOnly(()=>client.listMemories({namespace,cursor,limit:100}));
    if(result.must_resync)throw new Error('Catalogue snapshot needs a fresh inventory read.');
    for(const id of completedBlobIds(result.memories))active.add(id);
    if(!result.has_more){inventoryComplete=true;break;}
    if(!result.next_cursor||result.next_cursor===cursor)break;
    cursor=result.next_cursor;
  }
  // The SDK lists metadata only. Retrieve content separately and measure coverage;
  // similarity-ranked recall is never assumed to enumerate the entire namespace.
  const recalled=active.size?await retryReadOnly(()=>client.recall({namespace,query:'SUI_INCIDENT_MEMORY_V1 human-reviewed engineering resolutions with diagnosis error text procedure and original evidence',limit:Math.min(active.size,100)})):{results:[]};
  const hits=recalled.results||[];
  const retrieved=new Set(hits.filter(h=>h.blob_id&&active.has(h.blob_id)).map(h=>h.blob_id));
  return {cases:reviewedLibraryCases(hits,active,namespace,decodeMemory),namespace,checkedAt:new Date().toISOString(),coverageComplete:inventoryComplete&&retrieved.size===active.size,completedRecordsExamined:active.size,recordsNotRetrieved:active.size-retrieved.size};
}
export async function getReviewedCatalog():Promise<CaseCatalog>{
  const namespace=process.env.MEMWAL_NAMESPACE||'incident-memory-v1';
  const key=[process.env.MEMWAL_ACCOUNT_ID,namespace].join(':');
  if(last?.key===key&&last.until>Date.now())return last.value;
  if(pending?.key===key)return pending.promise;
  const promise=readCatalog(namespace).then(value=>{last={key,until:Date.now()+60000,value};return value;});
  pending={key,promise};
  try{return await promise;}finally{if(pending?.promise===promise)pending=null;}
}
