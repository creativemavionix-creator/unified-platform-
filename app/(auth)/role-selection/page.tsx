"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, Shield, Code, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const roleOptions: RoleOption[] = [
  {
    id: "admin",
    title: "Workspace Administrator",
    description: "Full configuration control, access management, billing settings, and credentials management.",
    icon: ShieldAlert,
  },
  {
    id: "developer",
    title: "Technical Developer",
    description: "Read/write access to repository logs, container telemetry, automation Dags, and API keys.",
    icon: Code,
  },
  {
    id: "business",
    title: "Business Operator",
    description: "Read/write access to monetization telemetry, client campaigns, and AI Creative workspace.",
    icon: Shield,
  },
  {
    id: "viewer",
    title: "Read-Only Viewer",
    description: "Read-only access to dashboard statistics, telemetry flows, and general performance graphs.",
    icon: Eye,
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    // Simulate 800ms backend role assignment
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setIsSuccess(true);

    setTimeout(() => {
      router.push("/workspace-selection");
    }, 450);
  };

  return (
    <div className="bg-surface border border-border/45 rounded-xl p-8 space-y-6 shadow-xl relative z-10 w-full max-w-xl mx-auto">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-scale-xl font-bold text-bone">Choose Your Role</h1>
        <p className="text-scale-xs text-muted-foreground font-mono uppercase tracking-wider">
          Step 5: Allocate Workspace Privileges
        </p>
      </div>

      <div className="space-y-3">
        {roleOptions.map((role) => {
          const isSelected = role.id === selectedId;
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => setSelectedId(role.id)}
              disabled={isLoading || isSuccess}
              className={cn(
                "flex items-start gap-4 p-4 w-full rounded-xl border bg-void/35 transition-all text-left relative overflow-hidden group",
                isSelected
                  ? "border-signal ring-1 ring-signal shadow-[0_0_12px_rgba(139,92,246,0.15)] bg-signal/[0.02]"
                  : "border-border/40 hover:border-border/80"
              )}
            >
              <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 mt-0.5", 
                isSelected ? "bg-signal/15 border-signal/25 text-signal" : "bg-void/50 border-border/40 text-muted-foreground"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="font-display font-bold text-scale-base text-bone mb-1">{role.title}</h3>
                <p className="text-scale-xs text-muted-foreground leading-relaxed">{role.description}</p>
              </div>
              {isSelected && (
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-signal flex items-center justify-center text-void">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
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
            <span>Configuring Role Telemetry...</span>
          </span>
        ) : isSuccess ? (
          <span>Privileges Allocated</span>
        ) : (
          <span>Confirm Role & Continue</span>
        )}
      </Button>
    </div>
  );
}
