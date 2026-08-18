"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { SynapseLine } from "@/components/shared/SynapseLine";

export default function NotFound() {
  const synapsePoints = [
    { x: 30, y: 120 },
    { x: 150, y: 40 },
    { x: 270, y: 160 },
  ];

  return (
    <div className="relative min-h-screen bg-void flex items-center justify-center p-6 text-center select-text font-sans text-scale-xs text-bone">
      {/* Background decoration lines */}
      <div className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0">
        <SynapseLine points={synapsePoints} color="signal" duration={5} />
      </div>

      <div className="bg-surface border border-border/40 p-8 rounded-2xl max-w-sm w-full space-y-6 shadow-2xl relative z-10">
        <div className="w-12 h-12 rounded-full bg-pulse/10 border border-pulse/30 flex items-center justify-center mx-auto text-pulse animate-pulse">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-[9px] text-pulse font-bold uppercase tracking-widest">
            telemetry error 404
          </span>
          <h1 className="font-display font-bold text-bone text-scale-base sm:text-lg">
            Node Path Unresolved
          </h1>
          <p className="text-scale-xs text-muted-foreground leading-relaxed px-2">
            The workspace route address does not match any compiled platform suite handles.
          </p>
        </div>

        <Link href="/dashboard" passHref>
          <Button className="w-full bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-9 rounded-lg shadow-md">
            Return to Workstation
          </Button>
        </Link>
      </div>
    </div>
  );
}
