export interface LogoGenerationParams {
  brandName: string;
  style: string;
  industry?: string;
  colorMood?: string;
  format: "icon" | "wordmark" | "combination";
  variationCount: 4 | 6 | 9;
}

export interface LogoVariation {
  id: string;
  imageUrl: string;
  svgMarkup: string;
  format: "icon" | "wordmark" | "combination";
  seed?: string;
}

const PALETTES: Record<string, string[]> = {
  Monochrome: ["#111827", "#374151", "#6B7280", "#9CA3AF"],
  Vibrant: ["#7C3AED", "#EC4899", "#06B6D4", "#F59E0B"],
  Pastel: ["#C4B5FD", "#F9A8D4", "#99F6E4", "#FDE68A"],
  "Dark & Bold": ["#0F172A", "#1E1B4B", "#312E81", "#4C1D95"],
  Earthy: ["#78350F", "#92400E", "#166534", "#3F6212"],
  "Let AI choose": ["#7C3AED", "#6366F1", "#EC4899", "#22D3EE"],
};

const SHAPE_VARIANTS = ["circle", "hexagon", "diamond", "rounded-square"] as const;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomFrom<T>(arr: readonly T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function getInitials(brandName: string): string {
  const parts = brandName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function pickColors(colorMood: string | undefined, seed: number): { primary: string; secondary: string } {
  const palette = PALETTES[colorMood ?? "Let AI choose"] ?? PALETTES["Let AI choose"];
  const primary = randomFrom(palette, seed);
  const secondary = randomFrom(palette, seed + 3);
  return { primary, secondary };
}

function buildShape(shape: (typeof SHAPE_VARIANTS)[number], cx: number, cy: number, size: number): string {
  switch (shape) {
    case "circle":
      return `<circle cx="${cx}" cy="${cy}" r="${size}" fill="url(#grad)" />`;
    case "hexagon": {
      const points = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        return `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`;
      }).join(" ");
      return `<polygon points="${points}" fill="url(#grad)" />`;
    }
    case "diamond":
      return `<polygon points="${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}" fill="url(#grad)" />`;
    case "rounded-square":
      return `<rect x="${cx - size}" y="${cy - size}" width="${size * 2}" height="${size * 2}" rx="${size * 0.25}" fill="url(#grad)" />`;
  }
}

function buildSvgMarkup(
  params: LogoGenerationParams,
  index: number,
  seed: string
): string {
  const numericSeed = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + index;
  const { primary, secondary } = pickColors(params.colorMood, numericSeed);
  const shape = randomFrom(SHAPE_VARIANTS, numericSeed);
  const initials = getInitials(params.brandName);
  const showIcon = params.format === "icon" || params.format === "combination";
  const showWordmark = params.format === "wordmark" || params.format === "combination";

  const iconBlock = showIcon
    ? buildShape(shape, showWordmark ? 72 : 120, showWordmark ? 72 : 110, 36)
    : "";
  const wordmarkY = showIcon ? 148 : 118;
  const wordmarkSize = params.format === "wordmark" ? 42 : 22;
  const wordmarkBlock = showWordmark
    ? `<text x="120" y="${wordmarkY}" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="${wordmarkSize}" fill="${primary}">${escapeXml(params.brandName.slice(0, 24))}</text>`
    : "";
  const monogram = showIcon
    ? `<text x="${showWordmark ? 72 : 120}" y="${showWordmark ? 82 : 122}" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="28" fill="#ffffff">${initials}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" width="240" height="180">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}" />
      <stop offset="100%" stop-color="${secondary}" />
    </linearGradient>
  </defs>
  ${iconBlock}
  ${monogram}
  ${wordmarkBlock}
  <text x="120" y="172" text-anchor="middle" font-family="ui-monospace, monospace" font-size="9" fill="${secondary}" opacity="0.85">${escapeXml(params.style)} · ${escapeXml(params.industry || "general")}</text>
</svg>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function svgToDataUrl(svgMarkup: string): string {
  const encoded = encodeURIComponent(svgMarkup).replace(/'/g, "%27").replace(/"/g, "%22");
  return `data:image/svg+xml,${encoded}`;
}

function createVariation(params: LogoGenerationParams, index: number): LogoVariation {
  const seed = `${params.brandName}-${params.style}-${index}-${Date.now()}`;
  const svgMarkup = buildSvgMarkup(params, index, seed);
  return {
    id: `logo-${seed.replace(/\s+/g, "-").toLowerCase()}`,
    imageUrl: svgToDataUrl(svgMarkup),
    svgMarkup,
    format: params.format,
    seed,
  };
}

/**
 * Swap this implementation for a real API (e.g. POST /api/logo/generate) without changing UI code.
 */
export async function generateLogos(params: LogoGenerationParams): Promise<LogoVariation[]> {
  const waitMs = 2000 + Math.floor(Math.random() * 1500);
  await delay(waitMs);

  if (params.brandName.trim().toLowerCase() === "fail") {
    throw new Error("Logo generation failed. The model timed out — please retry.");
  }

  return Array.from({ length: params.variationCount }, (_, i) => createVariation(params, i));
}

export async function refineLogo(
  source: LogoVariation,
  instruction: string,
  params: LogoGenerationParams
): Promise<LogoVariation> {
  await delay(1500 + Math.floor(Math.random() * 1000));

  const refinedParams: LogoGenerationParams = {
    ...params,
    style: instruction.toLowerCase().includes("minimal") ? "Minimalist" : params.style,
    colorMood: instruction.toLowerCase().includes("blue")
      ? "Vibrant"
      : instruction.toLowerCase().includes("pastel")
        ? "Pastel"
        : params.colorMood,
  };

  const variation = createVariation(refinedParams, Date.now() % 100);
  return {
    ...variation,
    id: `logo-refined-${source.id}-${Date.now()}`,
    seed: `${source.seed}-refined`,
  };
}

export async function regenerateSingleLogo(
  params: LogoGenerationParams,
  replaceId: string
): Promise<LogoVariation> {
  await delay(1200 + Math.floor(Math.random() * 800));
  const variation = createVariation(params, replaceId.length + Date.now() % 50);
  return { ...variation, id: replaceId };
}
