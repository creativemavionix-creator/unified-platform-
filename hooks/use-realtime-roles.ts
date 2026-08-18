"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase, isDemoMode } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface LocalRole {
  id: string;
  role: string;
  members: number;
  projects: string;
  billing: string;
  settings: string;
  team: string;
}

interface RoleDbRow {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  permissions_projects: string;
  permissions_billing: string;
  permissions_settings: string;
  permissions_team: string;
  is_system: boolean;
  created_at: string;
}

const MOCK_ROLES: LocalRole[] = [
  { id: "r-1", role: "Owner", members: 1, projects: "Full", billing: "Full", settings: "Full", team: "Full" },
  { id: "r-2", role: "Admin", members: 2, projects: "Full", billing: "View", settings: "Full", team: "Full" },
  { id: "r-3", role: "Editor", members: 3, projects: "Edit", billing: "None", settings: "View", team: "View" },
  { id: "r-4", role: "Viewer", members: 1, projects: "View", billing: "None", settings: "None", team: "View" },
];

function rowToLocal(r: RoleDbRow): LocalRole {
  return {
    id: r.id,
    role: r.name,
    members: 0, // computed separately if needed
    projects: r.permissions_projects,
    billing: r.permissions_billing,
    settings: r.permissions_settings,
    team: r.permissions_team,
  };
}

/**
 * Provides live roles with Supabase Realtime.
 * Demo mode falls back to mock data.
 */
export function useRealtimeRoles() {
  const [roles, setRoles] = useState<LocalRole[]>(MOCK_ROLES);
  const [loading, setLoading] = useState(!isDemoMode);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const orgIdRef = useRef<string | null>(null);

  const fetchInitial = useCallback(async () => {
    if (isDemoMode) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setRoles([]); setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) { setRoles([]); setLoading(false); return; }
    orgIdRef.current = profile.org_id;

    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[Roles] Fetch failed:", error.message);
      setLoading(false);
      return;
    }

    setRoles((data ?? []).map((r: RoleDbRow) => rowToLocal(r)));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isDemoMode || !supabase) return;

    fetchInitial();

    let channel: RealtimeChannel | null = null;
    try {
      channel = supabase
        .channel("roles-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "roles" },
          (payload) => {
            const row = payload.new as RoleDbRow;
            setRoles((prev) => [...prev, rowToLocal(row)]);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "roles" },
          (payload) => {
            const row = payload.new as RoleDbRow;
            setRoles((prev) =>
              prev.map((r) => (r.id === row.id ? rowToLocal(row) : r))
            );
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "roles" },
          (payload) => {
            const oldRow = payload.old as { id: string };
            setRoles((prev) => prev.filter((r) => r.id !== oldRow.id));
          }
        )
        .subscribe();

      channelRef.current = channel;
    } catch (err) {
      console.warn("[Realtime] Roles subscription failed:", err);
    }

    return () => {
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch {}
      }
    };
  }, [fetchInitial]);

  // ── Mutations ──

  const createRole = useCallback(async (params: {
    name: string;
    projects: string;
    billing: string;
    settings: string;
    team: string;
  }) => {
    if (isDemoMode) {
      const localId = `r-${Date.now()}`;
      setRoles((prev) => [...prev, { id: localId, role: params.name, members: 0, ...params }]);
      return;
    }
    const orgId = orgIdRef.current;
    if (!orgId) return;
    await supabase.from("roles").insert({
      org_id: orgId,
      name: params.name,
      permissions_projects: params.projects,
      permissions_billing: params.billing,
      permissions_settings: params.settings,
      permissions_team: params.team,
    });
    // Realtime handles state
  }, []);

  const updateRole = useCallback(async (roleId: string, params: Partial<{
    name: string;
    projects: string;
    billing: string;
    settings: string;
    team: string;
  }>) => {
    if (isDemoMode) {
      setRoles((prev) => prev.map((r) => {
        if (r.id !== roleId) return r;
        return {
          ...r,
          ...(params.name !== undefined && { role: params.name }),
          ...(params.projects !== undefined && { projects: params.projects }),
          ...(params.billing !== undefined && { billing: params.billing }),
          ...(params.settings !== undefined && { settings: params.settings }),
          ...(params.team !== undefined && { team: params.team }),
        };
      }));
      return;
    }
    const updates: Record<string, string> = {};
    if (params.name !== undefined) updates.name = params.name;
    if (params.projects !== undefined) updates.permissions_projects = params.projects;
    if (params.billing !== undefined) updates.permissions_billing = params.billing;
    if (params.settings !== undefined) updates.permissions_settings = params.settings;
    if (params.team !== undefined) updates.permissions_team = params.team;
    await supabase.from("roles").update(updates).eq("id", roleId);
  }, []);

  return { roles, setRoles, loading, createRole, updateRole };
}
