"use client";

import React, { useState } from "react";
import {
  Globe,
  Smartphone,
  Layers,
  Webhook,
  Sliders,
  Database as DbIcon,
  CloudLightning,
  ListTodo,
  Code as CodeIcon,
  Bot,
  Plus,
  RotateCcw,
  Trash2,
  Send,
  Loader2,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { insertDevProject, insertActivity } from "@/lib/supabase-actions";
import { NodeCanvas } from "@/components/shared/NodeCanvas";
import { BuilderShell } from "@/components/shared/BuilderShell";
import SiteBuilderWorkspace from "@/components/creative/webdev-dashboard/SiteBuilderWorkspace";

type DevTool =
  | "website"
  | "mobile"
  | "saas"
  | "api"
  | "backend"
  | "database"
  | "deployment"
  | "project"
  | "code"
  | "prompt";

export default function DevSuitePage() {
  const [activeTool, setActiveTool] = useState<DevTool>("website");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [builderTheme, setBuilderTheme] = useState<"light" | "dark">("dark");

  React.useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tool", activeTool);
    window.history.replaceState({}, "", url.toString());
    window.dispatchEvent(new Event("url-change"));
  }, [activeTool]);

  // Grouped Tools Metadata
  const devToolGroups = [
    {
      title: "App Building",
      items: [
        { id: "website", label: "Website Builder", icon: Globe },
        { id: "mobile", label: "Mobile App Builder", icon: Smartphone },
        { id: "saas", label: "SaaS Template Wizard", icon: Layers },
      ],
    },
    {
      title: "Core & Data",
      items: [
        { id: "api", label: "API Schema Designer", icon: Webhook },
        { id: "backend", label: "Backend Service Manager", icon: Sliders },
        { id: "database", label: "Database Designer", icon: DbIcon },
      ],
    },
    {
      title: "Tools & Operations",
      items: [
        { id: "deployment", label: "Deployment Dashboard", icon: CloudLightning },
        { id: "project", label: "Project Manager (Kanban)", icon: ListTodo },
        { id: "code", label: "Code Workstation Layout", icon: CodeIcon },
        { id: "prompt", label: "AI Prompt Workspace", icon: Bot },
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
            <span className="font-display font-bold text-scale-sm text-signal">Dev Workstation</span>
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
          {devToolGroups.map((group, groupIdx) => (
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
                    onClick={() => setActiveTool(tool.id as DevTool)}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-scale-xs font-medium transition-all border border-transparent text-left",
                      isActive
                        ? "bg-signal/10 border-signal/30 text-signal"
                        : "text-muted-foreground hover:bg-void/40 hover:text-bone"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-signal")} />
                    {isSidebarOpen && <span className="truncate">{tool.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Workspace Workspace */}
      <main className="flex-1 bg-void/40 relative overflow-hidden flex flex-col">
        {activeTool === "website" && (
          <SiteBuilderWorkspace
            theme={builderTheme}
            onThemeToggle={() => setBuilderTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            onViewChange={() => {}}
          />
        )}
        {activeTool === "mobile" && <MobileBuilderView />}
        {activeTool === "saas" && <SaaSBuilderView />}
        {activeTool === "api" && <ApiBuilderView />}
        {activeTool === "backend" && <BackendBuilderView />}
        {activeTool === "database" && <DatabaseDesignerView />}
        {activeTool === "deployment" && <DeploymentDashboardView />}
        {activeTool === "project" && <ProjectManagerView />}
        {activeTool === "code" && <CodeEditorView />}
        {activeTool === "prompt" && <AiPromptView />}
      </main>
    </div>
  );
}

/* ==========================================
   SUB-MODULE VIEWS
   ========================================== */


// 2. Mobile App Builder
function MobileBuilderView() {
  const [screens, setScreens] = useState<string[]>(["Core Overview", "Auth Gate"]);
  const [activeScreenIdx, setActiveScreenIdx] = useState(0);

  const sidebarContent = (
    <div className="space-y-4">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">screen layout hierarchy</p>
      <div className="space-y-2">
        {screens.map((screen, idx) => (
          <button
            key={idx}
            onClick={() => setActiveScreenIdx(idx)}
            className={cn(
              "flex items-center justify-between w-full p-2 rounded text-scale-xs text-left border transition-colors",
              idx === activeScreenIdx
                ? "bg-signal/10 border-signal/30 text-signal font-semibold"
                : "border-border/30 bg-void/20 text-muted-foreground hover:text-bone hover:border-border/60"
            )}
          >
            <span>{screen}</span>
            {screens.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setScreens(screens.filter((_, i) => i !== idx));
                  setActiveScreenIdx(0);
                }}
                className="text-muted-foreground hover:text-pulse shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </button>
        ))}
      </div>
      <Button
        onClick={() => {
          setScreens([...screens, `Mobile View #${screens.length + 1}`]);
          insertDevProject({ name: `Mobile View #${screens.length + 1}`, type: "mobile_app", description: `Added screen to mobile app builder` });
        }}
        variant="ghost"
        className="w-full h-8 text-scale-xs border border-dashed border-border/40 hover:bg-void/40 text-bone"
      >
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Mobile View
      </Button>
    </div>
  );

  const propertiesContent = (
    <div className="space-y-4 text-scale-xs">
      <div className="space-y-1">
        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Device Render Frame</label>
        <div className="p-2 bg-void/50 border border-border/40 rounded text-bone font-mono text-[10px]">
          Apple iPhone 15 Pro
        </div>
      </div>
      <div className="pt-2 border-t border-border/20 space-y-2">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">frame diagnostics</p>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Viewport size</span>
          <span className="text-bone font-mono">393 x 852 px</span>
        </div>
      </div>
    </div>
  );

  return (
    <BuilderShell
      title="Mobile device UI builder"
      sidebarTitle="Mobile Screens"
      sidebarContent={sidebarContent}
      propertiesTitle="Screen Settings"
      propertiesContent={propertiesContent}
    >
      <div className="flex-grow flex items-center justify-center p-6 bg-void/25">
        {/* Device Frame */}
        <div className="w-[280px] h-[520px] rounded-[36px] border-[8px] border-surface bg-void shadow-2xl relative flex flex-col justify-between p-4 overflow-hidden ring-1 ring-border/80">
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-surface flex items-center justify-center" />
          
          {/* Screen Body */}
          <div className="flex-1 flex flex-col justify-between pt-6 pb-2">
            <div className="space-y-3 mt-4 text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-signal bg-signal/10 px-2 py-0.5 rounded border border-signal/25">
                screen payload
              </span>
              <h2 className="font-display font-bold text-bone text-scale-base">{screens[activeScreenIdx]}</h2>
              <p className="text-[10px] text-muted-foreground px-4 leading-normal">
                Visual structure editor. Component configurations sync immediately to device compilation buffers.
              </p>
            </div>

            <div className="space-y-2 px-2">
              <div className="bg-surface border border-border/40 rounded-lg p-2.5 text-[10px] text-muted-foreground text-center">
                Visual Content Box
              </div>
              {/* Intentionally non-functional — decorative UI chrome inside the phone device mockup preview */}
              <Button className="w-full bg-signal hover:bg-signal/90 text-void text-[10px] h-8 rounded-md font-semibold">
                Submit Action
              </Button>
            </div>
          </div>
        </div>
      </div>
    </BuilderShell>
  );
}

// 3. SaaS Wizard
function SaaSBuilderView() {
  const [selectedTemplate, setSelectedTemplate] = useState("b2b");
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isInitializing, setIsInitializing] = useState(false);

  return (
    <BuilderShell title="SaaS Template Builder" isEmpty={false}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-surface border border-border/40 rounded-xl p-8 max-w-lg w-full space-y-6 shadow-2xl">
          <div className="flex justify-between items-center border-b border-border/20 pb-4">
            <h2 className="font-display text-scale-lg font-bold text-bone">SaaS Setup Wizard</h2>
            <span className="font-mono text-scale-xs text-signal">Step {currentStep} of 2</span>
          </div>

          {currentStep === 1 ? (
            /* Template Select */
            <div className="space-y-4">
              <p className="text-scale-xs text-muted-foreground">Select a pre-compiled SaaS layout stack:</p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: "b2b", name: "B2B SaaS Portal", desc: "Includes user billing logs, database schemas, and notifications templates." },
                  { id: "creative", name: "Creative AI Sandbox", desc: "Includes multi-modal vector models, composer assets, and playgrounds." },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={cn(
                      "flex flex-col text-left p-4 rounded-lg border bg-void/20 transition-all",
                      selectedTemplate === tpl.id
                        ? "border-signal ring-1 ring-signal bg-signal/[0.01]"
                        : "border-border/30 hover:border-border/80"
                    )}
                  >
                    <span className="font-display font-bold text-scale-xs text-bone">{tpl.name}</span>
                    <span className="text-[10px] text-muted-foreground mt-1 leading-normal">{tpl.desc}</span>
                  </button>
                ))}
              </div>
              <Button
                onClick={() => setCurrentStep(2)}
                className="w-full bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-9 rounded-md mt-4"
              >
                Proceed to configurations
              </Button>
            </div>
          ) : currentStep === 2 ? (
            /* Confirm configuration */
            <div className="space-y-4 text-scale-xs">
              <p className="text-muted-foreground">Confirm workspace infrastructure options:</p>
              <div className="bg-void/50 border border-border/30 p-3.5 rounded-lg space-y-2 font-mono text-[10px] text-muted-foreground">
                <p><span className="text-bone">Workspace Layout:</span> {selectedTemplate === "b2b" ? "B2B SaaS Portal" : "Creative AI Sandbox"}</p>
                <p><span className="text-bone">Database Instance:</span> auto_sqlite_sandbox_v1</p>
                <p><span className="text-bone">Telemetry logs:</span> Enabled</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 border-border/60 hover:bg-void/40 text-bone text-scale-xs h-9"
                >
                  Back
                </Button>
                <Button
                  disabled={isInitializing}
                  onClick={async () => {
                    setIsInitializing(true);
                    await new Promise(r => setTimeout(r, 1000));
                    setIsInitializing(false);
                    setCurrentStep(3);
                    insertDevProject({
                      name: selectedTemplate === "b2b" ? "B2B SaaS Portal" : "Creative AI Sandbox",
                      type: "saas",
                      description: `SaaS template: ${selectedTemplate}. Database: auto_sqlite_sandbox_v1`,
                      framework: "Next.js",
                    });
                    insertActivity({ title: `SaaS stack initialized: ${selectedTemplate}`, description: `Provisioned ${selectedTemplate} template`, type: "dev" });
                  }}
                  className="flex-1 bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-9"
                >
                  {isInitializing ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Initializing...</span>
                  ) : "Initialize SaaS Stack"}
                </Button>
              </div>
            </div>
          ) : (
            /* Step 3: Success */
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-scale-base text-bone">Stack Initialized</h3>
                <p className="text-scale-xs text-muted-foreground leading-relaxed">
                  {selectedTemplate === "b2b" ? "B2B SaaS Portal" : "Creative AI Sandbox"} is ready. Database instance provisioned.
                </p>
              </div>
              <div className="bg-void/50 border border-border/30 p-3 rounded-lg font-mono text-[10px] text-muted-foreground text-left space-y-1">
                <p>✓ Template deployed</p>
                <p>✓ Database: auto_sqlite_sandbox_v1</p>
                <p>✓ Telemetry: connected</p>
              </div>
              <Button
                onClick={() => { setCurrentStep(1); setSelectedTemplate("b2b"); }}
                variant="outline"
                className="w-full text-scale-xs h-9"
              >
                Create Another Stack
              </Button>
            </div>
          )}
        </div>
      </div>
    </BuilderShell>
  );
}

