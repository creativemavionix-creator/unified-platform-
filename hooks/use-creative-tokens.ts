"use client";

import { useCallback, useEffect, useState } from "react";
import { buildBalance, getDemoTokenUsed, todayKey, type TokenBalance } from "@/lib/creative-tokens";
import { isDemoMode } from "@/lib/supabase";

export function useCreativeTokens() {
  const [balance, setBalance] = useState<TokenBalance>(() =>
    isDemoMode ? buildBalance(getDemoTokenUsed()) : buildBalance(0)
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/creative/tokens", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load token balance");
      const data = (await response.json()) as TokenBalance;
      setBalance(data);
      if (isDemoMode && typeof window !== "undefined") {
        try {
          localStorage.setItem(`mvx_creative_tokens_${todayKey()}`, String(data.used));
        } catch {
          // ignore quota errors
        }
      }
    } catch {
      setBalance(isDemoMode ? buildBalance(getDemoTokenUsed()) : buildBalance(0));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const syncFromServer = useCallback(
    (next: TokenBalance) => {
      setBalance(next);
      if (isDemoMode && typeof window !== "undefined") {
        try {
          localStorage.setItem(`mvx_creative_tokens_${todayKey()}`, String(next.used));
        } catch {
          // ignore
        }
      }
    },
    []
  );

  return { balance, loading, refresh, syncFromServer };
}
