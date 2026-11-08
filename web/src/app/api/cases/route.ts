import { NextResponse } from "next/server";
import { getReviewedCatalog } from "@/lib/reviewed-catalog";
export const runtime='nodejs';
export const maxDuration=90;
export async function GET(){
  try{return NextResponse.json(await getReviewedCatalog(),{headers:{'cache-control':'no-store'}});}
  catch(error){
    console.error('[case-catalog]',error instanceof Error?error.name:'UnknownError');
    return NextResponse.json({error:'The reviewed-case library is temporarily unavailable. No conclusion about saved cases can be drawn.'},{status:503});
  }
}
