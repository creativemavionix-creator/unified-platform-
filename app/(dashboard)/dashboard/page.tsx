"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Sparkles,
  Code2,
  Briefcase,
  Cpu,
  TrendingUp,
  Zap,
  Bell,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Plus,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  aiRecommendations,
  quickActions,
} from "@/lib/mock-data";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { useRealtimeActivity } from "@/hooks/use-realtime-activity";
import { useRealtimeTasks, toDbStatus } from "@/hooks/use-realtime-tasks";
import { useRealtimeProjects } from "@/hooks/use-realtime-projects";
import { useWorkspaceOverview } from "@/hooks/use-workspace-overview";
import { insertActivity, logAndNotify, updateTaskStatus, insertTask } from "@/lib/supabase-actions";
import { isDemoMode } from "@/lib/supabase";
import { formatOrgName } from "@/lib/utils";

interface TooltipPayloadItem {
  payload: { day: string };
  value: number;
}

const gettingStartedRecommendations = [
  {
    id: "rec-gs-001",
    title: "Initialize Your First Project",
    description: "Build a solid foundation. Scaffolding a project in the Dev Suite will unlock code generation, deploy tracking, and repository integration.",
    actionLabel: "Launch Dev Suite",
    actionHref: "/dev",
    suite: "dev" as const,
    confidence: 99,
  },
  {
    id: "rec-gs-002",
    title: "Generate Brand Assets",
    description: "Start designing. Upload or describe your vision in the Creative Suite to instantly generate logos, UI drafts, and brand assets.",
    actionLabel: "Launch Creative Suite",
    actionHref: "/creative",
    suite: "creative" as const,
    confidence: 95,
  },
  {
    id: "rec-gs-003",
    title: "Configure Workspace Integrity",
    description: "Optimize operations. Set up CRM leads or support tickets in the Business Suite to start tracking team productivity metrics.",
    actionLabel: "Launch Business Suite",
    actionHref: "/business",
    suite: "business" as const,
    confidence: 90,
  },
];

