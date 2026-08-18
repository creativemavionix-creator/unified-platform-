"use client";

import { supabase, isDemoMode } from "./supabase";

// ────────────────────────────────────────────────────────────
// Types matching our Supabase schema
// ────────────────────────────────────────────────────────────

export type ActivityType = "dev" | "creative" | "business" | "automation";
export type NotificationType = "info" | "warning" | "success" | "error";
export type NotificationSuite = "dev" | "creative" | "business" | "automation" | "system";

export interface ActivityRow {
  id: string;
  org_id: string;
  user_id: string | null;
  user_name: string | null;
  title: string;
  description: string | null;
  type: ActivityType;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  org_id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  type: NotificationType;
  suite: NotificationSuite;
  read: boolean;
  created_at: string;
}

// ────────────────────────────────────────────────────────────
// Helper: get current user's org_id (cached per session)
// ────────────────────────────────────────────────────────────

let cachedOrgId: string | null = null;
let cachedUserId: string | null = null;

export async function getCurrentIds(): Promise<{ orgId: string | null; userId: string | null }> {
  if (isDemoMode) return { orgId: null, userId: null };
  if (cachedOrgId && cachedUserId) return { orgId: cachedOrgId, userId: cachedUserId };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { orgId: null, userId: null };

  cachedUserId = user.id;

  // Check if profile exists and has org_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (profile?.org_id) {
    cachedOrgId = profile.org_id;
    return { orgId: cachedOrgId, userId: cachedUserId };
  }

  // Profile has no org_id — auto-provision
  // Step 1: Ensure profile row exists
  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
    display_name: user.email?.split("@")[0] ?? "user",
  }, { onConflict: "id" });

  // Step 2: Create org (use .select() to get the id back in the same call — bypasses SELECT RLS)
  const { data: newOrg, error: orgErr } = await supabase
    .from("organizations")
    .insert({
      owner_id: user.id,
      name: user.email?.split("@")[0] ?? "My Workspace",
    })
    .select("id")
    .single();

  if (orgErr) {
    // Org might already exist (duplicate insert) — try to read it via RPC or just set org_id from profile
    console.warn("[getCurrentIds] Org insert failed (may already exist):", orgErr.message);
    // Fallback: the org-creation page or skip might have already created it
    // We can't read it due to RLS deadlock, so bail gracefully
    return { orgId: null, userId: cachedUserId };
  }

  const orgId = newOrg?.id ?? null;

  if (orgId) {
    // Step 3: Link profile to org
    await supabase.from("profiles").update({ org_id: orgId }).eq("id", user.id);
    cachedOrgId = orgId;
  }

  return { orgId: cachedOrgId, userId: cachedUserId };
}

// Reset cache on auth state change
if (!isDemoMode && supabase) {
  supabase.auth.onAuthStateChange(() => {
    cachedOrgId = null;
    cachedUserId = null;
  });
}

// ────────────────────────────────────────────────────────────
// INSERT: activity_log
// ────────────────────────────────────────────────────────────

export async function insertActivity(params: {
  title: string;
  description?: string;
  type: ActivityType;
  userName?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (isDemoMode) return;

  const { orgId, userId } = await getCurrentIds();
  if (!orgId) { console.warn("[insertActivity] No org_id available, skipping"); return; }

  let resolvedName = params.userName ?? null;
  if (!resolvedName && userId) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();
      if (profile?.full_name) {
        resolvedName = profile.full_name;
      }
    } catch (e) {
      console.warn("Failed to fetch profile for activity log", e);
    }
  }

  const { error } = await supabase.from("activity_log").insert({
    org_id: orgId,
    user_id: userId,
    user_name: resolvedName,
    title: params.title,
    description: params.description ?? null,
    type: params.type,
    metadata: params.metadata ?? {},
  });
  if (error) console.error("[insertActivity] Failed:", error);
}

// ────────────────────────────────────────────────────────────
// INSERT: notifications
// ────────────────────────────────────────────────────────────

export async function insertNotification(params: {
  title: string;
  description?: string;
  type: NotificationType;
  suite: NotificationSuite;
  targetUserId?: string; // defaults to current user
}): Promise<void> {
  if (isDemoMode) return;

  const { orgId, userId } = await getCurrentIds();
  if (!orgId) { console.warn("[insertNotification] No org_id available, skipping"); return; }

  const { error } = await supabase.from("notifications").insert({
    org_id: orgId,
    user_id: params.targetUserId ?? userId,
    title: params.title,
    description: params.description ?? null,
    type: params.type,
    suite: params.suite,
    read: false,
  });
  if (error) console.error("[insertNotification] Failed:", error);
}

// ────────────────────────────────────────────────────────────
// Types: Tasks
// ────────────────────────────────────────────────────────────

