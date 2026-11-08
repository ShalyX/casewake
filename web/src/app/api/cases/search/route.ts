import { NextRequest,NextResponse } from "next/server";
import { getReviewedCatalog } from "@/lib/reviewed-catalog";
import { searchReviewedCases } from "@/lib/case-discovery";
export const runtime='nodejs';
export const maxDuration=90;
export async function POST(request:NextRequest){
  let query:string;
  try{const body=await request.json() as {query?:unknown};
    if(typeof body.query!=='string'||body.query.trim().length<3||body.query.length>2000)return NextResponse.json({error:'Enter 3–2,000 characters of error text, a module name or a procedure.'},{status:400});
    query=body.query.trim();
  }catch{return NextResponse.json({error:'Enter error text to search.'},{status:400});}
  try{
    const catalog=await getReviewedCatalog();
    // Query text is searched in this process; never stored or sent to a write API.
    return NextResponse.json({...catalog,cases:undefined,results:searchReviewedCases(catalog.cases,query),relationship:'related-only',searchMethod:'error-text-and-keyword'},{headers:{'cache-control':'no-store'}});
  }catch{return NextResponse.json({error:'Reviewed-case search is temporarily unavailable. This does not mean there are no related cases.'},{status:503});}
}
