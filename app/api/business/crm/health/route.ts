import { NextResponse } from "next/server";
import { ollamaHealth } from "@/lib/crm/ollama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ollama = await ollamaHealth();
  return NextResponse.json({
    status: "ok",
    ollama,
    model: process.env.OLLAMA_MODEL ?? "llama3:8b",
  });
}