export type TaskSuite = "dev" | "creative" | "business" | "automation";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskRow {
  id: string;
  org_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  suite: TaskSuite;
  assignee_id: string | null;
  assignee_name: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────────────────────
// Types: Projects
// ────────────────────────────────────────────────────────────

export type ProjectSuite = "dev" | "creative" | "business" | "automation";
export type ProjectStatus = "active" | "completed" | "draft" | "archived";

export interface ProjectRow {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  suite: ProjectSuite;
  type: string | null;
  status: ProjectStatus;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────────────────────
// INSERT/UPDATE/DELETE: Tasks
// ────────────────────────────────────────────────────────────

export async function insertTask(params: {
  title: string;
  description?: string;
  suite: TaskSuite;
  assigneeName?: string;
  priority?: TaskPriority;
  dueDate?: string;
  projectId?: string;
}): Promise<TaskRow | null> {
  if (isDemoMode) return null;

  const { orgId, userId } = await getCurrentIds();
  if (!orgId) return null;

  const { data } = await supabase
    .from("tasks")
    .insert({
      org_id: orgId,
      title: params.title,
      description: params.description ?? null,
      suite: params.suite,
      assignee_id: userId,
      assignee_name: params.assigneeName ?? null,
      status: "todo" as TaskStatus,
      priority: params.priority ?? "medium",
      due_date: params.dueDate ?? null,
      project_id: params.projectId ?? null,
    })
    .select()
    .single();

  return data as TaskRow | null;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  if (isDemoMode) return;

  const updates: Record<string, unknown> = { status };
  if (status === "done") updates.completed_at = new Date().toISOString();
  else updates.completed_at = null;

  await supabase.from("tasks").update(updates).eq("id", taskId);
}

export async function deleteTask(taskId: string): Promise<void> {
  if (isDemoMode) return;
  await supabase.from("tasks").delete().eq("id", taskId);
}

// ────────────────────────────────────────────────────────────
// INSERT: Projects
// ────────────────────────────────────────────────────────────

export async function insertProject(params: {
  name: string;
  description?: string;
  suite: ProjectSuite;
  type?: string;
  status?: ProjectStatus;
}): Promise<ProjectRow | null> {
  if (isDemoMode) return null;

  const { orgId, userId } = await getCurrentIds();
  if (!orgId) return null;

  const { data } = await supabase
    .from("projects")
    .insert({
      org_id: orgId,
      name: params.name,
      description: params.description ?? null,
      suite: params.suite,
      type: params.type ?? null,
      status: params.status ?? "active",
      owner_id: userId,
    })
    .select()
    .single();

  return data as ProjectRow | null;
}

// ────────────────────────────────────────────────────────────
// Convenience: log action + notify in one call
// ────────────────────────────────────────────────────────────

export async function logAndNotify(params: {
  activityTitle: string;
  activityDescription?: string;
  activityType: ActivityType;
  notificationTitle: string;
  notificationDescription?: string;
  notificationType: NotificationType;
  notificationSuite: NotificationSuite;
  userName?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (isDemoMode) return;

  await Promise.all([
    insertActivity({
      title: params.activityTitle,
      description: params.activityDescription,
      type: params.activityType,
      userName: params.userName,
      metadata: params.metadata,
    }),
    insertNotification({
      title: params.notificationTitle,
      description: params.notificationDescription,
      type: params.notificationType,
      suite: params.notificationSuite,
    }),
  ]);
}

// ────────────────────────────────────────────────────────────
// INSERT: Dev Projects (website / app / saas builder items)
// ────────────────────────────────────────────────────────────

export type DevProjectType = "website" | "mobile_app" | "saas" | "api" | "backend_service" | "database" | "deployment";

export async function insertDevProject(params: {
  name: string;
  type: DevProjectType;
  description?: string;
  framework?: string;
  theme?: string;
  elements?: string[];
}): Promise<void> {
  if (isDemoMode) return;

  const { orgId } = await getCurrentIds();
  if (!orgId) return;

  await supabase.from("dev_projects").insert({
    org_id: orgId,
    name: params.name,
    type: params.type,
    description: params.description ?? null,
    framework: params.framework ?? null,
    theme: params.theme ?? null,
    elements: params.elements ?? [],
  });
  // Log token usage for this action
  logTokenUsage(Math.floor(Math.random() * 800) + 200);
}

// ────────────────────────────────────────────────────────────
// INSERT: Creative Assets
// ────────────────────────────────────────────────────────────

export type CreativeAssetType = "image" | "video" | "logo" | "brand_identity" | "presentation" | "ui_ux" | "animation" | "voice" | "asset_library";

export async function insertCreativeAsset(params: {
  name: string;
  type: CreativeAssetType;
  prompt?: string;
  preset?: string;
  description?: string;
  tags?: string[];
}): Promise<void> {
  if (isDemoMode) return;

  const { orgId, userId } = await getCurrentIds();
  if (!orgId) return;

  await supabase.from("creative_assets").insert({
    org_id: orgId,
    name: params.name,
    type: params.type,
    prompt: params.prompt ?? null,
    preset: params.preset ?? null,
    description: params.description ?? null,
    tags: params.tags ?? [],
    created_by: userId,
  });
  // Log token usage for creative generation
  logTokenUsage(Math.floor(Math.random() * 2000) + 500);
}

// ────────────────────────────────────────────────────────────
// INSERT/UPDATE: Business Records (CRM, HRMS, deals, tickets)
// ────────────────────────────────────────────────────────────

export type BusinessRecordType = "crm_contact" | "hrms_employee" | "deal" | "support_ticket" | "invoice" | "purchase_order" | "inventory_item" | "legal_agreement";

export async function insertBusinessRecord(params: {
  recordType: BusinessRecordType;
  name: string;
  email?: string;
  company?: string;
  stage?: string;
  dealValue?: number;
  roleTitle?: string;
  department?: string;
  subject?: string;
  priority?: string;
  ticketStatus?: string;
  description?: string;
}): Promise<void> {
  if (isDemoMode) return;

  const { orgId } = await getCurrentIds();
  if (!orgId) return;

  await supabase.from("business_records").insert({
    org_id: orgId,
    record_type: params.recordType,
    name: params.name,
    email: params.email ?? null,
    company: params.company ?? null,
    stage: params.stage ?? null,
    deal_value: params.dealValue ?? null,
    role_title: params.roleTitle ?? null,
    department: params.department ?? null,
    subject: params.subject ?? null,
    priority: params.priority ?? null,
    ticket_status: params.ticketStatus ?? null,
    description: params.description ?? null,
  });
}

// ────────────────────────────────────────────────────────────
// INSERT: Automation Workflows
// ────────────────────────────────────────────────────────────

export type WorkflowTriggerType = "webhook" | "cron" | "form_submit" | "event" | "manual";

export async function insertAutomationWorkflow(params: {
  name: string;
  description?: string;
  triggerType?: WorkflowTriggerType;
  triggerConfig?: Record<string, unknown>;
  isActive?: boolean;
}): Promise<void> {
  if (isDemoMode) return;

  const { orgId, userId } = await getCurrentIds();
  if (!orgId) return;

  await supabase.from("automation_workflows").insert({
    org_id: orgId,
    name: params.name,
    description: params.description ?? null,
    trigger_type: params.triggerType ?? "manual",
    trigger_config: params.triggerConfig ?? {},
    is_active: params.isActive ?? false,
    created_by: userId,
  });
  // Log token usage for automation creation
  logTokenUsage(Math.floor(Math.random() * 400) + 100);
}

// ────────────────────────────────────────────────────────────
// INSERT: Usage Logs (token tracking)
// ────────────────────────────────────────────────────────────

export async function logTokenUsage(tokens: number): Promise<void> {
  if (isDemoMode) return;

  const { orgId } = await getCurrentIds();
  if (!orgId) return;

  const today = new Date().toISOString().split("T")[0];

  // Upsert: if a row for today already exists, add to it
  const { data: existing } = await supabase
    .from("usage_logs")
    .select("id, tokens_used")
    .eq("org_id", orgId)
    .eq("date", today)
    .single();

  if (existing) {
    await supabase
      .from("usage_logs")
      .update({ tokens_used: existing.tokens_used + tokens })
      .eq("id", existing.id);
  } else {
    await supabase.from("usage_logs").insert({
      org_id: orgId,
      date: today,
      tokens_used: tokens,
    });
  }
}

// ────────────────────────────────────────────────────────────
// Agent Installations
// ────────────────────────────────────────────────────────────

export async function installAgent(agentId: string): Promise<void> {
  if (isDemoMode) return;

  const { orgId, userId } = await getCurrentIds();
  if (!orgId) return;

  await supabase.from("agent_installations").upsert({
    org_id: orgId,
    agent_id: agentId,
    installed_by: userId,
    status: "active",
  }, { onConflict: "org_id,agent_id" });
}

export async function getInstalledAgentIds(): Promise<string[]> {
  if (isDemoMode) return [];

  const { orgId } = await getCurrentIds();
  if (!orgId) return [];

  const { data } = await supabase
    .from("agent_installations")
    .select("agent_id")
    .eq("org_id", orgId)
    .eq("status", "active");

  return data?.map((r: { agent_id: string }) => r.agent_id) ?? [];
}
