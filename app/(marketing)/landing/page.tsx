"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden hero-glow">
      <div className="max-w-3xl space-y-8 relative z-10">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill border border-signal/25 bg-signal/5 dark:bg-signal/10">
          <Sparkles className="w-3.5 h-3.5 text-signal" />
          <span className="eyebrow text-signal">INTRODUCING MAVIONIX</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-bone uppercase leading-[1.05]">
          THE UNIFIED WORKSTATION FOR{" "}
          <span className="text-gradient">NEXT-GEN OPS</span>
        </h1>

        {/* Body */}
        <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          One unified system that bundles engineering environments, creative AI tools, visual automation engines, and cognitive agent pools.
        </p>

        {/* Two-tier CTAs */}
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/">
            <Button size="lg" className="group">
              Access Workstation
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
