"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase, isDemoMode } from "@/lib/supabase";
import type { ProjectRow } from "@/lib/supabase-actions";
import { projects as mockProjects } from "@/lib/mock-data";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface LocalProject {
  id: string;
  name: string;
  suite: "dev" | "creative" | "business" | "automation";
  type: string;
  status: "active" | "completed" | "draft";
  lastUpdated: string;
  description: string;
}

function mapMock(p: typeof mockProjects[number]): LocalProject {
  return { ...p };
}

function rowToLocal(r: ProjectRow): LocalProject {
  return {
    id: r.id,
    name: r.name,
    suite: r.suite as LocalProject["suite"],
    type: r.type ?? "",
    status: (r.status === "archived" ? "completed" : r.status) as LocalProject["status"],
    lastUpdated: r.updated_at,
    description: r.description ?? "",
  };
}

/**
 * Hook providing live projects from Supabase.
 * - Demo mode: uses mock data.
 * - With Supabase: fetches initial rows, subscribes to INSERT/UPDATE.
 */
export function useRealtimeProjects() {
  const [projects, setProjects] = useState<LocalProject[]>(() => mockProjects.map(mapMock));
  const [loading, setLoading] = useState(!isDemoMode);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchInitial = useCallback(async () => {
    if (isDemoMode) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setProjects([]); setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) { setProjects([]); setLoading(false); return; }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) {
      console.warn("[Projects] Fetch failed:", error.message);
      setLoading(false);
      return;
    }

    setProjects((data ?? []).map((r: ProjectRow) => rowToLocal(r)));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isDemoMode || !supabase) return;

    fetchInitial();

    let channel: RealtimeChannel | null = null;
    try {
      channel = supabase
        .channel("projects-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "projects" },
          (payload) => {
            const row = payload.new as ProjectRow;
            setProjects((prev) => [rowToLocal(row), ...prev]);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "projects" },
          (payload) => {
            const row = payload.new as ProjectRow;
            setProjects((prev) =>
              prev.map((p) => (p.id === row.id ? rowToLocal(row) : p))
            );
          }
        )
        .subscribe();

      channelRef.current = channel;
    } catch (err) {
      console.warn("[Realtime] Projects subscription failed:", err);
    }

    return () => {
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch {}
      }
    };
  }, [fetchInitial]);

  return { projects, loading };
}
