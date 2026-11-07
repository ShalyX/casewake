import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getTatumTransaction } from "@/lib/tatum";
import { storeObservedCase, beginObservedCase } from "@/lib/observations";
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  if (!process.env.WORKSPACE_WRITE_KEY) return NextResponse.json({error:"Reviewer writes are not configured."},{status:503});
  const suppliedKey = Buffer.from(request.headers.get("x-workspace-key") || "", "utf8");
  const expectedKey = Buffer.from(process.env.WORKSPACE_WRITE_KEY, "utf8");
  if (suppliedKey.length !== expectedKey.length || !timingSafeEqual(suppliedKey, expectedKey))
    return NextResponse.json({error:"Reviewer access required."},{status:403});
  try{
    const body=await request.json() as {digest?:unknown;asyncWrite?:unknown;requestId?:unknown};
    if(typeof body.digest!=="string" || !/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(body.digest))
      return NextResponse.json({error:"A valid Sui digest is required."},{status:400});
    if(body.asyncWrite===true&&(typeof body.requestId!=="string"||!/^[a-f0-9-]{36}$/i.test(body.requestId)))
      return NextResponse.json({error:"A stable storage request ID is required."},{status:400});
    const tx=await getTatumTransaction(body.digest);
    if(tx.outcome!=="failed") return NextResponse.json({error:"The chain did not confirm an onchain failure."},{status:400});
    // This is a factual observation only. It does NOT assert a verified fix.
    if(body.asyncWrite===true)return NextResponse.json({pending:await beginObservedCase(tx,String(body.requestId))},{status:202});
    const stored=await storeObservedCase(tx);
    return NextResponse.json(stored,{status:201});
  }catch{
    return NextResponse.json({error:"Onchain evidence lookup or Mainnet memory write failed."},{status:502});
  }
}
