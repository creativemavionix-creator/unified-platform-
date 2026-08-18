"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface LogEntry {
  date: string;
  version: string;
  items: {
    type: "New" | "Improved" | "Fixed";
    text: string;
  }[];
}

export default function ChangelogPage() {
  const [activeFilter, setActiveFilter] = useState<"All" | "New" | "Improved" | "Fixed">("All");

  const logs: LogEntry[] = [
    {
      date: "July 18, 2026",
      version: "v1.5.0",
      items: [
        { type: "New", text: "Deployed the AI Creative Suite containing image, video, logo, and voice generators." },
        { type: "New", text: "Integrated the AI Agent Marketplace with confirm modals authorize installation pipelines." },
        { type: "Improved", text: "Refactored the database designer schema nodes layout using explicit types to satisfy typecheck validation." },
      ],
    },
    {
      date: "July 15, 2026",
      version: "v1.4.2",
      items: [
        { type: "Improved", text: "Sleek focus indicator ring outlines bound to buttons and inputs workspace-wide." },
        { type: "Fixed", text: "Resolved button closing tags casing mismatch warnings inside backend service builders." },
      ],
    },
  ];

  const getTagStyle = (type: "New" | "Improved" | "Fixed") => {
    switch (type) {
      case "New":
        return "text-circuit bg-circuit/10 border-circuit/20";
      case "Improved":
        return "text-signal bg-signal/10 border-signal/20";
      default:
        return "text-pulse bg-pulse/10 border-pulse/20";
    }
  };

  return (
    <div className="relative min-h-screen bg-void pt-24 pb-16 px-4 select-text">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4 text-center max-w-xl mx-auto">
          <span className="text-[10px] font-mono text-signal uppercase tracking-widest font-bold">
            workspace log
          </span>
          <h1 className="font-display font-bold text-bone text-scale-xl sm:text-3xl">
            MaVionix Changelog
          </h1>
          <p className="text-scale-xs text-muted-foreground leading-relaxed">
            Dated entries log tracking feature enhancements, bugs resolutions, and workspace optimizations.
          </p>

          {/* Filters */}
          <div className="flex gap-2 justify-center pt-2">
            {(["All", "New", "Improved", "Fixed"] as const).map((btn) => (
              <button
                key={btn}
                onClick={() => setActiveFilter(btn)}
                className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider border transition-colors",
                  activeFilter === btn
                    ? "bg-signal/15 border-signal text-signal"
                    : "border-border/30 text-muted-foreground hover:text-bone hover:border-border/80"
                )}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        {/* Log list */}
        <div className="space-y-10">
          {logs.map((log) => {
            const filteredItems = log.items.filter(
              (item) => activeFilter === "All" || item.type === activeFilter
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={log.version} className="relative border-l border-border/40 pl-6 space-y-4">
                {/* Dated Dot */}
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-signal border border-surface shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted-foreground">{log.date}</span>
                  <h3 className="font-display font-bold text-bone text-scale-sm">
                    Workspace Release {log.version}
                  </h3>
                </div>

                <ul className="space-y-3 font-sans text-scale-xs text-muted-foreground leading-relaxed">
                  {filteredItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className={cn("text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border shrink-0 mt-0.5", getTagStyle(item.type))}>
                        {item.type}
                      </span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
