import { NextResponse } from "next/server";
import { isPublicDemoMode } from "@/lib/public-demo";
export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({
    tatumConfigured: Boolean(process.env.TATUM_API_KEY),
    walrusConfigured: Boolean(process.env.MEMWAL_PRIVATE_KEY && process.env.MEMWAL_ACCOUNT_ID),
    reviewerWritesEnabled: Boolean(process.env.WORKSPACE_WRITE_KEY),
    publicDemoMode: isPublicDemoMode(),
    network: "sui-mainnet",
    // Configuration presence is not a successful API connection or Mainnet proof.
    checksAreLive: false,
  });
}
