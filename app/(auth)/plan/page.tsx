"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanOption {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  accent: "signal" | "pulse" | "circuit";
  ctaText: string;
}

const planOptions: PlanOption[] = [
  {
    id: "free",
    name: "Starter Sandbox",
    price: "$0",
    description: "Ideal for testing workflows and exploring AI platforms.",
    features: [
      "1 Operational Workspace",
      "5 Active Automations triggers",
      "Standard Creative models",
      "Community support access",
    ],
    accent: "signal",
    ctaText: "Launch Sandbox",
  },
  {
    id: "pro",
    name: "Professional Pro",
    price: "$29",
    description: "Designed for engineering and media specialists.",
    features: [
      "5 Operational Workspaces",
      "100 Active Automations triggers",
      "Advanced AI Creative suites",
      "Priority pipeline queue",
    ],
    accent: "pulse",
    ctaText: "Unlock Pro Workstation",
  },
  {
    id: "enterprise",
    name: "Workforce Enterprise",
    price: "$79",
    description: "Designed for scaling business systems and teams.",
    features: [
      "Unlimited Workspaces",
      "Unlimited visual flow DAGs",
      "Cognitive Agent Workforce",
      "Custom safety guardrails",
    ],
    accent: "circuit",
    ctaText: "Unlock Enterprise Ops",
  },
];

export default function PlanSelectionPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("pro");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    setSelectedId(planId);
    setIsLoading(true);
    // Simulate 800ms workspace billing activation
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setIsSuccess(true);

    setTimeout(() => {
      router.push("/dashboard");
    }, 450);
  };

  const getAccentBorder = (accent: "signal" | "pulse" | "circuit", isSelected: boolean) => {
    if (!isSelected) return "border-border/40 hover:border-border/80";
    switch (accent) {
      case "pulse":
        return "border-pulse ring-1 ring-pulse shadow-[0_0_15px_rgba(236,72,153,0.25)] bg-pulse/[0.01]";
      case "circuit":
        return "border-circuit ring-1 ring-circuit shadow-[0_0_15px_rgba(34,211,238,0.25)] bg-circuit/[0.01]";
      default:
        return "border-signal ring-1 ring-signal shadow-[0_0_15px_rgba(139,92,246,0.25)] bg-signal/[0.01]";
    }
  };

  const getAccentBtnClass = (accent: "signal" | "pulse" | "circuit") => {
    switch (accent) {
      case "pulse":
        return "bg-pulse hover:bg-pulse/90 text-void";
      case "circuit":
        return "bg-circuit hover:bg-circuit/90 text-void";
      default:
        return "bg-signal hover:bg-signal/90 text-void";
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto z-10 relative px-4">
      <div className="space-y-2 text-center max-w-xl mx-auto">
        <h1 className="font-display text-scale-xl sm:text-2xl font-bold text-bone">Choose Your Plan</h1>
        <p className="text-scale-xs text-muted-foreground font-mono uppercase tracking-wider">
          Step 6: Allocate Workstation Resources
        </p>
        <p className="text-scale-xs text-muted-foreground pt-1">
          Select a licensing plan to initialize telemetry capacity. No billing required for trial sandbox sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-4">
        {planOptions.map((plan) => {
          const isSelected = plan.id === selectedId;
          return (
            <div
              key={plan.id}
              className={cn(
                "bg-surface border rounded-xl p-6 flex flex-col justify-between transition-all duration-300 relative",
                getAccentBorder(plan.accent, isSelected)
              )}
            >
              {plan.id === "pro" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full border bg-void text-[10px] font-mono font-bold uppercase tracking-wider text-pulse border-pulse/30 shadow-md">
                  recommended
                </span>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-bold text-scale-lg text-bone">{plan.name}</h3>
                    <p className="text-scale-xs text-muted-foreground mt-1 leading-relaxed">{plan.description}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 py-2 border-y border-border/10">
                  <span className="text-scale-2xl font-display font-bold text-bone">{plan.price}</span>
                  <span className="text-scale-xs text-muted-foreground font-mono">/ month</span>
                </div>

                <ul className="space-y-2.5 pt-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-scale-xs text-muted-foreground">
                      <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", isSelected ? 
                        (plan.accent === "pulse" ? "text-pulse" : plan.accent === "circuit" ? "text-circuit" : "text-signal") 
                        : "text-muted-foreground/60"
                      )} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-border/15">
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading || isSuccess}
                  className={cn("w-full font-semibold text-scale-xs h-9 rounded-md", 
                    isSelected ? getAccentBtnClass(plan.accent) : "bg-void border border-border/40 hover:bg-surface/50 text-bone"
                  )}
                >
                  {isLoading && isSelected ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Allocating resources...</span>
                    </span>
                  ) : isSuccess && isSelected ? (
                    <span>Ready</span>
                  ) : (
                    <span>{plan.ctaText}</span>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
