const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001').replace(/\/$/, '');

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
  return `${API_BASE_URL}${path}`;
}

async function readErrorMessage(response: Response) {
  const text = await response.text();
  if (!text) return `Request failed with status ${response.status}`;
  try {
    const parsed = JSON.parse(text) as ApiErrorBody;
    if (typeof parsed.detail === 'string') return parsed.detail;
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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  return response.json() as Promise<T>;
}

export async function generateOutline(input: {
  source: string;
  content: string;
  slideCount: number;
  speakerNotes: boolean;
}): Promise<{ slides: OutlineSlide[]; design_suggestions: string[] }> {
  return postJson('/api/outline', {
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
}): Promise<{ slides: GeneratedSlide[] }> {
  return postJson('/api/generate-slides', {
    source: input.source,
    content: input.content,
    speaker_notes: input.speakerNotes,
    outline: input.outline,
  });
}

/** Optional: hit the shared photo-editor image API for slide visuals */
const IMAGE_API_BASE = (import.meta.env.VITE_IMAGE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export async function generateImage(input: {
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
}): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('prompt', input.prompt);
  if (typeof input.width === 'number') formData.append('width', String(input.width));
  if (typeof input.height === 'number') formData.append('height', String(input.height));
  if (typeof input.steps === 'number') formData.append('steps', String(input.steps));
  const response = await fetch(`${IMAGE_API_BASE}/api/generate`, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  return response.json();
}
