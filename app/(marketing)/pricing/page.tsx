"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Free Sandbox",
      price: "0",
      description: "Ideal for personal development & testing pipelines.",
      cta: "Start Free",
      featured: false,
      features: [
        "1 Workspace node connection",
        "500,000 monthly tokens limit",
        "Core AI Developer Suite access",
        "Community forum support",
      ],
    },
    {
      name: "Pro Telemetry",
      price: billingPeriod === "monthly" ? "49" : "39",
      description: "For small teams scaling collaborative operations.",
      cta: "Upgrade to Pro",
      featured: true,
      features: [
        "12 Workspace node connections",
        "10,000,000 monthly tokens limit",
        "All product suites: Dev, Creative, Automation, Biz",
        "Active session revocation security",
        "Standard support channels (24h SLA)",
      ],
    },
    {
      name: "Enterprise Core",
      price: billingPeriod === "monthly" ? "299" : "239",
      description: "Dedicated cluster capacity & full custom controls.",
      cta: "Configure Cluster",
      featured: false,
      features: [
        "Unlimited nodes connections",
        "Custom token limits & allocations",
        "Dedicated isolated database instances",
        "Private agent marketplace registries",
        "Dedicated account handlers (1h SLA)",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill border border-signal/25 bg-signal/5 dark:bg-signal/10">
            <Crown className="w-3.5 h-3.5 text-signal" />
            <span className="eyebrow text-signal">RESOURCING PLANS</span>
          </div>
          <h1 className="font-display font-extrabold text-bone text-3xl sm:text-4xl uppercase tracking-tight leading-tight">
            SCALE YOUR{" "}
            <span className="text-gradient">TELEMETRY</span>
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Choose a resourcing tier. All billing values compile transparently without hidden surcharges.
          </p>

          {/* Monthly/Annual Toggle - pill shaped */}
          <div className="inline-flex items-center gap-1 p-1 bg-muted/50 border border-border/40 rounded-pill mt-4">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "px-5 py-2 rounded-pill text-sm font-semibold transition-all duration-200",
                billingPeriod === "monthly"
                  ? "bg-signal text-white shadow-md shadow-signal/20"
                  : "text-muted-foreground hover:text-bone"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={cn(
                "px-5 py-2 rounded-pill text-sm font-semibold transition-all duration-200",
                billingPeriod === "annual"
                  ? "bg-signal text-white shadow-md shadow-signal/20"
                  : "text-muted-foreground hover:text-bone"
              )}
            >
              Annual (-20%)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group hover:scale-[1.01]",
                // Glass effect
                "bg-surface/80 dark:bg-surface/40 dark:backdrop-blur-xl shadow-sm hover:shadow-lg",
                plan.featured
                  ? "border-signal/50 ring-1 ring-signal/20 card-gradient-bar"
                  : "border-border/40"
              )}
            >
              {plan.featured && (
                <div className="absolute top-3 right-3 bg-signal text-white eyebrow px-3 py-1 rounded-pill">
                  RECOMMENDED
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-lg text-bone">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="stat-number text-4xl">${plan.price}</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>

                <ul className="space-y-3 text-sm text-muted-foreground pt-4 border-t border-border/20">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-signal shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  className={cn(
                    "w-full group",
                    !plan.featured && "bg-signal/10 text-signal hover:bg-signal/20 border border-signal/30"
                  )}
                  variant={plan.featured ? "default" : "outline"}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