// 4. API Builder
function ApiBuilderView() {
  const [endpoints, setEndpoints] = useState([
    { path: "/v1/users", method: "GET" },
    { path: "/v1/auth/tokens", method: "POST" },
  ]);
  const [activeIdx, setActiveIdx] = useState(0);

  const sidebarContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        {endpoints.map((ep, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={cn(
              "flex items-center justify-between w-full p-2 rounded text-scale-xs text-left border transition-colors",
              idx === activeIdx
                ? "bg-signal/10 border-signal/30 text-signal font-semibold"
                : "border-border/30 bg-void/20 text-muted-foreground hover:text-bone hover:border-border/60"
            )}
          >
            <div className="flex items-center gap-2 font-mono">
              <span className={cn("text-[9px] font-bold px-1.5 py-0.2 rounded border",
                ep.method === "GET" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-amber-500 bg-amber-500/10 border-amber-500/20"
              )}>
                {ep.method}
              </span>
              <span className="text-bone truncate max-w-[120px]">{ep.path}</span>
            </div>
          </button>
        ))}
      </div>
      <Button
        onClick={() => {
          const newPath = `/v1/custom-endpoint-${endpoints.length + 1}`;
          setEndpoints([...endpoints, { path: newPath, method: "GET" }]);
          insertDevProject({ name: `API Endpoint: ${newPath}`, type: "api", description: `Added GET ${newPath}` });
        }}
        variant="ghost"
        className="w-full h-8 text-scale-xs border border-dashed border-border/40 hover:bg-void/40 text-bone"
      >
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Endpoint
      </Button>
    </div>
  );

  const propertiesContent = (
    <div className="space-y-4 text-scale-xs">
      <div className="space-y-1">
        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Authentication</label>
        <div className="p-2 bg-void/50 border border-border/40 rounded text-bone font-mono text-[10px]">
          Session Bearer Key
        </div>
      </div>
    </div>
  );

  return (
    <BuilderShell
      title="API Schema designer"
      sidebarTitle="Endpoints Directory"
      sidebarContent={sidebarContent}
      propertiesTitle="Security Schema"
      propertiesContent={propertiesContent}
    >
      <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
        <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-border/20 pb-3">
            <h3 className="font-display font-bold text-scale-base text-bone">Response Schema Payload</h3>
            <span className="font-mono text-scale-xs text-muted-foreground">JSON payload schema</span>
          </div>
          
          <pre className="bg-void/80 font-mono text-scale-xs p-4 rounded-lg border border-border/30 text-bone overflow-x-auto leading-relaxed">
{`{
  "status": "success",
  "endpoint": "${endpoints[activeIdx]?.path}",
  "timestamp": "${new Date().toISOString()}",
  "records": [
    { "id": 1, "status": "active" }
  ]
}`}
          </pre>
        </div>
      </div>
    </BuilderShell>
  );
}

