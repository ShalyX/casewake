import { NextRequest, NextResponse } from "next/server";
import { getTatumTransaction, ConfigurationError } from "@/lib/tatum";
import { isAllowedPublicDemoDigest, isPublicDemoMode, isReviewerKeyValid } from "@/lib/public-demo";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { digest?: unknown };
    if (typeof body.digest !== "string" || body.digest.length > 100)
      return NextResponse.json({ error: "Enter a Sui transaction digest." }, { status: 400 });
    const digest = body.digest.trim();
    if (!isAllowedPublicDemoDigest(digest, isReviewerKeyValid(request.headers.get("x-workspace-key"))))
      return NextResponse.json({error:"The public demo only supports the three displayed real transaction examples. Private operator mode supports other digests."},{status:403});
    const transaction = await getTatumTransaction(digest);
    return NextResponse.json({ transaction });
  } catch (error) {
    return NextResponse.json({
      error: isPublicDemoMode() ? "The Sui gateway is temporarily unavailable. Retry the example." : error instanceof ConfigurationError ? error.message
        : error instanceof Error ? error.message : "Unable to look up this transaction.",
    }, { status: error instanceof ConfigurationError ? 503 : 422 });
  }
}
