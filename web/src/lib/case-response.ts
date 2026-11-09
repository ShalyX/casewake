import type {CaseCatalog,ReviewedLibraryCase} from './case-discovery';
type Hit={record:ReviewedLibraryCase;matchedTerms:string[];relationship:'related-only'};
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
function record(v:unknown):v is ReviewedLibraryCase{
  if(!object(v))return false;
  const fields=['id','blobId','namespace','sourceDigest','network','title','diagnosis','procedure','errorText','reviewer','reviewedAt','evidenceUrl','evidenceScope'];
  if(!fields.every(k=>typeof v[k]==='string'&&v[k].length>0)||v.network!=='sui-mainnet'||!Number.isFinite(Date.parse(String(v.reviewedAt))))return false;
  if(!['human-reviewed-engineering-artifact','human-reviewed-successor-transaction','full-flashloan-route-repair'].includes(String(v.evidenceScope)))return false;
  if(![v.packageId,v.sdkVersion].every(x=>x===null||typeof x==='string'))return false;
  try{const url=new URL(String(v.evidenceUrl));return url.protocol==='https:'&&!url.username&&!url.password;}catch{return false;}
}
/** A broken service response is unavailable, never evidence that the library is empty. */
export function parseCaseResponse(value:unknown,search:boolean):{catalog:CaseCatalog;hits:Hit[]}{
  const fail=()=>{throw new Error('The reviewed-case service returned an invalid response. Retry the read.');};
  if(!object(value))return fail();
  if(typeof value.namespace!=='string'||!value.namespace||typeof value.checkedAt!=='string'||!Number.isFinite(Date.parse(value.checkedAt))||typeof value.coverageComplete!=='boolean'||
    !Number.isSafeInteger(value.completedRecordsExamined)||Number(value.completedRecordsExamined)<0||!Number.isSafeInteger(value.recordsNotRetrieved)||Number(value.recordsNotRetrieved)<0||Number(value.recordsNotRetrieved)>Number(value.completedRecordsExamined)||
    (value.coverageComplete&&value.recordsNotRetrieved!==0))return fail();
  const list=search?value.results:value.cases;if(!Array.isArray(list))return fail();
  if(search){if(!list.every(h=>object(h)&&record(h.record)&&h.relationship==='related-only'&&Array.isArray(h.matchedTerms)&&h.matchedTerms.every(t=>typeof t==='string')))return fail();}
  else if(!list.every(record))return fail();
  const hits:Hit[]=search?list as Hit[]:(list as ReviewedLibraryCase[]).map(record=>({record,matchedTerms:[],relationship:'related-only'}));
  if(hits.length>Number(value.completedRecordsExamined)||hits.some(h=>h.record.namespace!==value.namespace)||new Set(hits.map(h=>h.record.id)).size!==hits.length)return fail();
  return {catalog:{namespace:value.namespace,checkedAt:value.checkedAt,coverageComplete:value.coverageComplete,completedRecordsExamined:Number(value.completedRecordsExamined),recordsNotRetrieved:Number(value.recordsNotRetrieved),cases:hits.map(h=>h.record)},hits};
}