export default function DashboardHome() {
  const router = useRouter();
  const [commandInput, setCommandInput] = useState("");
  const { tasks: localTasks, setTasks: setLocalTasks } = useRealtimeTasks();
  const { projects: liveProjects } = useRealtimeProjects();
  const { notifications: localNotifications, markRead: markNotifRead } = useRealtimeNotifications();
  const { activities: liveActivities } = useRealtimeActivity();
  const { overview: workspaceOverview, weeklyTokens } = useWorkspaceOverview();
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTaskSuite, setNewTaskSuite] = useState<"dev" | "creative" | "business" | "automation">("dev");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");

  const displayedRecommendations = liveProjects.length === 0 ? gettingStartedRecommendations : aiRecommendations;

  const cleanedActivities = React.useMemo(() => {
    const currentUserName = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("mvx_user_profile") || "{}")?.name || "Alex Mercer"
      : "Alex Mercer";

    const mapped = liveActivities.map((act) => {
      let actor = act.user;
      if (actor === "System") {
        const isUserAction =
          act.title.toLowerCase().includes("task") ||
          act.title.toLowerCase().includes("project") ||
          act.title.toLowerCase().includes("profile") ||
          act.title.toLowerCase().includes("settings") ||
          act.title.toLowerCase().includes("crm") ||
          act.title.toLowerCase().includes("contact") ||
          act.title.toLowerCase().includes("api key") ||
          act.title.toLowerCase().includes("session");
        
        if (isUserAction) {
          actor = currentUserName;
        }
      }
      return { ...act, user: actor };
    });

    const result: typeof liveActivities = [];
    for (let i = 0; i < mapped.length; i++) {
      const current = mapped[i];
      if (i > 0) {
        const previous = mapped[i - 1];
        if (current.title === previous.title && current.description === previous.description) {
          continue;
        }
      }
      result.push(current);
    }
    return result;
  }, [liveActivities]);

  const handleCommandSubmit = () => {
    if (!commandInput.trim()) return;
    toast.success("Routing to AI Assistant...");
    const trigger = document.querySelector('[aria-label="Open AI Assistant"]') as HTMLButtonElement;
    if (trigger) trigger.click();
  };

  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error("Task title is required");
      return;
    }

    const title = newTaskTitle.trim();
    const priority = newTaskPriority;
    const suite = newTaskSuite;
    const assignee = newTaskAssignee.trim() || "Unassigned";

    try {
      if (!isDemoMode) {
        await insertTask({
          title,
          suite,
          assigneeName: assignee,
          priority,
        });
      }

      await insertActivity({
        title: `Task created: ${title}`,
        description: `Assigned to ${assignee} (Priority: ${priority})`,
        type: suite as "dev" | "creative" | "business" | "automation",
      });

      if (isDemoMode) {
        const newTask = {
          id: Math.random().toString(36).substring(2, 9),
          title,
          description: "",
          suite,
          assignee,
          status: "todo" as const,
          priority,
          dueDate: "",
        };
        setLocalTasks((prev) => [newTask, ...prev]);
      }

      toast.success(`Task "${title}" added`);

      setNewTaskTitle("");
      setNewTaskPriority("medium");
      setNewTaskSuite("dev");
      setNewTaskAssignee("");
      setShowAddTaskForm(false);
    } catch (err) {
      console.error("[AddTask] Error adding task:", err);
      toast.error("Failed to add task");
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    setLocalTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newStatus = t.status === "done" ? "todo" : "done";
        toast.success(newStatus === "done" ? `Task "${t.title}" completed` : `Task "${t.title}" reopened`);
        // Write to Supabase
        updateTaskStatus(taskId, toDbStatus(newStatus) as "todo" | "in_progress" | "done");
        // Log to activity/notifications
        if (newStatus === "done") {
          logAndNotify({
            activityTitle: `Task completed: ${t.title}`,
            activityDescription: `Marked "${t.title}" as done`,
            activityType: t.suite as "dev" | "creative" | "business" | "automation",
            notificationTitle: "Task Completed",
            notificationDescription: `"${t.title}" has been marked as done.`,
            notificationType: "success",
            notificationSuite: t.suite as "dev" | "creative" | "business" | "automation",
          });
        } else {
          insertActivity({
            title: `Task reopened: ${t.title}`,
            description: `Reopened "${t.title}"`,
            type: t.suite as "dev" | "creative" | "business" | "automation",
          });
        }
        return { ...t, status: newStatus as "todo" | "in-progress" | "done" };
      }
      return t;
    }));
  };

  const markNotificationRead_local = (notifId: string) => {
    markNotifRead(notifId);
    toast.info("Notification marked as read");
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border/40 p-3 rounded-xl shadow-xl text-sm">
          <p className="font-semibold text-bone">{payload[0].payload.day}</p>
          <p className="font-mono text-signal mt-0.5">{payload[0].value.toLocaleString()} tokens</p>
        </div>
      );
    }
    return null;
  };

  const suiteIcons: Record<string, React.ReactNode> = {
    dev: <Code2 className="w-3.5 h-3.5" />,
    creative: <Sparkles className="w-3.5 h-3.5" />,
    business: <Briefcase className="w-3.5 h-3.5" />,
    automation: <Cpu className="w-3.5 h-3.5" />,
  };

  const priorityColors: Record<string, string> = {
    high: "text-red-500 bg-red-500/10 border-red-500/20",
    medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    low: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full space-y-8 pb-12">
      {/* ═══════════════════════════════════════
          1. AI COMMAND CENTER — Visual anchor
         ═══════════════════════════════════════ */}
      <section className="relative rounded-2xl border border-signal/20 bg-gradient-to-br from-signal/5 via-transparent to-transparent dark:from-signal/10 p-6 sm:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-signal/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill border border-signal/25 bg-signal/5 dark:bg-signal/10 mb-4">
            <Sparkles className="w-3 h-3 text-signal" />
            <span className="eyebrow text-signal">AI COMMAND CENTER</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-bone uppercase tracking-tight leading-tight mb-3">
            ASK AI TO <span className="text-gradient">BUILD, GENERATE,</span> OR AUTOMATE
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Describe what you want to create and MaVionix AI will route it to the right suite.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCommandSubmit()}
                placeholder="Build a landing page, generate a logo, automate onboarding..."
                className="w-full h-12 pl-10 pr-4 rounded-pill border border-border/40 bg-surface/80 dark:bg-surface/40 text-sm text-bone placeholder:text-muted-foreground/60 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all"
              />
            </div>
            <Button size="lg" className="h-12 px-6" onClick={handleCommandSubmit}>
              <Send className="w-4 h-4 mr-2" />
              Ask AI
            </Button>
          </div>
          {/* Prompt chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {["Scaffold a Next.js app", "Generate brand assets", "Create a sales workflow", "Deploy to production"].map((chip) => (
              <button
                key={chip}
                onClick={() => setCommandInput(chip)}
                className="text-xs px-3 py-1.5 rounded-pill border border-border/30 text-muted-foreground hover:text-signal hover:border-signal/30 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Top row: Workspace Overview + AI Chat preview + Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══════════════════════════════════════
            2. WORKSPACE OVERVIEW
           ═══════════════════════════════════════ */}
        <section className="rounded-2xl border border-border/40 bg-surface/80 dark:bg-surface/40 dark:backdrop-blur-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-bone">Workspace</h3>
            <Link href="/settings" className="text-xs text-signal hover:underline">Manage →</Link>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Organization</span>
              <span className="font-medium text-bone">{formatOrgName(workspaceOverview.orgName)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium text-signal">{workspaceOverview.planTier}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Seats</span>
              <span className="font-medium text-bone">{workspaceOverview.seatsUsed}/{workspaceOverview.seatsTotal}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Active Projects</span>
              <span className="font-medium text-bone">{workspaceOverview.activeProjects}</span>
            </div>
            {/* Token usage bar */}
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Tokens</span>
                <span className="text-bone font-mono">{(workspaceOverview.tokensUsed / 1000).toFixed(0)}K / {(workspaceOverview.tokensLimit / 1000).toFixed(0)}K</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-pill overflow-hidden">
                <div
                  className="h-full bg-signal rounded-pill transition-all"
                  style={{ width: `${(workspaceOverview.tokensUsed / workspaceOverview.tokensLimit) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            3. AI ASSISTANT CHAT PREVIEW
           ═══════════════════════════════════════ */}
        <section className="rounded-2xl border border-signal/20 bg-gradient-to-br from-signal/5 to-transparent dark:from-signal/8 p-5 space-y-4 card-gradient-bar">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C026D3] to-[#6366F1] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-bone">AI Assistant</h3>
              <span className="text-xs text-muted-foreground">Ready to help</span>
            </div>
          </div>
          <div className="bg-void/50 dark:bg-void/80 border border-border/20 p-3 rounded-xl text-sm text-muted-foreground leading-relaxed">
            &quot;I can build websites, generate assets, create automations, and manage your business ops. What should we work on?&quot;
          </div>
          <div className="flex flex-wrap gap-2">
            {["Build", "Generate", "Automate", "Analyze"].map((label) => (
              <span key={label} className="text-xs px-2.5 py-1 rounded-pill bg-signal/10 text-signal border border-signal/20">
                {label}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Click the floating <Sparkles className="inline w-3 h-3 text-signal" /> button to open full chat →</p>
        </section>

        {/* ═══════════════════════════════════════
            4. ANALYTICS (Token Usage Chart)
           ═══════════════════════════════════════ */}
        <section className="rounded-2xl border border-border/40 bg-surface/80 dark:bg-surface/40 dark:backdrop-blur-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-bone">Token Usage</h3>
            <div className="flex items-center gap-1 text-emerald-500 eyebrow bg-emerald-500/10 px-2 py-0.5 rounded-pill border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" />
              <span>+12%</span>
            </div>
          </div>
          <div className="h-36 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTokens} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--signal)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--signal)" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--bone)" opacity={0.3} tickLine={false} fontSize={10} />
                <YAxis stroke="var(--bone)" opacity={0.3} tickLine={false} fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tokens" radius={[4, 4, 0, 0]} maxBarSize={24} fill="url(#barGrad)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════
          5. RECENT PROJECTS (cross-suite)
         ═══════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-bone">Recent Projects</h3>
          <span className="text-xs text-muted-foreground">{liveProjects.length} total</span>
        </div>
        {liveProjects.length === 0 ? (
          <div className="rounded-2xl border border-border/30 bg-surface/20 dark:bg-surface/10 p-8 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-xl bg-signal/10 border border-signal/20 flex items-center justify-center text-signal">
              <FolderPlus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-bone text-sm">No Projects Initiated</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Create your first project inside any of the specialized suites to begin automated scaffolding.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/dev")}
              className="h-8 text-xs font-semibold px-4 rounded-pill"
            >
              Start New Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {liveProjects.slice(0, 8).map((project) => (
              <div
                key={project.id}
                onClick={() => { toast.info(`Opening ${project.name}`); router.push(`/${project.suite === "dev" ? "dev" : project.suite === "creative" ? "creative" : project.suite === "business" ? "business" : "automation"}`); }}
                className="rounded-2xl border border-border/40 bg-surface/80 dark:bg-surface/40 dark:backdrop-blur-xl p-4 space-y-3 hover:border-signal/30 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-signal/10 border border-signal/20 flex items-center justify-center text-signal">
                    {suiteIcons[project.suite]}
                  </div>
                  <span className={`eyebrow px-2 py-0.5 rounded-pill border ${
                    project.status === "active" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                    project.status === "completed" ? "text-signal bg-signal/10 border-signal/20" :
                    "text-muted-foreground bg-muted/50 border-border/30"
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-bone group-hover:text-signal transition-colors truncate">{project.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">{project.suite} · {project.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Middle row: Quick Actions + Notifications + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══════════════════════════════════════
            6. QUICK ACTIONS
           ═══════════════════════════════════════ */}
        <section className="rounded-2xl border border-border/40 bg-surface/80 dark:bg-surface/40 dark:backdrop-blur-xl p-5 space-y-4">
          <h3 className="font-display font-bold text-base text-bone">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="flex flex-col gap-1.5 p-3 rounded-xl border border-border/30 hover:border-signal/30 hover:bg-signal/5 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-signal/10 border border-signal/20 flex items-center justify-center text-signal group-hover:scale-105 transition-transform">
                  {suiteIcons[action.suite]}
                </div>
                <span className="text-xs font-medium text-bone">{action.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            7. NOTIFICATIONS FEED
           ═══════════════════════════════════════ */}
        <section className="rounded-2xl border border-border/40 bg-surface/80 dark:bg-surface/40 dark:backdrop-blur-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-signal" />
              <h3 className="font-display font-bold text-base text-bone">Notifications</h3>
            </div>
            <span className="eyebrow text-signal bg-signal/10 px-2 py-0.5 rounded-pill border border-signal/20">
              {localNotifications.filter((n) => !n.read).length} new
            </span>
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {localNotifications.length === 0 ? (
              <div className="text-center py-8 px-4 flex flex-col items-center justify-center space-y-2 animate-in fade-in duration-300">
                <Bell className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-xs font-medium text-bone">No notifications yet</p>
                <p className="text-[11px] text-muted-foreground">We'll alert you when important suite events occur.</p>
              </div>
            ) : (
              localNotifications.slice(0, 6).map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => markNotificationRead_local(notif.id)}
                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors w-full text-left ${!notif.read ? "bg-signal/5 dark:bg-signal/8" : "hover:bg-muted/30"}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    notif.type === "success" ? "bg-emerald-500" :
                    notif.type === "error" ? "bg-red-500" :
                    notif.type === "warning" ? "bg-amber-500" :
                    "bg-signal"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-bone truncate">{notif.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{notif.description}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            8. TASKS LIST (cross-suite, checkable)
           ═══════════════════════════════════════ */}
        <section className="rounded-2xl border border-border/40 bg-surface/80 dark:bg-surface/40 dark:backdrop-blur-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-bone">Tasks</h3>
              <span className="text-xs text-muted-foreground">
                ({localTasks.filter((t) => t.status !== "done").length} pending)
              </span>
            </div>
            <button
              onClick={() => setShowAddTaskForm(!showAddTaskForm)}
              className="text-xs text-signal hover:text-signal/80 flex items-center gap-1 transition-colors"
            >
              {showAddTaskForm ? "Cancel" : <><Plus className="w-3.5 h-3.5" /> Add Task</>}
            </button>
          </div>

          {showAddTaskForm && (
            <form onSubmit={handleAddTaskSubmit} className="space-y-3 p-3 rounded-xl border border-border/30 bg-void/30 dark:bg-void/50 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="w-full rounded border border-border/40 bg-void/50 text-bone px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-signal placeholder:text-muted-foreground/60 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")}
                    className="w-full rounded border border-border/40 bg-void/50 text-bone px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-signal transition-all"
                  >
                    <option value="low" className="bg-surface text-bone">Low</option>
                    <option value="medium" className="bg-surface text-bone">Medium</option>
                    <option value="high" className="bg-surface text-bone">High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Suite</label>
                  <select
                    value={newTaskSuite}
                    onChange={(e) => setNewTaskSuite(e.target.value as any)}
                    className="w-full rounded border border-border/40 bg-void/50 text-bone px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-signal transition-all"
                  >
                    <option value="dev" className="bg-surface text-bone">Dev</option>
                    <option value="creative" className="bg-surface text-bone">Creative</option>
                    <option value="business" className="bg-surface text-bone">Business</option>
                    <option value="automation" className="bg-surface text-bone">Automation</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Assignee</label>
                <input
                  type="text"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  placeholder="e.g. Alice, Bob (optional)"
                  className="w-full rounded border border-border/40 bg-void/50 text-bone px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-signal placeholder:text-muted-foreground/60 transition-all"
                />
              </div>

              <Button type="submit" size="sm" className="w-full h-8 mt-1 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Task
              </Button>
            </form>
          )}

          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {localTasks.length === 0 ? (
              <div className="text-center py-8 px-4 flex flex-col items-center justify-center space-y-2 animate-in fade-in duration-300">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-xs font-medium text-bone">All caught up!</p>
                <p className="text-[11px] text-muted-foreground max-w-[200px] mx-auto">No pending tasks in your workspace. Click '+ Add Task' to create one.</p>
              </div>
            ) : (
              localTasks.slice(0, 7).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <button className="mt-0.5 shrink-0" onClick={() => toggleTaskStatus(task.id)}>
                    {task.status === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-signal" />
                    ) : task.status === "in-progress" ? (
                      <Clock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.status === "done" ? "line-through text-muted-foreground" : "text-bone"}`}>
                        {task.title}
                      </p>
                      <span className={`eyebrow px-1.5 py-0.5 rounded-pill border shrink-0 ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{task.suite} · {task.assignee}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Bottom row: AI Recommendations + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══════════════════════════════════════
            9. AI RECOMMENDATIONS
           ═══════════════════════════════════════ */}
        <section className="rounded-2xl border border-signal/20 bg-gradient-to-br from-signal/5 to-transparent dark:from-signal/8 p-5 space-y-4 card-gradient-bar">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-signal" />
            <h3 className="font-display font-bold text-base text-bone">AI Recommendations</h3>
          </div>
          <div className="space-y-3">
            {displayedRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-surface/50 dark:bg-surface/20 hover:border-signal/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-signal/10 border border-signal/20 flex items-center justify-center text-signal shrink-0">
                  {suiteIcons[rec.suite]}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-bone">{rec.title}</p>
                    <span className="text-xs font-mono text-signal">{rec.confidence}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{rec.description}</p>
                  <Link href={rec.actionHref} className="inline-flex items-center gap-1 text-xs text-signal font-medium hover:underline">
                    {rec.actionLabel} <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            10. RECENT ACTIVITY (unified timeline)
           ═══════════════════════════════════════ */}
        <section className="rounded-2xl border border-border/40 bg-surface/80 dark:bg-surface/40 dark:backdrop-blur-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-signal" />
            <h3 className="font-display font-bold text-base text-bone">Recent Activity</h3>
          </div>
          <div className="space-y-1">
            {cleanedActivities.length === 0 ? (
              <div className="text-center py-8 px-4 flex flex-col items-center justify-center space-y-2 animate-in fade-in duration-300">
                <Zap className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-xs font-medium text-bone">No activity logged</p>
                <p className="text-[11px] text-muted-foreground">Your workspace actions and events will show up here.</p>
              </div>
            ) : (
              cleanedActivities.slice(0, 7).map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-signal/10 border border-signal/20 flex items-center justify-center text-signal shrink-0 mt-0.5">
                    {suiteIcons[act.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-bone truncate">{act.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{act.user.split(" ")[0]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{act.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Send({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}
