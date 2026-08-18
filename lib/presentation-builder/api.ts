const API_BASE_URL = (
  process.env.NEXT_PUBLIC_PRESENTATION_API_URL ?? "/api/creative/presentation"
).replace(/\/$/, "");

export type OutlineSlide = {
  id: string;
  title: string;
  bullets: string[];
};

export type GeneratedSlide = {
  id: string;
  title: string;
  layout: string;
  subtitle?: string;
  body?: string;
  bullets: string[];
  notes: string;
  image_prompt: string;
  thumb?: string | null;
};

interface ApiErrorBody {
  detail?: string | { msg?: string }[];
  message?: string;
  error?: string;
}

function buildUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

async function readErrorMessage(response: Response) {
  const text = await response.text();
  if (!text) return `Request failed with status ${response.status}`;
  try {
    const parsed = JSON.parse(text) as ApiErrorBody;
    if (typeof parsed.detail === "string") return parsed.detail;
    if (Array.isArray(parsed.detail) && parsed.detail[0]?.msg) return parsed.detail[0].msg as string;
    if (parsed.message) return parsed.message;
    if (parsed.error) return parsed.error;
  } catch {
    // fall through
  }
  return text;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  return response.json() as Promise<T>;
}

export async function checkPresentationHealth(): Promise<{ status: string; ollama: string }> {
  const response = await fetch(buildUrl("/health"), { cache: "no-store" });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  return response.json() as Promise<{ status: string; ollama: string }>;
}

export async function generateOutline(input: {
  source: string;
  content: string;
  slideCount: number;
  speakerNotes: boolean;
}): Promise<{ slides: OutlineSlide[]; design_suggestions: string[]; generation_source?: string }> {
  return postJson("/outline", {
    source: input.source,
    content: input.content,
    slide_count: input.slideCount,
    speaker_notes: input.speakerNotes,
  });
}

export async function generateSlides(input: {
  source: string;
  content: string;
  speakerNotes: boolean;
  outline: OutlineSlide[];
}): Promise<{ slides: GeneratedSlide[]; generation_source?: string }> {
  return postJson("/generate-slides", {
    source: input.source,
    content: input.content,
    speaker_notes: input.speakerNotes,
    outline: input.outline,
  });
}
