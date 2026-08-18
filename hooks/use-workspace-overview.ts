"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, isDemoMode } from "@/lib/supabase";
import { workspaceOverview as mockOverview, weeklyTokens as mockTokens } from "@/lib/mock-data";

export interface WorkspaceOverviewData {
  orgName: string;
  planTier: string;
  seatsUsed: number;
  seatsTotal: number;
  tokensUsed: number;
  tokensLimit: number;
  activeProjects: number;
}

export interface WeeklyTokenData {
  day: string;
  tokens: number;
}

/**
 * Loads real workspace stats from organizations + subscriptions + projects.
 * Falls back to mock data in demo mode.
 */
export function useWorkspaceOverview() {
  const [overview, setOverview] = useState<WorkspaceOverviewData>(mockOverview);
  const [weeklyTokens, setWeeklyTokens] = useState<WeeklyTokenData[]>(mockTokens);
  const [loading, setLoading] = useState(!isDemoMode);

  const fetchData = useCallback(async () => {
    if (isDemoMode) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) { setLoading(false); return; }
    const orgId = profile.org_id;

    // Fetch org name
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single();

    // Fetch subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan_tier, seats_used, seats_total, tokens_used, tokens_limit")
      .eq("org_id", orgId)
      .single();

    // Count active projects
    const { count: projectCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "active");

    if (org || sub) {
      const tierMap: Record<string, string> = { free: "Free", pro: "Pro", enterprise: "Enterprise" };
      setOverview({
        orgName: org?.name ?? mockOverview.orgName,
        planTier: sub ? (tierMap[sub.plan_tier] ?? "Pro") : mockOverview.planTier,
        seatsUsed: sub?.seats_used ?? mockOverview.seatsUsed,
        seatsTotal: sub?.seats_total ?? mockOverview.seatsTotal,
        tokensUsed: sub?.tokens_used ?? mockOverview.tokensUsed,
        tokensLimit: sub?.tokens_limit ?? mockOverview.tokensLimit,
        activeProjects: projectCount ?? mockOverview.activeProjects,
      });
    }

    // Fetch weekly token usage from usage_logs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const { data: usageLogs } = await supabase
      .from("usage_logs")
      .select("date, tokens_used")
      .eq("org_id", orgId)
      .gte("date", sevenDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: true });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const usageMap: Record<string, number> = {};
    if (usageLogs) {
      usageLogs.forEach((row: { date: string; tokens_used: number }) => {
        usageMap[row.date] = row.tokens_used;
      });
    }

    const formattedData: WeeklyTokenData[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = dayNames[d.getDay()];
      formattedData.push({
        day: dayName,
        tokens: usageMap[dateStr] ?? 0,
      });
    }

    setWeeklyTokens(formattedData);

    setLoading(false);
  }, []);

  useEffect(() => {
    if (isDemoMode) return;
    fetchData();
  }, [fetchData]);

  return { overview, weeklyTokens, loading };
}
