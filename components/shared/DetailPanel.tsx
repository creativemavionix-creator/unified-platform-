"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: "signal" | "pulse" | "circuit";
}

export function DetailPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  accent = "signal",
}: DetailPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-void/80 backdrop-blur-sm select-text">
      {/* Backdrop click close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Slide-over panel container */}
      <div className="relative w-full max-w-sm bg-surface border-l border-border/60 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        
        {/* Header bar */}
        <div className="h-16 px-6 border-b border-border/40 flex items-center justify-between bg-void/35 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full",
                accent === "circuit" ? "bg-circuit" : accent === "pulse" ? "bg-pulse" : "bg-signal"
              )} />
              <h3 className="font-display font-bold text-scale-base text-bone">{title}</h3>
            </div>
            {subtitle && (
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase tracking-wider">
                {subtitle}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 hover:bg-void/40 text-muted-foreground hover:text-bone rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </div>

        {/* Footer actions row */}
        <div className="h-16 px-6 border-t border-border/15 bg-void/20 flex items-center justify-end gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border/60 hover:bg-surface text-bone text-scale-xs h-9 px-4 rounded-lg bg-void/35"
          >
            Close Panel
          </Button>
        </div>
      </div>
    </div>
  );
}
