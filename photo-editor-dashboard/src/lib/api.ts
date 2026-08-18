const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export interface ApiImageResponse {
  url: string;
  filename: string;
}

export interface ApiGeneratedImage {
  filename: string;
  url: string;
  operation: 'generate' | 'inpaint' | 'outpaint' | 'remove-background';
  prompt: string;
  created_at: string;
  width: number;
  height: number;
}

interface ApiErrorBody {
  detail?: string | { msg?: string }[];
  message?: string;
}

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function readErrorMessage(response: Response) {
  const text = await response.text();
  if (!text) {
    return `Request failed with status ${response.status}`;
  }

  try {
    const parsed = JSON.parse(text) as ApiErrorBody;
    if (typeof parsed.detail === 'string') return parsed.detail;
    if (Array.isArray(parsed.detail) && parsed.detail[0]?.msg) return parsed.detail[0].msg as string;
    if (parsed.message) return parsed.message;
  } catch {
    // Fall back to raw text below.
  }

  return text;
}

async function parseImageResponse(response: Response): Promise<ApiImageResponse> {
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  return response.json() as Promise<ApiImageResponse>;
}

async function postFormData(path: string, formData: FormData): Promise<ApiImageResponse> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    body: formData,
  });
  return parseImageResponse(response);
}

async function postFormDataList(path: string, formData: FormData): Promise<ApiImageResponse[]> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  return response.json() as Promise<ApiImageResponse[]>;
}

export async function generateImage(input: {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
}): Promise<ApiImageResponse> {
  const formData = new FormData();
  formData.append('prompt', input.prompt);
  if (input.negativePrompt) formData.append('negative_prompt', input.negativePrompt);
  if (typeof input.width === 'number') formData.append('width', String(input.width));
  if (typeof input.height === 'number') formData.append('height', String(input.height));
  if (typeof input.steps === 'number') formData.append('steps', String(input.steps));
  if (typeof input.seed === 'number') formData.append('seed', String(input.seed));
  return postFormData('/api/generate', formData);
}

export async function inpaintImage(input: {
  image: File;
  mask: File;
  prompt: string;
  negativePrompt?: string;
  steps?: number;
  guidanceScale?: number;
}): Promise<ApiImageResponse> {
  const formData = new FormData();
  formData.append('image', input.image);
  formData.append('mask', input.mask);
  formData.append('prompt', input.prompt);
  if (input.negativePrompt) formData.append('negative_prompt', input.negativePrompt);
  if (typeof input.steps === 'number') formData.append('steps', String(input.steps));
  if (typeof input.guidanceScale === 'number') formData.append('guidance_scale', String(input.guidanceScale));
  return postFormData('/api/inpaint', formData);
}

export async function outpaintImage(input: {
  image: File;
  expandPx?: number;
  prompt?: string;
  negativePrompt?: string;
  steps?: number;
}): Promise<ApiImageResponse> {
  const formData = new FormData();
  formData.append('image', input.image);
  if (typeof input.expandPx === 'number') formData.append('expand_px', String(input.expandPx));
  if (input.prompt) formData.append('prompt', input.prompt);
  if (input.negativePrompt) formData.append('negative_prompt', input.negativePrompt);
  if (typeof input.steps === 'number') formData.append('steps', String(input.steps));
  return postFormData('/api/outpaint', formData);
}

export async function removeBackground(input: { image: File }): Promise<ApiImageResponse> {
  const formData = new FormData();
  formData.append('image', input.image);
  return postFormData('/api/remove-background', formData);
}

export async function replaceBackground(input: {
  image: File;
  mode: 'color' | 'image';
  backgroundColor?: string;
  backgroundImage?: File;
}): Promise<ApiImageResponse> {
  const formData = new FormData();
  formData.append('image', input.image);
  formData.append('mode', input.mode);
  if (input.backgroundColor) formData.append('background_color', input.backgroundColor);
  if (input.backgroundImage) formData.append('background_image', input.backgroundImage);
  return postFormData('/api/background-replace', formData);
}

export async function enhanceFace(input: { image: File }): Promise<ApiImageResponse> {
  const formData = new FormData();
  formData.append('image', input.image);
  return postFormData('/api/face-enhance', formData);
}

export async function upscaleImage(input: { image: File; scale?: number }): Promise<ApiImageResponse> {
  const formData = new FormData();
  formData.append('image', input.image);
  if (typeof input.scale === 'number') formData.append('scale', String(input.scale));
  return postFormData('/api/upscale', formData);
}

export async function magicErase(input: { image: File; mask: File }): Promise<ApiImageResponse> {
  const formData = new FormData();
  formData.append('image', input.image);
  formData.append('mask', input.mask);
  return postFormData('/api/magic-eraser', formData);
}

export async function applyStyle(input: { image: File; style: string; strength?: number }): Promise<ApiImageResponse> {
  const formData = new FormData();
  formData.append('image', input.image);
  formData.append('style', input.style);
  if (typeof input.strength === 'number') formData.append('strength', String(input.strength));
  return postFormData('/api/style-transfer', formData);
}

export async function generateImageVariations(input: {
  image: File;
  count?: number;
  strength?: number;
}): Promise<ApiImageResponse[]> {
  const formData = new FormData();
  formData.append('image', input.image);
  if (typeof input.count === 'number') formData.append('count', String(input.count));
  if (typeof input.strength === 'number') formData.append('strength', String(input.strength));
  return postFormDataList('/api/image-variations', formData);
}

export async function listImages(): Promise<ApiGeneratedImage[]> {
  const response = await fetch(buildUrl('/api/images'));
  if (!response.ok) throw new Error(await readErrorMessage(response));
  return response.json() as Promise<ApiGeneratedImage[]>;
}

export async function enhancePrompt(prompt: string): Promise<string> {
  const response = await fetch(buildUrl('/api/prompt-enhance'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }),
  });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  return (await response.json() as { prompt: string }).prompt;
}

export interface ApiBrandKit {
  colors: string[];
  fonts: string[];
  logos: string[];
  assets: string[];
}

export interface ApiBrandKitSuggestion {
  colors: string[];
  fonts: string[];
  logo_prompt: string;
  asset_prompts: string[];
}

export async function getBrandKit(): Promise<ApiBrandKit> {
  const response = await fetch(buildUrl('/api/brandkit'));
  if (!response.ok) throw new Error(await readErrorMessage(response));
  return response.json() as Promise<ApiBrandKit>;
}

export async function saveBrandKit(brandKit: ApiBrandKit): Promise<ApiBrandKit> {
  const response = await fetch(buildUrl('/api/brandkit'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brandKit),
  });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  return response.json() as Promise<ApiBrandKit>;
}

export async function suggestBrandKit(input: {
  brandName: string;
  brandType: string;
  description?: string;
}): Promise<ApiBrandKitSuggestion> {
  const response = await fetch(buildUrl('/api/brandkit/suggest'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand_name: input.brandName,
      brand_type: input.brandType,
      description: input.description,
    }),
  });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  return response.json() as Promise<ApiBrandKitSuggestion>;
}

