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
    const leads = (body?.leads || []) as CrmLeadPayload[];
    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "leads array is required" }, { status: 422 });
    }

    const sample = leads.slice(0, 8);
    const blob = sample.map((l, i) => `Lead ${i + 1} (id=${l.id || `lead-${i + 1}`}):\n${leadBrief(l)}`).join("\n\n");

    const prompt = `You are an AI SDR supervisor. Return ONLY valid JSON.
Schema:
{
  "recommendations": [
    {
      "id": "r1",
      "leadName": "string",
      "leadId": "string",
      "message": "why this needs human attention",
      "action": "concrete suggested action",
      "priority": "high"|"medium"|"low"
    }
  ]
}

Create 3 to 5 recommendations for the highest-urgency leads below.
Use real lead names/ids from the list.

LEADS:
${blob}
`;

    const raw = await ollamaGenerate(prompt, { json: true, temperature: 0.5, numPredict: 900 });
    const parsed = parseJsonObject(raw);
    const list = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];

    const recommendations = list
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item, i) => ({
        id: String(item.id || `ai-r-${Date.now()}-${i}`),
        leadName: String(item.leadName || "Unknown"),
        leadId: String(item.leadId || sample[i % sample.length]?.id || ""),
        message: String(item.message || "").slice(0, 240),
        action: String(item.action || "Follow up").slice(0, 120),
        priority: (["high", "medium", "low"].includes(String(item.priority))
          ? String(item.priority)
          : "medium") as "high" | "medium" | "low",
      }))
      .filter((r) => r.message && r.leadName);

    return NextResponse.json({ source: "ollama", recommendations });
  } catch (err) {
    if (err instanceof OllamaUnavailable) {
      return NextResponse.json({ error: err.message, source: "fallback" }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Recommendation generation failed" },
      { status: 500 },
    );
  }
}
