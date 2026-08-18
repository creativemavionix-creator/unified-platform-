"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase, isDemoMode } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface LocalTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TeamMemberRow {
  id: string;
  org_id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  status: string;
  created_at: string;
}

const MOCK_MEMBERS: LocalTeamMember[] = [
  { id: "m-1", name: "Alex Mercer", email: "alex@mercer.io", role: "Owner" },
  { id: "m-2", name: "Sarah Connor", email: "sarah@connor.org", role: "Admin" },
  { id: "m-3", name: "Jordan Kim", email: "jordan@mavionix.io", role: "Editor" },
];

function rowToLocal(r: TeamMemberRow): LocalTeamMember {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
  };
}

/**
 * Provides live team members with Supabase Realtime.
 * Demo mode falls back to mock data.
 */
export function useRealtimeTeamMembers() {
  const [members, setMembers] = useState<LocalTeamMember[]>(MOCK_MEMBERS);
  const [loading, setLoading] = useState(!isDemoMode);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const orgIdRef = useRef<string | null>(null);

  const fetchInitial = useCallback(async () => {
    if (isDemoMode) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMembers([]); setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) { setMembers([]); setLoading(false); return; }
    orgIdRef.current = profile.org_id;

    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[Team] Fetch failed:", error.message);
      setLoading(false);
      return;
    }

    setMembers((data ?? []).map((r: TeamMemberRow) => rowToLocal(r)));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isDemoMode || !supabase) return;

    fetchInitial();

    let channel: RealtimeChannel | null = null;
    try {
      channel = supabase
        .channel("team-members-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "team_members" },
          (payload) => {
            const row = payload.new as TeamMemberRow;
            setMembers((prev) => [...prev, rowToLocal(row)]);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "team_members" },
          (payload) => {
            const row = payload.new as TeamMemberRow;
            setMembers((prev) =>
              prev.map((m) => (m.id === row.id ? rowToLocal(row) : m))
            );
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "team_members" },
          (payload) => {
            const oldRow = payload.old as { id: string };
            setMembers((prev) => prev.filter((m) => m.id !== oldRow.id));
          }
        )
        .subscribe();

      channelRef.current = channel;
    } catch (err) {
      console.warn("[Realtime] Team members subscription failed:", err);
    }

    return () => {
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch {}
      }
    };
  }, [fetchInitial]);

  // ── Mutations ──

  const inviteMember = useCallback(async (name: string, email: string, role: string) => {
    if (isDemoMode) {
      const localId = `m-${Date.now()}`;
      setMembers((prev) => [...prev, { id: localId, name, email, role }]);
      return;
    }
    const orgId = orgIdRef.current;
    if (!orgId) return;
    await supabase.from("team_members").insert({
      org_id: orgId,
      name,
      email,
      role: role.toLowerCase(),
      status: "invited",
    });
    // Realtime subscription handles state update
  }, []);

  const removeMember = useCallback(async (memberId: string) => {
    if (isDemoMode) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      return;
    }
    await supabase.from("team_members").delete().eq("id", memberId);
    // Realtime handles state
  }, []);

  const changeMemberRole = useCallback(async (memberId: string, newRole: string) => {
    if (isDemoMode) {
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
      return;
    }
    await supabase.from("team_members").update({ role: newRole.toLowerCase() }).eq("id", memberId);
    // Realtime handles state
  }, []);

  return { members, setMembers, loading, inviteMember, removeMember, changeMemberRole };
}
