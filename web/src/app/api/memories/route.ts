import { NextResponse } from "next/server";
import { memoryInventory } from "@/lib/observations";
export const runtime = "nodejs";
export const maxDuration=30;
export async function GET(){
  try{
    const result=await memoryInventory();
    return NextResponse.json(result);
  }catch{
    return NextResponse.json({error:"Could not verify Walrus memory inventory."},{status:502});
  }
}
