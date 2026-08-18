import type { Lead, AIRecommendation } from "@/components/business/lead-crm/leadCrmMockData";

const API_BASE = "/api/business/crm";

export type CrmLeadInput = Pick<
  Lead,
  | "id"
  | "name"
  | "company"
  | "title"
  | "email"
  | "industry"
  | "location"
  | "source"
  | "status"
  | "priority"
  | "score"
  | "buyingIntent"
  | "engagementScore"
  | "fitScore"
  | "tags"
  | "aiSummary"
  | "nextAction"
>;

async function readError(res: Response) {
  try {
    const data = (await res.json()) as { error?: string };
    if (data?.error) return data.error;
  } catch {
    // ignore
  }
  return `Request failed (${res.status})`;
}

export async function checkCrmHealth(): Promise<{ status: string; ollama: string; model?: string }> {
  const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function generateCrmDraft(input: {
  type: "email" | "whatsapp" | "call";
  lead: CrmLeadInput;
}): Promise<{ draft: string; source: string }> {
  const res = await fetch(`${API_BASE}/draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export type AnalyzeResult = {
  source: string;
  aiSummary: string;
  nextAction: string;
  score: number;
  buyingIntent: number;
  engagementScore: number;
  conversionProbability: number;
  fitScore: number;
  priority: Lead["priority"];
  suggestedStatus: string;
  tags: string[];
};

export async function analyzeCrmLead(lead: CrmLeadInput): Promise<AnalyzeResult> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lead }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function generateCrmRecommendations(
  leads: CrmLeadInput[],
): Promise<{ recommendations: AIRecommendation[]; source: string }> {
  const res = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leads }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function generateCrmCallScript(input: {
  lead: CrmLeadInput;
  title?: string;
}): Promise<{ id: string; title: string; preview: string; source: string }> {
  const res = await fetch(`${API_BASE}/call-script`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function describeCrmWorkflow(input: {
  name?: string;
  trigger?: string;
  action?: string;
  category?: string;
}): Promise<{ description: string; source: string }> {
  const res = await fetch(`${API_BASE}/workflow-describe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}