// 5. Backend Builder
function BackendBuilderView() {
  const [services, setServices] = useState(["auth-handler", "slack-webhook-dispatch"]);
  const [activeIdx, setActiveIdx] = useState(0);

  const sidebarContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        {services.map((svc, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={cn(
              "flex items-center justify-between w-full p-2 rounded text-scale-xs text-left border transition-colors",
              idx === activeIdx
                ? "bg-signal/10 border-signal/30 text-signal font-semibold"
                : "border-border/30 bg-void/20 text-muted-foreground hover:text-bone hover:border-border/60"
            )}
          >
            <span className="font-mono text-bone">{svc}</span>
          </button>
        ))}
      </div>
      <Button
        onClick={() => {
          const svcName = `service-worker-${services.length + 1}`;
          setServices([...services, svcName]);
          insertDevProject({ name: svcName, type: "backend_service", description: `Backend service: ${svcName}` });
        }}
        variant="ghost"
        className="w-full h-8 text-scale-xs border border-dashed border-border/40 hover:bg-void/40 text-bone"
      >
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Service
      </Button>
    </div>
  );

  const propertiesContent = (
    <div className="space-y-4 text-scale-xs">
      <div className="space-y-2">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Service Allocations</p>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Memory allocations</span>
          <span className="text-bone font-mono">256 MB</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Worker timeout</span>
          <span className="text-bone font-mono">30s max</span>
        </div>
      </div>
    </div>
  );

  return (
    <BuilderShell
      title="Backend Serverless Functions"
      sidebarTitle="Service Workers"
      sidebarContent={sidebarContent}
      propertiesTitle="Performance Configurations"
      propertiesContent={propertiesContent}
    >
      <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
        {/* Env panel */}
        <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-border/20 pb-3">
            <h3 className="font-display font-bold text-scale-base text-bone">Environment Variables</h3>
            <span className="text-[10px] font-mono text-muted-foreground">Context bindings</span>
          </div>

          <div className="space-y-2 font-mono text-scale-xs text-bone">
            <div className="grid grid-cols-2 gap-4 py-1.5 border-b border-border/10">
              <span className="text-signal">DATABASE_URL</span>
              <span className="text-muted-foreground truncate">postgresql://admin:***@localhost:5432</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-1.5 border-b border-border/10">
              <span className="text-signal">SLACK_WEBHOOK</span>
              <span className="text-muted-foreground truncate">https://hooks.slack.com/services/***</span>
            </div>
          </div>
        </div>
      </div>
    </BuilderShell>
  );
}

