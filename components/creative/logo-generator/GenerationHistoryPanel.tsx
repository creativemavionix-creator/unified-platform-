"use client";

import React from "react";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LogoGenerationBatch } from "./types";

interface GenerationHistoryPanelProps {
  batches: LogoGenerationBatch[];
  isOpen: boolean;
  onToggle: () => void;
  onSelectBatch: (batchId: string) => void;
}

export function GenerationHistoryPanel({
  batches,
  isOpen,
  onToggle,
  onSelectBatch,
}: GenerationHistoryPanelProps) {
  return (
    <>
      {/* Desktop side panel */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-l border-border/30 bg-surface shrink-0 transition-all duration-300 overflow-hidden",
          isOpen ? "w-64" : "w-10"
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className="h-10 flex items-center justify-center border-b border-border/30 text-muted-foreground hover:text-bone"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Collapse generation history" : "Expand generation history"}
        >
          {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {isOpen && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Generation History
              </span>
            </div>
            {batches.length === 0 ? (
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Batches from this session appear here.
              </p>
            ) : (
              batches.map((batch) => (
                <HistoryEntry key={batch.id} batch={batch} onSelect={() => onSelectBatch(batch.id)} />
              ))
            )}
          </div>
        )}
      </aside>

      {/* Mobile bottom drawer */}
      <div className="md:hidden border-t border-border/30 bg-surface">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-2.5 text-scale-xs text-muted-foreground"
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-2 font-mono uppercase tracking-wider">
            <History className="w-3.5 h-3.5 text-pulse" />
            Generation History ({batches.length})
          </span>
          <ChevronRight className={cn("w-4 h-4 transition-transform", isOpen && "rotate-90")} />
        </button>
        {isOpen && (
          <div className="max-h-48 overflow-y-auto px-3 pb-3 space-y-2">
            {batches.map((batch) => (
              <HistoryEntry key={batch.id} batch={batch} onSelect={() => onSelectBatch(batch.id)} compact />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function HistoryEntry({
  batch,
  onSelect,
  compact,
}: {
  batch: LogoGenerationBatch;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl border border-border/30 bg-void/35 p-2.5 text-left hover:border-pulse/30 transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-scale-xs font-semibold text-bone truncate">{batch.brandName}</p>
        {!compact && (
          <span className="text-[9px] font-mono text-muted-foreground shrink-0">
            {batch.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{batch.style}</p>
      <div className="mt-2 flex gap-1">
        {batch.variations.slice(0, 3).map((v) => (
          <div key={v.id} className="h-8 w-8 rounded-md border border-border/30 bg-void/50 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v.imageUrl} alt="" className="h-full w-full object-contain p-0.5" />
          </div>
        ))}
      </div>
    </button>
  );
}
