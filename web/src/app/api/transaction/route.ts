import { NextRequest, NextResponse } from "next/server";
import { getTatumTransaction, ConfigurationError } from "@/lib/tatum";
import { isPublicDemoMode } from "@/lib/public-demo";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  let digest:string;
  try{
    const body=await request.json() as {digest?:unknown};
    if(typeof body.digest!=="string"||!/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(body.digest.trim()))
      return NextResponse.json({error:"Enter a valid Sui transaction digest."},{status:400});
    digest=body.digest.trim();
  }catch{return NextResponse.json({error:"Enter a valid Sui transaction digest."},{status:400});}
  try {
    const transaction = await getTatumTransaction(digest);
    return NextResponse.json({ transaction });
  } catch (error) {
    return NextResponse.json({
      error: isPublicDemoMode() ? "The Sui gateway is temporarily unavailable. Retry the example." : error instanceof ConfigurationError ? error.message
        : error instanceof Error ? error.message : "Unable to look up this transaction.",
    }, { status: error instanceof ConfigurationError ? 503 : 502 });
  }
}
