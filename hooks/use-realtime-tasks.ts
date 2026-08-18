"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase, isDemoMode } from "@/lib/supabase";
import type { TaskRow } from "@/lib/supabase-actions";
import { tasks as mockTasks } from "@/lib/mock-data";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface LocalTask {
  id: string;
  title: string;
  description: string;
  suite: "dev" | "creative" | "business" | "automation";
  assignee: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
}

function mapMock(t: typeof mockTasks[number]): LocalTask {
  return { ...t };
}

/** Map DB row status (uses underscore) to UI status (uses hyphen) */
function mapStatus(dbStatus: string): "todo" | "in-progress" | "done" {
  if (dbStatus === "in_progress") return "in-progress";
  return dbStatus as "todo" | "done";
}

/** Map UI status (hyphen) to DB status (underscore) */
export function toDbStatus(uiStatus: "todo" | "in-progress" | "done"): string {
  if (uiStatus === "in-progress") return "in_progress";
  return uiStatus;
}

function rowToLocal(r: TaskRow): LocalTask {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    suite: r.suite as LocalTask["suite"],
    assignee: r.assignee_name ?? "Unassigned",
    status: mapStatus(r.status),
    priority: r.priority as LocalTask["priority"],
    dueDate: r.due_date ?? "",
  };
}

/**
 * Hook providing live tasks from Supabase.
 * - Demo mode: uses mock data, all mutations are local-only.
 * - With Supabase: fetches initial rows, subscribes to INSERT/UPDATE/DELETE.
 */
export function useRealtimeTasks() {
  const [tasks, setTasks] = useState<LocalTask[]>(() => mockTasks.map(mapMock));
  const [loading, setLoading] = useState(!isDemoMode);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchInitial = useCallback(async () => {
    if (isDemoMode) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setTasks([]); setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) { setTasks([]); setLoading(false); return; }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.warn("[Tasks] Fetch failed:", error.message);
      setLoading(false);
      return;
    }

    setTasks((data ?? []).map((r: TaskRow) => rowToLocal(r)));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isDemoMode || !supabase) return;

    fetchInitial();

    let channel: RealtimeChannel | null = null;
    try {
      channel = supabase
        .channel("tasks-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "tasks" },
          (payload) => {
            const row = payload.new as TaskRow;
            setTasks((prev) => [rowToLocal(row), ...prev]);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "tasks" },
          (payload) => {
            const row = payload.new as TaskRow;
            setTasks((prev) =>
              prev.map((t) => (t.id === row.id ? rowToLocal(row) : t))
            );
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "tasks" },
          (payload) => {
            const oldRow = payload.old as { id: string };
            setTasks((prev) => prev.filter((t) => t.id !== oldRow.id));
          }
        )
        .subscribe();

      channelRef.current = channel;
    } catch (err) {
      console.warn("[Realtime] Tasks subscription failed:", err);
    }

    return () => {
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch {}
      }
    };
  }, [fetchInitial]);

  return { tasks, setTasks, loading };
}
