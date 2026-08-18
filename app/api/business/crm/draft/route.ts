import { NextRequest, NextResponse } from "next/server";
import { leadBrief, ollamaGenerate, type CrmLeadPayload, OllamaUnavailable } from "@/lib/crm/ollama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DraftType = "email" | "whatsapp" | "call";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = (body?.type || "email") as DraftType;
    const lead = body?.lead as CrmLeadPayload | undefined;
    if (!lead?.name || !lead?.company) {
      return NextResponse.json({ error: "lead.name and lead.company are required" }, { status: 422 });
    }
    if (!["email", "whatsapp", "call"].includes(type)) {
      return NextResponse.json({ error: "type must be email, whatsapp, or call" }, { status: 422 });
    }

    const channel =
      type === "email"
        ? "a personalized cold/warm outreach EMAIL with Subject line"
        : type === "whatsapp"
          ? "a short WhatsApp outreach message (no subject)"
          : "a discovery CALL SCRIPT with Opener / Qualifying questions / Close";

    const prompt = `You are an expert B2B SDR for MaVionix.
Write ${channel} for this lead. Be concrete, professional, and specific to their company/industry.
Do not invent fake metrics. Keep it under 220 words.
Return ONLY the draft text (no markdown fences, no JSON).

LEAD:
${leadBrief(lead)}
`;

    const draft = await ollamaGenerate(prompt, { temperature: 0.7, numPredict: 700, json: false });
    if (!draft) {
      return NextResponse.json({ error: "Empty draft from model" }, { status: 502 });
    }
    return NextResponse.json({ draft, type, source: "ollama" });
  } catch (err) {
    if (err instanceof OllamaUnavailable) {
      return NextResponse.json({ error: err.message, source: "fallback" }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Draft generation failed" },
      { status: 500 },
    );
  }
}
