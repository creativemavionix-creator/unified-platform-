/**
 * Server-side Ollama helper for CRM AI endpoints.
 */
const OLLAMA_URL = (process.env.OLLAMA_URL ?? "http://127.0.0.1:11434/api/generate").replace(/\/$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3:8b";
const OLLAMA_TIMEOUT_MS = Number(process.env.CRM_OLLAMA_TIMEOUT_MS ?? 90000);

export class OllamaUnavailable extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OllamaUnavailable";
  }
}

export async function ollamaGenerate(
  prompt: string,
  options?: { json?: boolean; temperature?: number; numPredict?: number },
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  const body: Record<string, unknown> = {
    model: OLLAMA_MODEL,
    prompt,
    stream: false,
    options: {
      temperature: options?.temperature ?? 0.65,
      num_predict: options?.numPredict ?? 1024,
    },
  };
  if (options?.json) body.format = "json";

  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new OllamaUnavailable(`Ollama returned ${res.status}`);
    }
    const data = (await res.json()) as { response?: string };
    return String(data.response ?? "").trim();
  } catch (err) {
    if (err instanceof OllamaUnavailable) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new OllamaUnavailable("Ollama timed out while generating CRM content");
    }
    throw new OllamaUnavailable(
      err instanceof Error ? err.message : "Ollama is unreachable. Run: ollama serve",
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function ollamaHealth(): Promise<"ok" | "unreachable"> {
  try {
    const tagsUrl = OLLAMA_URL.includes("/api/generate")
      ? OLLAMA_URL.replace("/api/generate", "/api/tags")
      : "http://127.0.0.1:11434/api/tags";
    const res = await fetch(tagsUrl, { cache: "no-store", signal: AbortSignal.timeout(2500) });
    return res.ok ? "ok" : "unreachable";
  } catch {
    return "unreachable";
  }
}

export function parseJsonObject(raw: string): Record<string, unknown> {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return JSON");
  }
  return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
}

export type CrmLeadPayload = {
  id?: string;
  name: string;
  company: string;
  title?: string;
  email?: string;
  industry?: string;
  location?: string;
  source?: string;
  status?: string;
  priority?: string;
  score?: number;
  buyingIntent?: number;
  engagementScore?: number;
  fitScore?: number;
  tags?: string[];
  aiSummary?: string;
  nextAction?: string;
};

export function leadBrief(lead: CrmLeadPayload): string {
  return [
    `Name: ${lead.name}`,
    `Company: ${lead.company}`,
    lead.title ? `Title: ${lead.title}` : "",
    lead.industry ? `Industry: ${lead.industry}` : "",
    lead.location ? `Location: ${lead.location}` : "",
    lead.source ? `Source: ${lead.source}` : "",
    lead.status ? `Status: ${lead.status}` : "",
    lead.priority ? `Priority: ${lead.priority}` : "",
    typeof lead.score === "number" ? `Score: ${lead.score}` : "",
    lead.tags?.length ? `Tags: ${lead.tags.join(", ")}` : "",
    lead.aiSummary ? `Known summary: ${lead.aiSummary}` : "",
    lead.nextAction ? `Current next action: ${lead.nextAction}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
