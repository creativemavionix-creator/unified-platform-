"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";
import { SynapseLine } from "@/components/shared/SynapseLine";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log telemetry stack dump
    console.error("Telemetry Error Boundary Ingested:", error);
  }, [error]);

  const synapsePoints = [
    { x: 40, y: 150 },
    { x: 160, y: 30 },
    { x: 280, y: 170 },
  ];

  return (
    <div className="relative min-h-screen bg-void flex items-center justify-center p-6 text-center select-text font-sans text-scale-xs text-bone">
      {/* Background decoration lines */}
      <div className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0">
        <SynapseLine points={synapsePoints} color="signal" duration={5} />
      </div>

      <div className="bg-surface border border-border/40 p-8 rounded-2xl max-w-sm w-full space-y-6 shadow-2xl relative z-10">
        <div className="w-12 h-12 rounded-full bg-pulse/15 border border-pulse/30 flex items-center justify-center mx-auto text-pulse animate-pulse">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-[9px] text-pulse font-bold uppercase tracking-widest">
            telemetry error 500
          </span>
          <h1 className="font-display font-bold text-bone text-scale-base sm:text-lg">
            Platform Thread Crash
          </h1>
          <p className="text-scale-xs text-muted-foreground leading-relaxed px-1">
            Visual workspace operations ran into a thread execution crash. The logs are ingested.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-9 rounded-lg flex items-center justify-center gap-1.5 shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Thread</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
