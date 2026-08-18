import { NextRequest, NextResponse } from "next/server";
import { ollamaGenerate, OllamaUnavailable } from "@/lib/crm/ollama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const trigger = String(body?.trigger || "").trim();
    const action = String(body?.action || "").trim();
    const category = String(body?.category || "Lead Nurturing").trim();

    if (!name && !trigger && !action) {
      return NextResponse.json({ error: "Provide name, trigger, or action" }, { status: 422 });
    }

    const prompt = `Write a concise CRM automation workflow description (1–2 sentences, max 40 words).
Name: ${name || "Untitled workflow"}
Category: ${category}
Trigger: ${trigger || "n/a"}
Action: ${action || "n/a"}
Return ONLY the description text.`;

    const description = await ollamaGenerate(prompt, { temperature: 0.5, numPredict: 120, json: false });
    return NextResponse.json({ source: "ollama", description: description.slice(0, 240) });
  } catch (err) {
    if (err instanceof OllamaUnavailable) {
      return NextResponse.json({ error: err.message, source: "fallback" }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Workflow description failed" },
      { status: 500 },
    );
  }
}
