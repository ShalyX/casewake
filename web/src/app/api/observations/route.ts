import { NextRequest, NextResponse } from "next/server";
import { getTatumTransaction } from "@/lib/tatum";
import { storeObservedCase } from "@/lib/observations";
import { isPublicDemoMode } from "@/lib/public-demo";
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  if (isPublicDemoMode()) return NextResponse.json({error:"Public demo is strictly read-only. Memory writes remain disabled."},{status:403});
  if (!process.env.WORKSPACE_WRITE_KEY) return NextResponse.json({error:"Reviewer writes are not configured."},{status:503});
  if (request.headers.get("x-workspace-key") !== process.env.WORKSPACE_WRITE_KEY)
    return NextResponse.json({error:"Reviewer access required."},{status:403});
  try{
    const body=await request.json() as {digest?:unknown};
    if(typeof body.digest!=="string" || !/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(body.digest))
      return NextResponse.json({error:"A valid Sui digest is required."},{status:400});
    const tx=await getTatumTransaction(body.digest);
    if(tx.outcome!=="failed") return NextResponse.json({error:"The chain did not confirm an onchain failure."},{status:400});
    // This is a factual observation only. It does NOT assert a verified fix.
    const stored=await storeObservedCase(tx);
    return NextResponse.json(stored,{status:201});
  }catch{
    return NextResponse.json({error:"Onchain evidence lookup or Mainnet memory write failed."},{status:502});
  }
}
