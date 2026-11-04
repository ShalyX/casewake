import { NextRequest, NextResponse } from "next/server";
import { getTatumTransaction } from "@/lib/tatum";
import { recallIncidentCandidates } from "@/lib/walrus";
import { recallObservedCases } from "@/lib/observations";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  try{
    const body=await request.json() as {digest?:unknown};
    if(typeof body.digest!=="string" || body.digest.length>100)
      return NextResponse.json({error:"Enter a Sui transaction digest."},{status:400});
    const transaction=await getTatumTransaction(body.digest.trim());
    if(transaction.outcome!=="failed")
      return NextResponse.json({transaction,candidates:[],observedPrecedents:[],reason:"Only confirmed failed transactions are eligible for recall."});
    const [candidates,observedPrecedents]=await Promise.all([
      recallIncidentCandidates(transaction),
      recallObservedCases(transaction),
    ]);
    return NextResponse.json({
      transaction,candidates,observedPrecedents,
      reason:candidates.some(c=>c.verdict==="eligible-for-review")
        ?"A compatible human-verified resolution exists for review."
        :observedPrecedents.length
        ?"Similar genuine onchain failures were previously observed. No engineering resolution is verified yet."
        :"No compatible previously verified resolution or failure observation was found.",
    });
  }catch{
    return NextResponse.json({error:"Transaction lookup or Mainnet recall failed."},{status:502});
  }
}