// 6. Database Designer
function DatabaseDesignerView() {
  return (
    <BuilderShell title="Database designer visual canvas" isEmpty={false}>
      <NodeCanvas mode="database" className="flex-grow" />
    </BuilderShell>
  );
}

// 7. Deployment Dashboard
function DeploymentDashboardView() {
  const [activeDeploy, setActiveDeploy] = useState({
    env: "Production",
    version: "v1.4.2",
    commit: "Release stable visual routes",
    status: "DEPLOYED",
  });
  const [isRollingBack, setIsRollingBack] = useState(false);

  const handleRollback = async () => {
    setIsRollingBack(true);
    // Simulate 800ms rollback pipeline trigger
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRollingBack(false);
    setActiveDeploy({
      env: "Production",
      version: "v1.4.1",
      commit: "Rollback to stable connection handles",
      status: "DEPLOYED",
    });
  };

  return (
    <BuilderShell title="Workstation Deployment Dashboard" isEmpty={false}>
      <div className="flex-grow p-6 overflow-y-auto space-y-6">
        
        {/* Environments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Development", "Staging", "Production"].map((env) => {
            const isProd = env === "Production";
            const currentVer = isProd ? activeDeploy.version : "v1.5.0-rc1";
            const currentStatus = isProd ? activeDeploy.status : "DEPLOYED";
            
            return (
              <div key={env} className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex justify-between items-center border-b border-border/20 pb-3">
                  <h3 className="font-display font-bold text-scale-base text-bone">{env}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase">{currentStatus}</span>
                  </div>
                </div>
                <div className="space-y-1 text-scale-xs text-muted-foreground">
                  <p><span className="text-bone font-semibold">Build:</span> {currentVer}</p>
                  <p className="truncate"><span className="text-bone font-semibold">Hash:</span> {isProd ? activeDeploy.commit : "Telemetry check update"}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deploy History & Rollback Panel */}
        <div className="bg-surface border border-border/40 rounded-xl p-6 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
            <div>
              <h3 className="font-display font-bold text-scale-base text-bone">Build Release History</h3>
              <p className="text-scale-xs text-muted-foreground mt-0.5">Deployment log updates and pipelines execution status</p>
            </div>
            {isRollingBack ? (
              <Button disabled className="bg-signal text-void font-semibold text-scale-xs h-9 rounded-md px-4">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Triggering rollback...
              </Button>
            ) : (
              <Button
                onClick={handleRollback}
                className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-9 rounded-md px-4"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Rollback Production to v1.4.1
              </Button>
            )}
          </div>

          <div className="space-y-3 font-mono text-[10px] text-bone">
            <div className="flex items-center justify-between p-2.5 rounded bg-void/50 border border-border/30">
              <div className="flex items-center gap-3">
                <span className="text-signal font-bold">v1.4.2</span>
                <span className="text-muted-foreground truncate max-w-[200px] sm:max-w-md">Release stable visual routes</span>
              </div>
              <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 rounded font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-void/35 border border-border/20">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">v1.4.1</span>
                <span className="text-muted-foreground truncate max-w-[200px] sm:max-w-md">Rollback to stable connection handles</span>
              </div>
              <span className="text-muted-foreground bg-void/80 border border-border/40 px-2 py-0.2 rounded font-bold">SUPERSEDED</span>
            </div>
          </div>
        </div>
      </div>
    </BuilderShell>
  );
}

