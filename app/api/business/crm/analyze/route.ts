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

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lead = body?.lead as CrmLeadPayload | undefined;
    if (!lead?.name || !lead?.company) {
      return NextResponse.json({ error: "lead.name and lead.company are required" }, { status: 422 });
    }

    const prompt = `You are a CRM scoring engine. Return ONLY valid JSON (no markdown).
Schema:
{
  "aiSummary": "2 sentences about this lead's intent and fit",
  "nextAction": "one concrete next step",
  "score": 0-100,
  "buyingIntent": 0-100,
  "engagementScore": 0-100,
  "conversionProbability": 0-100,
  "fitScore": 0-100,
  "priority": "high"|"medium"|"low",
  "suggestedStatus": "new"|"contacted"|"qualified"|"nurturing"|"proposal"|"won"|"lost",
  "tags": ["tag1","tag2"]
}

Base scores on the lead fields provided. Be realistic.

LEAD:
${leadBrief(lead)}
`;

    const raw = await ollamaGenerate(prompt, { json: true, temperature: 0.4, numPredict: 500 });
    const parsed = parseJsonObject(raw);

    const priorityRaw = String(parsed.priority || lead.priority || "medium").toLowerCase();
    const priority = (["high", "medium", "low"].includes(priorityRaw) ? priorityRaw : "medium") as
      | "high"
      | "medium"
      | "low";

    const suggestedStatus = String(parsed.suggestedStatus || lead.status || "new");
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.map((t) => String(t)).filter(Boolean).slice(0, 6)
      : lead.tags || [];

    return NextResponse.json({
      source: "ollama",
      aiSummary: String(parsed.aiSummary || lead.aiSummary || "").slice(0, 400),
      nextAction: String(parsed.nextAction || lead.nextAction || "Send follow-up").slice(0, 120),
      score: clamp(Number(parsed.score ?? lead.score ?? 50)),
      buyingIntent: clamp(Number(parsed.buyingIntent ?? lead.buyingIntent ?? 50)),
      engagementScore: clamp(Number(parsed.engagementScore ?? lead.engagementScore ?? 50)),
      conversionProbability: clamp(Number(parsed.conversionProbability ?? 45)),
      fitScore: clamp(Number(parsed.fitScore ?? lead.fitScore ?? 50)),
      priority,
      suggestedStatus,
      tags,
    });
  } catch (err) {
    if (err instanceof OllamaUnavailable) {
      return NextResponse.json({ error: err.message, source: "fallback" }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lead analysis failed" },
      { status: 500 },
    );
  }
}
