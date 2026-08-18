import type { LogoGenerationParams } from "@/services/logoGenerator";

export interface ParsedBrandBrief {
  brandName: string;
  style: string;
  industry?: string;
  colorMood?: string;
  format?: LogoGenerationParams["format"];
}

const STYLE_KEYWORDS: Record<string, string> = {
  minimal: "Minimalist",
  minimalist: "Minimalist",
  modern: "Modern",
  vintage: "Vintage/Retro",
  retro: "Vintage/Retro",
  playful: "Playful",
  fun: "Playful",
  corporate: "Corporate",
  professional: "Corporate",
  abstract: "Abstract",
  mascot: "Mascot",
  wordmark: "Wordmark",
  geometric: "Geometric",
  bakery: "Playful",
  coffee: "Vintage/Retro",
  fintech: "Corporate",
  tech: "Modern",
  startup: "Modern",
};

const MOOD_KEYWORDS: Record<string, string> = {
  cozy: "Pastel",
  pastel: "Pastel",
  soft: "Pastel",
  vibrant: "Vibrant",
  bold: "Dark & Bold",
  dark: "Dark & Bold",
  earthy: "Earthy",
  natural: "Earthy",
  monochrome: "Monochrome",
};

/**
 * TODO: replace with real NLP/AI parsing call
 */
export function parseBrandPrompt(description: string): ParsedBrandBrief {
  const lower = description.toLowerCase();
  let brandName = "New Brand";

  const quoted = description.match(/["“](.+?)["”]/);
  if (quoted?.[1]) {
    brandName = quoted[1].trim().slice(0, 40);
  } else {
    const capitalized = description.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
    if (capitalized?.[1]) brandName = capitalized[1].slice(0, 40);
  }

  let style = "Modern";
  for (const [keyword, mapped] of Object.entries(STYLE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      style = mapped;
      break;
    }
  }

  let colorMood = "Let AI choose";
  for (const [keyword, mapped] of Object.entries(MOOD_KEYWORDS)) {
    if (lower.includes(keyword)) {
      colorMood = mapped;
      break;
    }
  }

  let industry: string | undefined;
  const industryMatch = lower.match(/\b(fintech|coffee shop|bakery|saas|agency|restaurant|fitness)\b/);
  if (industryMatch) industry = industryMatch[1];

  let format: LogoGenerationParams["format"] = "combination";
  if (lower.includes("wordmark only") || lower.includes("text only")) format = "wordmark";
  if (lower.includes("icon only") || lower.includes("symbol only")) format = "icon";

  return { brandName, style, industry, colorMood, format };
}
