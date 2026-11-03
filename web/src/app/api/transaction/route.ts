import { NextRequest, NextResponse } from "next/server";
import { getTatumTransaction, ConfigurationError } from "@/lib/tatum";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { digest?: unknown };
    if (typeof body.digest !== "string" || body.digest.length > 100)
      return NextResponse.json({ error: "Enter a Sui transaction digest." }, { status: 400 });
    const transaction = await getTatumTransaction(body.digest.trim());
    return NextResponse.json({ transaction });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof ConfigurationError ? error.message
        : error instanceof Error ? error.message : "Unable to look up this transaction.",
    }, { status: error instanceof ConfigurationError ? 503 : 422 });
  }
}
