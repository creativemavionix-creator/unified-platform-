import { NextRequest, NextResponse } from "next/server";
import {
  leadBrief,
  ollamaGenerate,
  parseJsonObject,
  type CrmLeadPayload,
  OllamaUnavailable,
} from "@/lib/crm/ollama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lead = body?.lead as CrmLeadPayload | undefined;
    const titleHint = String(body?.title || "").trim();
    if (!lead?.name || !lead?.company) {
      return NextResponse.json({ error: "lead.name and lead.company are required" }, { status: 422 });
    }

    const prompt = `You are a sales enablement coach. Return ONLY valid JSON.
Schema: { "title": "short script title", "preview": "full call script with Opener, Discovery questions, Objection handling, Close (under 180 words)" }

${titleHint ? `Preferred angle: ${titleHint}` : "Choose a useful discovery-call angle for this lead."}

LEAD:
${leadBrief(lead)}
`;

    const raw = await ollamaGenerate(prompt, { json: true, temperature: 0.65, numPredict: 700 });
    const parsed = parseJsonObject(raw);
    return NextResponse.json({
      source: "ollama",
      id: `script-${Date.now().toString(36)}`,
      title: String(parsed.title || "Custom discovery script").slice(0, 80),
      preview: String(parsed.preview || "").slice(0, 1200),
    });
  } catch (err) {
    if (err instanceof OllamaUnavailable) {
      return NextResponse.json({ error: err.message, source: "fallback" }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Call script generation failed" },
      { status: 500 },
    );
  }
}
