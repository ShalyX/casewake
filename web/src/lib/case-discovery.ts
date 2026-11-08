import type { VerifiedCase } from "./incidents";

/** Public discovery DTO: a related reviewed record, never a compatibility verdict. */
export type ReviewedLibraryCase = {
  id:string;blobId:string;namespace:string;sourceDigest:string;network:string;
  title:string;diagnosis:string;procedure:string;errorText:string;packageId:string|null;
  sdkVersion:string|null;reviewer:string;reviewedAt:string;evidenceUrl:string;evidenceScope:string;
};
export type CaseCatalog = {
  cases:ReviewedLibraryCase[];namespace:string;checkedAt:string;coverageComplete:boolean;
  completedRecordsExamined:number;recordsNotRetrieved:number;
};
export function reviewedLibraryCases(hits:{text:string;blob_id?:string}[],activeBlobIds:Set<string>,namespace:string,decode:(text:string)=>VerifiedCase|null):ReviewedLibraryCase[]{
  const unique=new Map<string,ReviewedLibraryCase>();
  for(const hit of hits){
    if(!hit.blob_id||!activeBlobIds.has(hit.blob_id)||unique.has(hit.blob_id))continue;
    const record=decode(hit.text);
    // Observations, simulation runbooks and prevention-only guards are not resolutions.
    if(!record||record.resolutionKind==="prevention-guard"||!Number.isFinite(Date.parse(record.verifiedAt)))continue;
    unique.set(hit.blob_id,{
      id:hit.blob_id,blobId:hit.blob_id,namespace,sourceDigest:record.digest,network:record.network,
      title:record.diagnosis.split(/(?<=[.!?])\s/)[0],diagnosis:record.diagnosis,
      procedure:record.resolutionSteps,errorText:record.errorText,
      packageId:typeof record.packageId==="string"?record.packageId:null,
      sdkVersion:typeof record.sdkVersion==="string"?record.sdkVersion:null,
      reviewer:record.reviewer,reviewedAt:record.verifiedAt,evidenceUrl:record.evidenceUrl,
      evidenceScope:record.validatedEvidence.scope,
    });
  }
  return [...unique.values()].sort((a,b)=>Date.parse(b.reviewedAt)-Date.parse(a.reviewedAt)||a.blobId.localeCompare(b.blobId));
}
const stop=new Set(['the','and','for','with','this','that','from','error','failed','failure','transaction','sui','mainnet','code','have','when','what','how','does','into','was','not','are','command','function','instruction','module','identifier','address','some','none','movelocation','moduleid','name','value','kind','index']);
export function searchReviewedCases(cases:ReviewedLibraryCase[],query:string){
  const terms=[...new Set((query.toLowerCase().match(/[a-z0-9_]+/g)||[]).filter(s=>!stop.has(s)&&!/^0x[a-f0-9]{16,}$/.test(s)&&(s.length>=3||/^\d+$/.test(s))))].slice(0,80);
  if(!terms.length)return [];
  return cases.map(record=>{
    const signature=[record.errorText,record.title,record.packageId,record.sdkVersion].join(' ').toLowerCase();
    const prose=[record.diagnosis,record.procedure].join(' ').toLowerCase();
    const matchedTerms=terms.filter(t=>signature.includes(t)||prose.includes(t));
    const score=matchedTerms.reduce((n,t)=>n+(signature.includes(t)?3:1),0);
    return {record,matchedTerms,score,relationship:'related-only' as const};
  }).filter(hit=>hit.matchedTerms.some(t=>/[a-z_]/.test(t))).sort((a,b)=>b.score-a.score||a.record.id.localeCompare(b.record.id));
}
