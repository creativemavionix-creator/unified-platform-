/**
 * Client persistence for CRM Pipeline (leads, activities, recommendations, workflows).
 */
import {
  LEADS as SEED_LEADS,
  ACTIVITIES as SEED_ACTIVITIES,
  AI_RECOMMENDATIONS as SEED_RECS,
  WORKFLOWS as SEED_WORKFLOWS,
  type Lead,
  type ActivityItem,
  type AIRecommendation,
  type WorkflowItem,
} from "@/components/business/lead-crm/leadCrmMockData";

const STORAGE_KEY = "mvx_crm_workspace_v1";

export type CrmWorkspaceState = {
  leads: Lead[];
  activities: ActivityItem[];
  recommendations: AIRecommendation[];
  workflows: WorkflowItem[];
  dismissedRecIds: string[];
};

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function defaultState(): CrmWorkspaceState {
  return {
    leads: SEED_LEADS.map((l) => ({ ...l, tags: [...l.tags] })),
    activities: SEED_ACTIVITIES.map((a) => ({ ...a })),
    recommendations: SEED_RECS.map((r) => ({ ...r })),
    workflows: SEED_WORKFLOWS.map((w) => ({ ...w })),
    dismissedRecIds: [],
  };
}

function readState(): CrmWorkspaceState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<CrmWorkspaceState>;
    const base = defaultState();
    return {
      leads: Array.isArray(parsed.leads) && parsed.leads.length ? parsed.leads : base.leads,
      activities: Array.isArray(parsed.activities) ? parsed.activities : base.activities,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : base.recommendations,
      workflows: Array.isArray(parsed.workflows) ? parsed.workflows : base.workflows,
      dismissedRecIds: Array.isArray(parsed.dismissedRecIds) ? parsed.dismissedRecIds : [],
    };
  } catch {
    return defaultState();
  }
}

function writeState(state: CrmWorkspaceState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn("CRM workspace could not be persisted");
    return;
  }
  window.dispatchEvent(new CustomEvent("mvx-crm-store"));
}

export function getCrmState(): CrmWorkspaceState {
  return readState();
}

export function subscribeCrm(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener("mvx-crm-store", listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("mvx-crm-store", listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function updateLead(leadId: string, patch: Partial<Lead>): Lead | null {
  const state = readState();
  let updated: Lead | null = null;
  state.leads = state.leads.map((l) => {
    if (l.id !== leadId) return l;
    updated = { ...l, ...patch };
    return updated;
  });
  writeState(state);
  return updated;
}

export function addActivity(item: Omit<ActivityItem, "id" | "time"> & { time?: string }): ActivityItem {
  const state = readState();
  const activity: ActivityItem = {
    id: uid("a"),
    time: item.time || "Just now",
    ...item,
  };
  state.activities = [activity, ...state.activities].slice(0, 200);
  writeState(state);
  return activity;
}

export function setRecommendations(recs: AIRecommendation[]): void {
  const state = readState();
  state.recommendations = recs;
  state.dismissedRecIds = [];
  writeState(state);
}

export function dismissRecommendation(id: string): void {
  const state = readState();
  state.recommendations = state.recommendations.filter((r) => r.id !== id);
  state.dismissedRecIds = [...state.dismissedRecIds, id].slice(-100);
  writeState(state);
}

export function setWorkflows(workflows: WorkflowItem[]): void {
  const state = readState();
  state.workflows = workflows;
  writeState(state);
}

export function upsertWorkflow(workflow: WorkflowItem): void {
  const state = readState();
  const idx = state.workflows.findIndex((w) => w.id === workflow.id);
  if (idx >= 0) state.workflows[idx] = workflow;
  else state.workflows = [workflow, ...state.workflows];
  writeState(state);
}
