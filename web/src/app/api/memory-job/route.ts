import { NextRequest, NextResponse } from "next/server";
import { isReviewerKeyValid } from "@/lib/public-demo";
import { secureMemwalClient } from "@/lib/memwal-secure";
import { retryReadOnly } from "@/lib/retry-reads";
import { decodeMemory } from "@/lib/incidents";
import { decodeObservedCase } from "@/lib/observations";
export const runtime="nodejs";
export const maxDuration=30;
export async function GET(request:NextRequest){
  if(!isReviewerKeyValid(request.headers.get("x-workspace-key")))
    return NextResponse.json({error:"Reviewer authorization is required to inspect a storage job."},{status:403});
  const jobId=request.nextUrl.searchParams.get("jobId")||"";
  const sourceDigest=request.nextUrl.searchParams.get("sourceDigest")||"";
  const requestId=request.nextUrl.searchParams.get("requestId")||"";
  const kind=request.nextUrl.searchParams.get("kind")||"resolution";
  if(!/^[a-f0-9-]{36}$/i.test(jobId))return NextResponse.json({error:"Enter a valid storage job ID."},{status:400});
  if(!/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(sourceDigest)||!/^[a-f0-9-]{36}$/i.test(requestId)||!["resolution","observation"].includes(kind))
    return NextResponse.json({error:"The original incident and storage request ID are required to recover its receipt."},{status:400});
  try{
    const client=await secureMemwalClient();
    const job=await retryReadOnly(()=>client.getRememberStatus(jobId));
    if(job.namespace && job.namespace!==(process.env.MEMWAL_NAMESPACE||"incident-memory-v1"))
      return NextResponse.json({error:"This storage job belongs to another workspace."},{status:403});
    if(job.status==="not_found")return NextResponse.json({error:"Storage job not found. No write has been retried."},{status:404});
    if(job.status==="failed")return NextResponse.json({code:"storage-job-failed",error:"The storage job failed. Keep its ID for investigation; no write has been retried."},{status:409});
    if(job.status==="done"&&job.blob_id){
      const recalled=await retryReadOnly(()=>client.recall({query:"Casewake stored incident "+sourceDigest+" request "+requestId,limit:25}));
      const belongs=recalled.results.some(hit=>{
        if(hit.blob_id!==job.blob_id)return false;
        const record=kind==="resolution"?decodeMemory(hit.text):decodeObservedCase(hit.text);
        return record?.digest===sourceDigest&&("id" in record?record.id:record.requestId)===requestId;
      });
      if(!belongs)return NextResponse.json({pending:{jobId,status:"identity-check-pending"},message:"Storage completed, but this job has not yet been matched to the original incident. Do not write another copy."},{status:202});
      return NextResponse.json({proof:{jobId:job.job_id,blobId:job.blob_id,namespace:job.namespace||process.env.MEMWAL_NAMESPACE||"incident-memory-v1",status:"mainnet-stored"}});
    }
    return NextResponse.json({pending:{jobId,status:job.status,namespace:job.namespace||process.env.MEMWAL_NAMESPACE||"incident-memory-v1"}},{status:202});
  }catch{return NextResponse.json({error:"Storage status is temporarily unavailable. No write has been retried."},{status:502});}
}
