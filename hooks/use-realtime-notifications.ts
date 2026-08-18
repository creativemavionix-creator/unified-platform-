"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase, isDemoMode } from "@/lib/supabase";
import { toast } from "sonner";
import type { NotificationRow } from "@/lib/supabase-actions";
import { notifications as mockNotifications } from "@/lib/mock-data";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface LocalNotification {
  id: string;
  title: string;
  description: string;
  type: "info" | "warning" | "success" | "error";
  suite: string;
  read: boolean;
  created_at: string;
}

function mapMock(n: typeof mockNotifications[number]): LocalNotification {
  return {
    id: n.id,
    title: n.title,
    description: n.description,
    type: n.type,
    suite: n.suite,
    read: n.read,
    created_at: n.timestamp,
  };
}

/**
 * Hook that provides live notifications.
 * - In demo mode: returns mock data.
 * - With Supabase: fetches initial rows, subscribes to realtime INSERTs,
 *   fires a toast on each new notification, and prepends to state.
 */
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<LocalNotification[]>(
    () => mockNotifications.map(mapMock)
  );
  const [loading, setLoading] = useState(!isDemoMode);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch initial notifications from Supabase
  const fetchInitial = useCallback(async () => {
    if (isDemoMode) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setNotifications([]); setLoading(false); return; }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      console.warn("[Notifications] Fetch failed:", error.message);
      setNotifications([]);
      setLoading(false);
      return;
    }

    setNotifications((data ?? []).map((r: NotificationRow) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? "",
      type: r.type,
      suite: r.suite,
      read: r.read,
      created_at: r.created_at,
    })));
    setLoading(false);
  }, []);

  // Subscribe to realtime
  useEffect(() => {
    if (isDemoMode || !supabase) return;

    fetchInitial();

    let channel: RealtimeChannel | null = null;
    try {
      channel = supabase
        .channel("notifications-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications" },
          (payload) => {
            const row = payload.new as NotificationRow;
            const local: LocalNotification = {
              id: row.id,
              title: row.title,
              description: row.description ?? "",
              type: row.type,
              suite: row.suite,
              read: row.read,
              created_at: row.created_at,
            };
            setNotifications((prev) => [local, ...prev]);

            // Fire toast
            const toastType = row.type === "error" ? "error"
              : row.type === "warning" ? "warning"
              : row.type === "success" ? "success"
              : "info";
            if (toastType === "error") toast.error(row.title, { description: row.description ?? undefined });
            else if (toastType === "warning") toast.warning(row.title, { description: row.description ?? undefined });
            else if (toastType === "success") toast.success(row.title, { description: row.description ?? undefined });
            else toast.info(row.title, { description: row.description ?? undefined });
          }
        )
        .subscribe();

      channelRef.current = channel;
    } catch (err) {
      console.warn("[Realtime] Notifications subscription failed:", err);
    }

    return () => {
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch {}
      }
    };
  }, [fetchInitial]);

  // Mark a notification as read
  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (!isDemoMode) {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    }
  }, []);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (!isDemoMode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("user_id", user.id)
          .eq("read", false);
      }
    }
  }, []);

  return { notifications, loading, markRead, markAllRead };
}
