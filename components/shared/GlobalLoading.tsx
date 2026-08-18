"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalLoadingProps {
  className?: string;
  rows?: number;
}

export function GlobalLoading({ className, rows = 3 }: GlobalLoadingProps) {
  return (
    <div className={cn("w-full h-full flex flex-col justify-center items-center p-6 space-y-6", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin text-signal" />
        <span className="eyebrow">SYNCING TELEMETRY...</span>
      </div>

      <div className="w-full max-w-md space-y-4">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="border border-border/30 bg-surface/50 dark:bg-surface/30 p-4 rounded-2xl space-y-3 animate-pulse">
            <div className="w-1/3 h-3 bg-muted rounded-pill" />
            <div className="space-y-1.5">
              <div className="w-3/4 h-2.5 bg-muted rounded-pill" />
              <div className="w-1/2 h-2.5 bg-muted rounded-pill" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
