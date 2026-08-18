"use client";

import React, { useState } from "react";
import {
  Zap,
  LayoutDashboard,
  Webhook,
  Calendar,
  Sparkles,
  GitPullRequest,
  Activity,
  ChevronRight,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { insertAutomationWorkflow, insertActivity } from "@/lib/supabase-actions";
import { Card } from "@/components/ui/card";
import { NodeCanvas } from "@/components/shared/NodeCanvas";
import { BuilderShell } from "@/components/shared/BuilderShell";

type AutomationTool =
  | "builder"
  | "dashboard"
  | "triggers"
  | "scheduled"
  | "generator"
  | "integrations"
  | "monitoring";

export default function AutomationSuitePage() {
  const [activeTool, setActiveTool] = useState<AutomationTool>("builder");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tool", activeTool);
    window.history.replaceState({}, "", url.toString());
    window.dispatchEvent(new Event("url-change"));
  }, [activeTool]);

  // Grouped Tools Metadata
  const automationToolGroups = [
    {
      title: "Design & Trigger",
      items: [
        { id: "builder", label: "Workflow Builder", icon: Zap },
        { id: "triggers", label: "Event Triggers", icon: Webhook },
        { id: "scheduled", label: "Scheduled Tasks", icon: Calendar },
      ],
    },
    {
      title: "Integrations & AI",
      items: [
        { id: "generator", label: "AI Flow Generator", icon: Sparkles },
        { id: "integrations", label: "Integrations Gateway", icon: GitPullRequest },
      ],
    },
    {
      title: "Operations",
      items: [
        { id: "dashboard", label: "Operations Dashboard", icon: LayoutDashboard },
        { id: "monitoring", label: "Monitoring Logs", icon: Activity },
      ],
    },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden w-full bg-surface border-l border-border/20">
      <aside
        className={cn(
          "bg-surface border-r border-border/20 flex flex-col shrink-0 transition-all duration-300",
          isSidebarOpen ? "w-60" : "w-14"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-12 px-4 border-b border-border/20 flex items-center justify-between bg-void/35 shrink-0">
          {isSidebarOpen && (
            <span className="font-display font-bold text-scale-sm text-circuit">Automation Workstation</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-7 h-7 hover:bg-void/40 text-muted-foreground hover:text-bone mx-auto"
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", isSidebarOpen && "rotate-180")} />
          </Button>
        </div>

        {/* Tools Navigator */}
        <nav className="flex-grow p-2 space-y-3.5 overflow-y-auto">
          {automationToolGroups.map((group, groupIdx) => (
            <div key={group.title} className="space-y-1">
              {isSidebarOpen ? (
                <span className="text-[9px] font-bold text-muted-foreground/45 tracking-widest px-3 block uppercase select-none">
                  {group.title}
                </span>
              ) : (
                groupIdx > 0 && <div className="h-px bg-border/20 my-2 mx-1" />
              )}
              {group.items.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id as AutomationTool)}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-scale-xs font-medium transition-all border border-transparent text-left",
                      isActive
                        ? "bg-circuit/10 border-circuit/30 text-circuit"
                        : "text-muted-foreground hover:bg-void/40 hover:text-bone"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-circuit")} />
                    {isSidebarOpen && <span className="truncate">{tool.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 bg-void/40 relative overflow-hidden flex flex-col">
        {activeTool === "builder" && <WorkflowBuilderView />}
        {activeTool === "dashboard" && <AutomationDashboardView />}
        {activeTool === "triggers" && <EventTriggersView />}
        {activeTool === "scheduled" && <ScheduledTasksView />}
        {activeTool === "generator" && <AiGeneratorView />}
        {activeTool === "integrations" && <IntegrationsView />}
        {activeTool === "monitoring" && <MonitoringView />}
      </main>
    </div>
  );
}

/* ==========================================
   SUB-MODULE VIEWS
   ========================================== */

// 1. Workflow Builder
function WorkflowBuilderView() {
  return (
    <BuilderShell title="Visual Workflow Canvas" accent="circuit" isEmpty={false}>
      <NodeCanvas mode="workflow" className="flex-grow" />
    </BuilderShell>
  );
}

// 2. Automation Dashboard
function AutomationDashboardView() {
  const [activeFlows, setActiveFlows] = useState([
    { id: "1", name: "GitHub Release Slack Dispatch", count: 1240, rate: "99.8%", active: true },
    { id: "2", name: "Stripe Conversions Reconciler", count: 432, rate: "100%", active: true },
    { id: "3", name: "Database Cron Backup Engine", count: 28, rate: "96.4%", active: false },
  ]);

  const handleToggle = (id: string) => {
    setActiveFlows(
      activeFlows.map((flow) =>
        flow.id === id ? { ...flow, active: !flow.active } : flow
      )
    );
  };

  return (
    <BuilderShell title="Automation Operations Dashboard" accent="circuit" isEmpty={false}>
      <div className="flex-grow p-6 overflow-y-auto space-y-6">
        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Total Runs</span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-scale-2xl font-bold text-bone">1,700</span>
              <span className="text-scale-xs font-mono text-emerald-500 font-semibold">+24.5%</span>
            </div>
          </div>
          <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Success Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-scale-2xl font-bold text-bone">98.7%</span>
              <span className="text-scale-xs font-mono text-emerald-500 font-semibold">+0.2%</span>
            </div>
          </div>
        </div>

        {/* Active Workflows Table */}
        <div className="bg-surface border border-border/40 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="font-display font-bold text-scale-base text-bone border-b border-border/20 pb-3">
            Active Telemetry Workflows
          </h3>
          <div className="space-y-3 font-sans text-scale-xs text-bone">
            {activeFlows.map((flow) => (
              <div
                key={flow.id}
                className="flex items-center justify-between p-3.5 rounded-lg bg-void/35 border border-border/20 hover:border-border/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", flow.active ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/60")} />
                  <div>
                    <h4 className="font-semibold text-bone">{flow.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      Runs: {flow.count} | Acc: {flow.rate}
                    </p>
                  </div>
                </div>

                {/* Switch button */}
                <Button
                  onClick={() => handleToggle(flow.id)}
                  variant="outline"
                  className={cn(
                    "text-scale-xs h-7 px-3 rounded font-mono",
                    flow.active
                      ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                      : "border-border/40 text-muted-foreground hover:bg-void/40"
                  )}
                >
                  {flow.active ? "RUNNING" : "INACTIVE"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BuilderShell>
  );
}

// 3. Event Triggers
function EventTriggersView() {
  const [triggers, setTriggers] = useState([
    { type: "POST Webhook", endpoint: "/v1/webhook-receiver", auth: "Bearer" },
    { type: "Cron Schedule", interval: "Every 15 minutes", zone: "UTC" },
  ]);
  const [activeIdx, setActiveIdx] = useState(0);

  const sidebarContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        {triggers.map((trig, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={cn(
              "flex flex-col gap-1 w-full p-2.5 rounded text-scale-xs text-left border transition-colors",
              idx === activeIdx
                ? "bg-circuit/10 border-circuit/30 text-circuit font-semibold"
                : "border-border/30 bg-void/20 text-muted-foreground hover:text-bone hover:border-border/60"
            )}
          >
            <span className="font-display font-bold text-bone">{trig.type}</span>
            <span className="text-[9px] font-mono text-muted-foreground truncate">
              {trig.endpoint || trig.interval}
            </span>
          </button>
        ))}
      </div>
      <Button
        onClick={() => {
          setTriggers([...triggers, { type: "Form Submit", interval: "User Registration", zone: "prod" }]);
          insertAutomationWorkflow({
            name: "Form Submit Trigger",
            description: "User Registration form submit trigger",
            triggerType: "form_submit",
            triggerConfig: { interval: "User Registration", zone: "prod" },
            isActive: false,
          });
          insertActivity({ title: "Automation trigger created", description: "Added Form Submit trigger for User Registration", type: "automation" });
        }}
        variant="ghost"
        className="w-full h-8 text-scale-xs border border-dashed border-border/40 hover:bg-void/40 text-bone"
      >
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Trigger
      </Button>
    </div>
  );

  return (
    <BuilderShell
      title="Active Event Triggers"
      sidebarTitle="Trigger Directory"
      sidebarContent={sidebarContent}
      accent="circuit"
    >
      <div className="flex-grow p-6 overflow-y-auto space-y-4">
        <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-border/20 pb-3">
            <h3 className="font-display font-bold text-scale-base text-bone">Trigger Endpoint Details</h3>
            <span className="font-mono text-scale-xs text-circuit">Telemetry details</span>
          </div>

          <div className="space-y-3 font-mono text-scale-xs text-bone">
            <p><span className="text-muted-foreground uppercase font-sans text-[10px]">Trigger channel:</span> {triggers[activeIdx]?.type}</p>
            <p><span className="text-muted-foreground uppercase font-sans text-[10px]">Parameters:</span> {triggers[activeIdx]?.endpoint || triggers[activeIdx]?.interval}</p>
          </div>
        </div>
      </div>
    </BuilderShell>
  );
}

// 4. Scheduled Tasks
function ScheduledTasksView() {
  const tasks = [
    { name: "Reconcile Database Backups", nextRun: "2026-07-19T03:00:00Z", status: "SCHEDULED" },
    { name: "Audit Monetization Logs", nextRun: "2026-07-20T00:00:00Z", status: "SCHEDULED" },
    { name: "Sync Creative Models Cache", nextRun: "Paused", status: "PAUSED" },
  ];

  return (
    <BuilderShell title="Scheduled Cron Telemetries" accent="circuit" isEmpty={false}>
      <div className="flex-grow p-6 overflow-y-auto space-y-4">
        <div className="bg-surface border border-border/40 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="font-display font-bold text-scale-base text-bone border-b border-border/20 pb-3">
            Scheduled Cycles List
          </h3>

          <div className="space-y-3 font-mono text-[10px] text-bone">
            {tasks.map((task, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded bg-void/50 border border-border/30"
              >
                <div>
                  <h4 className="font-sans font-bold text-scale-xs text-bone">{task.name}</h4>
                  <p className="text-muted-foreground mt-0.5">Next run: {task.nextRun}</p>
                </div>
                <span className={cn("px-2 py-0.2 rounded font-bold border",
                  task.status === "SCHEDULED" ? "text-circuit bg-circuit/10 border-circuit/25" : "text-muted-foreground bg-void/80 border-border/40"
                )}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BuilderShell>
  );
}

// 5. AI Generator
function AiGeneratorView() {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsTyping(true);
    setShowPreview(false);
    // Simulate 800ms AI flow generation
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsTyping(false);
    setShowPreview(true);
  };

  return (
    <BuilderShell title="AI Automation Flow Builder" accent="circuit" isEmpty={false}>
      <div className="flex-grow p-6 flex flex-col justify-between h-full max-w-3xl mx-auto w-full">
        {/* Output */}
        <div className="flex-grow flex items-center justify-center min-h-[250px] relative">
          {isTyping && (
            <div className="flex items-center gap-2 text-scale-xs text-muted-foreground bg-surface border border-border/40 p-4 rounded-lg shadow-xl">
              <Loader2 className="w-4 h-4 animate-spin text-circuit" />
              <span>Generating Automation Flow...</span>
            </div>
          )}

          {!isTyping && !showPreview && (
            <p className="text-scale-xs text-muted-foreground text-center max-w-xs">
              Describe what workflow connection you want to deploy (e.g. Stripe checkout to Discord alert).
            </p>
          )}

          {showPreview && (
            <div className="bg-surface border border-circuit rounded-xl p-5 shadow-2xl space-y-4 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <span className="font-display font-bold text-scale-xs text-bone">Flow Preview</span>
                <span className="text-[9px] font-mono font-bold text-circuit bg-circuit/10 border border-circuit/25 px-1.5 py-0.2 rounded">
                  compiled
                </span>
              </div>
              <div className="flex items-center gap-2 justify-center py-4 text-scale-xs text-bone font-mono">
                <div className="p-2 border border-circuit/40 bg-void/50 rounded">Webhook Trigger</div>
                <ChevronRight className="w-4 h-4 text-circuit shrink-0" />
                <div className="p-2 border border-circuit/40 bg-void/50 rounded">Discord Post</div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleGenerate} className="flex gap-3 bg-surface border border-border/40 p-2 rounded-lg relative z-10">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. When a Stripe transaction succeeds, forward metadata to Discord channel..."
            className="flex-1 bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-circuit"
          />
          <Button type="submit" className="bg-circuit hover:bg-circuit/90 text-void font-semibold text-scale-xs h-9">
            Generate Flow
          </Button>
        </form>
      </div>
    </BuilderShell>
  );
}

// 6. Integrations Gateway
function IntegrationsView() {
  const [apps, setApps] = useState([
    { id: "slack", name: "Slack", desc: "Dispatch telemetry channels alerts.", connected: true },
    { id: "github", name: "GitHub", desc: "Listen for code branch repository triggers.", connected: false },
    { id: "stripe", name: "Stripe", desc: "Audit conversions payments logs.", connected: false },
  ]);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = async (id: string) => {
    setConnectingId(id);
    // Simulate 800ms OAuth pipeline integration
    await new Promise((resolve) => setTimeout(resolve, 800));
    setApps(
      apps.map((app) => (app.id === id ? { ...app, connected: true } : app))
    );
    setConnectingId(null);
  };

  return (
    <BuilderShell title="Operational Integrations Manager" accent="circuit" isEmpty={false}>
      <div className="flex-grow p-6 overflow-y-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Card key={app.id} className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-bold text-scale-base text-bone">{app.name}</h3>
                  <span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border",
                    app.connected ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-muted-foreground bg-void/50 border-border/45"
                  )}>
                    {app.connected ? "CONNECTED" : "DISCONNECTED"}
                  </span>
                </div>
                <p className="text-scale-xs text-muted-foreground leading-normal">{app.desc}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-border/15">
                {app.connected ? (
                  <Button variant="ghost" disabled className="w-full text-scale-xs h-8 text-muted-foreground">
                    Telemetry config active
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleConnect(app.id)}
                    disabled={connectingId === app.id}
                    className="w-full bg-circuit hover:bg-circuit/90 text-void font-semibold text-scale-xs h-8 rounded-md"
                  >
                    {connectingId === app.id ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Authorizing...</span>
                      </span>
                    ) : (
                      <span>Authorize Integration</span>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </BuilderShell>
  );
}

// 7. Monitoring Logs View
function MonitoringView() {
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");

  const mockLogs = [
    { id: "1", title: "API Dispatch POST /v1/webhook", status: "success", time: "10:14:02 UTC", body: "Reconciliation confirmed. status=200" },
    { id: "2", title: "Cron Cycle DB Backup", status: "success", time: "10:00:00 UTC", body: "Sqlite database copy successful. sizes=4.2MB" },
    { id: "3", title: "Stripe Trigger Webhooks Handler", status: "error", time: "09:42:15 UTC", body: "TLS verification failed. code=CONN_RESET" },
    { id: "4", title: "Visual Flow Runner Dispatch", status: "success", time: "09:30:10 UTC", body: "Tasks queue dispatched successfully." },
  ];

  const filteredLogs = mockLogs.filter((log) => {
    if (filter === "success") return log.status === "success";
    if (filter === "error") return log.status === "error";
    return true;
  });

  return (
    <BuilderShell title="Automation Telemetry Monitoring Console" accent="circuit" isEmpty={false}>
      <div className="flex-grow p-6 overflow-y-auto space-y-6 flex flex-col">
        {/* Table Filters */}
        <div className="flex items-center gap-3 border-b border-border/20 pb-4">
          <span className="text-scale-xs text-muted-foreground">Filter Logs:</span>
          {(["all", "success", "error"] as const).map((btn) => (
            <Button
              key={btn}
              variant="ghost"
              onClick={() => setFilter(btn)}
              className={cn(
                "text-scale-xs h-7 px-3 rounded uppercase font-mono",
                filter === btn
                  ? "bg-circuit/10 text-circuit border border-circuit/30"
                  : "text-muted-foreground hover:text-bone hover:bg-void/40"
              )}
            >
              {btn}
            </Button>
          ))}
        </div>

        {/* Custom dark terminal console log viewer */}
        <div className="flex-grow bg-[#060608] border border-border/80 rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[300px] select-text">
          <div className="h-9 px-4 border-b border-border/20 flex items-center justify-between bg-void/50 shrink-0 text-[10px] font-sans font-bold text-bone">
            <span>TERMINAL TELEMETRY LOGS</span>
            <span className="text-circuit uppercase">online</span>
          </div>

          <div className="flex-grow p-4 font-mono text-[10px] text-muted-foreground overflow-y-auto space-y-2 leading-relaxed">
            {filteredLogs.map((log) => (
              <div key={log.id} className="space-y-1.5 p-2 rounded bg-void/35 border border-border/10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {log.status === "success" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-pulse shrink-0" />
                    )}
                    <span className="text-bone font-semibold">{log.title}</span>
                  </div>
                  <span className="text-muted-foreground">{log.time}</span>
                </div>
                <p className="pl-5 text-muted-foreground/80">{log.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BuilderShell>
  );
}
