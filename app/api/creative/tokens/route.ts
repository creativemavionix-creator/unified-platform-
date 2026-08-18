import { NextResponse } from "next/server";
import { getServerTokenBalance } from "@/lib/creative-tokens-server";

export async function GET() {
  const balance = await getServerTokenBalance();
  return NextResponse.json({
    used: balance.used,
    limit: balance.limit,
    remaining: balance.remaining,
    resetsInMs: balance.resetsInMs,
  });
}
