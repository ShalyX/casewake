import { NextResponse } from "next/server";
import { memoryInventory } from "@/lib/observations";
import { isPublicDemoMode } from "@/lib/public-demo";
export const runtime = "nodejs";
export const maxDuration=30;
let last: { at:number; count:number; namespace:string; complete:boolean } | null=null;
export async function GET(){
  try{
    if(isPublicDemoMode() && last && Date.now()-last.at < 120000) {
      return NextResponse.json({allStoredMemories:last.count,namespace:last.namespace,complete:last.complete});
    }
    const result=await memoryInventory();
    if (isPublicDemoMode()) {
      last={at:Date.now(),count:result.allStoredMemories,namespace:result.namespace,complete:result.complete};
      return NextResponse.json({allStoredMemories:result.allStoredMemories,namespace:result.namespace,complete:result.complete});
    }
    return NextResponse.json(result);
  }catch{
    return NextResponse.json({error:"Could not verify Walrus memory inventory."},{status:502});
  }
}
