export const DAILY_TOKEN_LIMIT = 1000;

export const TOKEN_COSTS: Record<string, number> = {
  generate: 50,
  inpaint: 30,
  outpaint: 35,
  "remove-background": 25,
  "background-replace": 30,
  "face-enhance": 40,
  upscale: 40,
  "magic-eraser": 30,
  "style-transfer": 35,
  "image-variations": 50,
  "prompt-enhance": 5,
  "brandkit/suggest": 15,
};

export function getOperationCost(operation: string): number {
  return TOKEN_COSTS[operation] ?? 0;
}

export function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function msUntilMidnightUtc(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return midnight.getTime() - now.getTime();
}

export function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export interface TokenBalance {
  used: number;
  limit: number;
  remaining: number;
  resetsInMs: number;
}

export function buildBalance(used: number): TokenBalance {
  const limit = DAILY_TOKEN_LIMIT;
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetsInMs: msUntilMidnightUtc(),
  };
}

const DEMO_STORAGE_PREFIX = "mvx_creative_tokens";

export function getDemoTokenUsed(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(`${DEMO_STORAGE_PREFIX}_${todayKey()}`);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

export function setDemoTokenUsed(used: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${DEMO_STORAGE_PREFIX}_${todayKey()}`, String(used));
  } catch {
  }
}

export function checkDemoTokens(cost: number): { ok: boolean; error?: string; balance: TokenBalance } {
  const used = getDemoTokenUsed();
  const balance = buildBalance(used);
  if (cost > balance.remaining) {
    return {
      ok: false,
      error: `Not enough generation credits. You need ${cost} but only have ${balance.remaining} remaining today.`,
      balance,
    };
  }
  return { ok: true, balance };
}

export function deductDemoTokens(cost: number): TokenBalance {
  const used = getDemoTokenUsed() + cost;
  setDemoTokenUsed(used);
  const balance = buildBalance(used);
  // Dispatch event for same-tab components to refresh
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent('mvx-tokens-changed'));
  }
  return balance;
}

export function getTokenBalance(): TokenBalance {
  return buildBalance(getDemoTokenUsed());
}