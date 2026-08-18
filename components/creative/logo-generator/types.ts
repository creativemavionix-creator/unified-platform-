import type { LogoGenerationParams, LogoVariation } from "@/services/logoGenerator";

export interface LogoGenerationBatch {
  id: string;
  brandName: string;
  style: string;
  createdAt: Date;
  variations: LogoVariation[];
  params: LogoGenerationParams;
}

export const LOGO_STYLE_OPTIONS = [
  "Minimalist",
  "Modern",
  "Vintage/Retro",
  "Playful",
  "Corporate",
  "Abstract",
  "Mascot",
  "Wordmark",
  "Geometric",
] as const;

export const COLOR_MOOD_OPTIONS = [
  "Monochrome",
  "Vibrant",
  "Pastel",
  "Dark & Bold",
  "Earthy",
  "Let AI choose",
] as const;

export const LOADING_STATUS_LINES = [
  "Sketching concepts…",
  "Balancing negative space…",
  "Testing color harmony…",
  "Vectorizing letterforms…",
  "Polishing mark geometry…",
] as const;

export const VARIATION_COUNTS = [4, 6, 9] as const;

export type LogoFormat = LogoGenerationParams["format"];