// 8. Project Manager (Kanban)
interface TaskItem {
  id: string;
  title: string;
  desc: string;
  tag: string;
}

function ProjectManagerView() {
  const [tasks] = useState<{ [key: string]: TaskItem[] }>({
    backlog: [
      { id: "1", title: "Map automation webhook triggers", desc: "Forward events to slack dispatch channels", tag: "automation" },
    ],
    inProgress: [
      { id: "2", title: "Compile visual editor handles", desc: "Build draggable node blocks", tag: "dev" },
    ],
    review: [
      { id: "3", title: "Reconcile MRR payout logs", desc: "Verify conversions telemetry audit", tag: "business" },
    ],
    done: [
      { id: "4", title: "Install next-themes toggle", desc: "Verify class-based transition bindings", tag: "infrastructure" },
    ],
  });

  const getTagColorClass = (tag: string) => {
    switch (tag) {
      case "automation":
        return "bg-circuit/10 text-circuit border-circuit/25";
      case "business":
        return "bg-pulse/10 text-pulse border-pulse/25";
      default:
        return "bg-signal/10 text-signal border-signal/25";
    }
  };

  return (
    <BuilderShell title="Workspace Project Kanban Manager" isEmpty={false}>
      <div className="flex-grow p-6 overflow-x-auto min-h-[400px] flex gap-6 items-start">
        {Object.entries(tasks).map(([columnKey, columnTasks]) => (
          <div key={columnKey} className="bg-surface border border-border/40 rounded-xl p-4 w-64 shrink-0 space-y-4">
            <div className="flex justify-between items-center border-b border-border/25 pb-2">
              <h3 className="font-display font-bold text-scale-sm text-bone capitalize">
                {columnKey === "inProgress" ? "In Progress" : columnKey}
              </h3>
              <span className="font-mono text-[10px] text-muted-foreground bg-void/50 border border-border/40 px-2 py-0.2 rounded">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-void/50 border border-border/30 hover:border-border/60 transition-colors p-3.5 rounded-lg space-y-3 cursor-grab"
                >
                  <div className="space-y-1">
                    <h4 className="text-scale-xs font-semibold text-bone font-sans leading-snug">{task.title}</h4>
                    <p className="text-[10px] text-muted-foreground leading-normal">{task.desc}</p>
                  </div>
                  <span className={cn("text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold uppercase", getTagColorClass(task.tag))}>
                    {task.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </BuilderShell>
  );
}

// 9. Code Editor View
function CodeEditorView() {
  const [activeFile, setActiveFile] = useState("app/page.tsx");

  const sidebarContent = (
    <div className="space-y-4">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">workspace explorer</p>
      <div className="space-y-1 font-mono text-[10px] text-muted-foreground">
        {["app/page.tsx", "components/button.tsx", "lib/utils.ts", "package.json"].map((file) => (
          <button
            key={file}
            onClick={() => setActiveFile(file)}
            className={cn(
              "flex items-center gap-2 w-full px-2 py-1.5 rounded text-left transition-colors",
              file === activeFile ? "bg-signal/15 text-signal font-semibold" : "hover:bg-void/40 hover:text-bone"
            )}
          >
            <span>📁 {file.split("/").pop()}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <BuilderShell title="Code workstation layout" sidebarTitle="Explorer Files" sidebarContent={sidebarContent}>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor Area */}
        <div className="flex-grow p-4 overflow-y-auto bg-void/90 font-mono text-scale-xs text-bone border-b border-border/40 leading-relaxed select-text">
          {activeFile === "app/page.tsx" && (
            <pre>
              <span className="text-pulse">import</span> React <span className="text-pulse">from</span> <span className="text-circuit">{"\"react\""}</span>;
              {"\n"}<span className="text-pulse">import</span> {"{"} Button {"}"} <span className="text-pulse">from</span> <span className="text-circuit">{"\"@/components/ui/button\""}</span>;
              {"\n"}
              {"\n"}<span className="text-pulse">export default function</span> <span className="text-signal">Home</span>() {"{"}
              {"\n"}  <span className="text-pulse">return</span> (
              {"\n"}    &lt;<span className="text-signal">div</span> className=<span className="text-circuit">{"\"space-y-6\""}</span>&gt;
              {"\n"}      &lt;<span className="text-signal">Button</span>&gt;Execute Telemetry&lt;/<span className="text-signal">Button</span>&gt;
              {"\n"}    &lt;/<span className="text-signal">div</span>&gt;
              {"\n"}  );
              {"\n"}{"}"}
            </pre>
          )}
          {activeFile !== "app/page.tsx" && (
            <pre className="text-muted-foreground">
              {"// Code asset compiler bindings active."}
              {"\n// Initialized for: "} {activeFile}
            </pre>
          )}
        </div>

        {/* Terminal panel */}
        <div className="h-40 bg-[#060608] border-t border-border/80 p-3.5 overflow-y-auto font-mono text-[10px] text-muted-foreground shrink-0 leading-normal">
          <div className="flex justify-between items-center text-bone uppercase border-b border-border/20 pb-1 mb-2 font-sans font-bold">
            <span>Terminal Telemetry Output</span>
            <span className="text-emerald-500">online</span>
          </div>
          <p className="text-signal">mavionix_agent_core: initialized cluster bindings</p>
          <p>npm warn deprecated eslint@8.57.1: version is no longer supported</p>
          <p className="text-bone">$ next dev</p>
          <p>✓ Compiled successfully in 1.2s</p>
        </div>
      </div>
    </BuilderShell>
  );
}

// 10. AI Prompt View
function AiPromptView() {
  const [messages, setMessages] = useState<{ sender: "user" | "copilot"; text: string }[]>([
    { sender: "copilot", text: "Hello! I am your AI Developer Copilot. Tell me what visual element, route scheme, or dashboard layout you want built." },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInputText("");
    setIsTyping(true);

    // Simulate 800ms AI code compilation response
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        sender: "copilot",
        text: `Understood. I have compiled the telemetry schema payload for "${userText}". All endpoint routes, database columns, and visual structures are synced to the workspace.`,
      },
    ]);
  };

  return (
    <BuilderShell title="AI Workspace Generator" isEmpty={false}>
      <div className="flex-1 flex flex-col justify-between p-6 h-full max-w-3xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-grow overflow-y-auto space-y-4 pr-2 max-h-[360px] select-text">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex max-w-[85%] rounded-lg p-3 text-scale-xs leading-relaxed",
                msg.sender === "user"
                  ? "bg-signal text-void ml-auto font-sans font-semibold"
                  : "bg-surface border border-border/40 text-bone mr-auto"
              )}
            >
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider mb-1 opacity-70">
                  {msg.sender === "user" ? "user request" : "copilot agent"}
                </p>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-scale-xs text-muted-foreground bg-surface border border-border/40 p-3 rounded-lg max-w-[120px]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-signal" />
              <span>Typing...</span>
            </div>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleSend} className="flex gap-3 bg-surface border border-border/40 p-2 rounded-lg mt-6 relative z-10">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. Scaffold a SaaS dashboard layout with Postgres table columns..."
            className="flex-1 bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal"
          />
          <Button type="submit" className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-9">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </BuilderShell>
  );
}
