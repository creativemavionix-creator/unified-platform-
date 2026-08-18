"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Home, Sparkles, Cpu, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Workspace {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "signal" | "pulse" | "circuit";
}

const defaultWorkspaces: Workspace[] = [
  {
    id: "dev-core",
    name: "Engineering Core",
    description: "Bundles repository telemetry, API testing tools, and container diagnostics.",
    icon: Home,
    accent: "signal",
  },
  {
    id: "creative-studio",
    name: "Creative Studio",
    description: "Bundles vector layout engines, audio synthesizers, and copywriters.",
    icon: Sparkles,
    accent: "pulse",
  },
  {
    id: "automations-hub",
    name: "Automations Hub",
    description: "Bundles cron executors, webhooks maps, and flow runners.",
    icon: Cpu,
    accent: "circuit",
  },
];

export default function WorkspaceSelectionPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>("dev-core");
  const [workspaces, setWorkspaces] = useState<Workspace[]>(defaultWorkspaces);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getAccentBorder = (accent: "signal" | "pulse" | "circuit", selected: boolean) => {
    if (!selected) return "border-border/40 hover:border-border/80";
    switch (accent) {
      case "pulse":
        return "border-pulse ring-1 ring-pulse shadow-[0_0_12px_rgba(236,72,153,0.2)]";
      case "circuit":
        return "border-circuit ring-1 ring-circuit shadow-[0_0_12px_rgba(34,211,238,0.2)]";
      default:
        return "border-signal ring-1 ring-signal shadow-[0_0_12px_rgba(139,92,246,0.2)]";
    }
  };

  const getAccentText = (accent: "signal" | "pulse" | "circuit") => {
    switch (accent) {
      case "pulse":
        return "text-pulse";
      case "circuit":
        return "text-circuit";
      default:
        return "text-signal";
    }
  };

  const getAccentBg = (accent: "signal" | "pulse" | "circuit") => {
    switch (accent) {
      case "pulse":
        return "bg-pulse/10 border-pulse/20";
      case "circuit":
        return "bg-circuit/10 border-circuit/20";
      default:
        return "bg-signal/10 border-signal/20";
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newId = `custom-${Date.now()}`;
    const newWorkspace: Workspace = {
      id: newId,
      name: customName,
      description: "Custom operational workspace initialized with neural tools.",
      icon: Home,
      accent: "signal",
    };

    setWorkspaces([...workspaces, newWorkspace]);
    setSelectedId(newId);
    setCustomName("");
    setShowCustomInput(false);
  };

  const handleContinue = async () => {
    setIsLoading(true);
    // Simulate 800ms workspace routing bind
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setIsSuccess(true);

    setTimeout(() => {
      router.push("/dashboard");
    }, 450);
  };

  return (
    <div className="bg-surface border border-border/45 rounded-xl p-8 space-y-6 shadow-xl relative z-10 w-full max-w-xl mx-auto">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-scale-xl font-bold text-bone">Choose Workspace</h1>
        <p className="text-scale-xs text-muted-foreground font-mono uppercase tracking-wider">
          Step 4: Pick Initial Operational Context
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {workspaces.map((ws) => {
          const isSelected = ws.id === selectedId;
          const Icon = ws.icon;
          return (
            <button
              key={ws.id}
              onClick={() => setSelectedId(ws.id)}
              disabled={isLoading || isSuccess}
              className={cn(
                "flex flex-col text-left p-4 rounded-xl border bg-void/35 transition-all relative overflow-hidden group",
                getAccentBorder(ws.accent, isSelected)
              )}
            >
              {isSelected && (
                <div className={cn("absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-void", 
                  ws.accent === "pulse" ? "bg-pulse" : ws.accent === "circuit" ? "bg-circuit" : "bg-signal"
                )}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
              <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center mb-3", getAccentBg(ws.accent))}>
                <Icon className={cn("w-4 h-4", getAccentText(ws.accent))} />
              </div>
              <h3 className="font-display font-bold text-scale-base text-bone mb-1">{ws.name}</h3>
              <p className="text-scale-xs text-muted-foreground leading-relaxed">{ws.description}</p>
            </button>
          );
        })}

        {/* Add custom workspace trigger */}
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            disabled={isLoading || isSuccess}
            className="flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border/60 bg-void/10 hover:bg-void/30 text-muted-foreground hover:text-bone hover:border-signal/50 transition-all h-full min-h-[140px]"
          >
            <Plus className="w-6 h-6 mb-2 text-signal" />
            <span className="font-display font-bold text-scale-sm">New Workspace</span>
            <span className="text-scale-xs text-muted-foreground/60 mt-1">Initialize custom sandbox</span>
          </button>
        ) : (
          <form
            onSubmit={handleAddCustom}
            className="flex flex-col justify-between p-4 rounded-xl border border-signal bg-void/20 h-full min-h-[140px]"
          >
            <div className="space-y-2">
              <label className="text-scale-xs font-semibold text-muted-foreground">Workspace Name</label>
              <Input
                autoFocus
                placeholder="e.g. Sales sandbox"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="bg-void/50 border-border/40 text-scale-sm h-8 focus-visible:ring-1 focus-visible:ring-signal"
              />
            </div>
            <div className="flex gap-2 justify-end mt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCustomInput(false)}
                className="text-scale-xs h-7 hover:bg-surface"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-signal hover:bg-signal/90 text-void text-scale-xs h-7"
              >
                Create
              </Button>
            </div>
          </form>
        )}
      </div>

      <Button
        onClick={handleContinue}
        disabled={isLoading || isSuccess}
        className={`w-full font-semibold text-scale-sm h-10 rounded-md mt-6 transition-all duration-200 ${
          isSuccess
            ? "bg-emerald-600 text-bone hover:bg-emerald-600"
            : "bg-signal hover:bg-signal/90 text-void"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Binding Workspace Context...</span>
          </span>
        ) : isSuccess ? (
          <span>Workspace Setup Bound</span>
        ) : (
          <span>Confirm Workspace Selection</span>
        )}
      </Button>
    </div>
  );
}
