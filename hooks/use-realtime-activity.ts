"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase, isDemoMode } from "@/lib/supabase";
import type { ActivityRow } from "@/lib/supabase-actions";
import { activities as mockActivities } from "@/lib/mock-data";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface LocalActivity {
  id: string;
  title: string;
  description: string;
  type: "dev" | "creative" | "business" | "automation";
  user: string;
  created_at: string;
}

function mapMock(a: typeof mockActivities[number]): LocalActivity {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    type: a.type,
    user: a.user,
    created_at: a.timestamp,
  };
}

/**
 * Hook that provides live activity log.
 * - Demo mode: returns mock data.
 * - With Supabase: fetches initial rows, subscribes to realtime INSERTs,
 *   and prepends new entries.
 */
export function useRealtimeActivity() {
  const [activities, setActivities] = useState<LocalActivity[]>(
    () => mockActivities.map(mapMock)
  );
  const [loading, setLoading] = useState(!isDemoMode);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchInitial = useCallback(async () => {
    if (isDemoMode) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActivities([]); setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) { setActivities([]); setLoading(false); return; }

    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      console.warn("[Activity] Fetch failed:", error.message);
      setLoading(false);
      return;
    }

    setActivities((data ?? []).map((r: ActivityRow) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? "",
      type: r.type,
      user: r.user_name ?? "System",
      created_at: r.created_at,
    })));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isDemoMode || !supabase) return;

    fetchInitial();

    let channel: RealtimeChannel | null = null;
    try {
      channel = supabase
        .channel("activity-log-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "activity_log" },
          (payload) => {
            const row = payload.new as ActivityRow;
            const local: LocalActivity = {
              id: row.id,
              title: row.title,
              description: row.description ?? "",
              type: row.type,
              user: row.user_name ?? "System",
              created_at: row.created_at,
            };
            setActivities((prev) => [local, ...prev]);
          }
        )
        .subscribe();

      channelRef.current = channel;
    } catch (err) {
      console.warn("[Realtime] Activity subscription failed:", err);
    }

    return () => {
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch {}
      }
    };
  }, [fetchInitial]);

  return { activities, loading };
}
