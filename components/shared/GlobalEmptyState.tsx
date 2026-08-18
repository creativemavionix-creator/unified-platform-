"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowRight } from "lucide-react";

interface GlobalEmptyStateProps {
  title: string;
  description: string;
  ctaText?: string;
  onCtaClick?: () => void;
  icon?: React.ReactNode;
  accent?: "signal" | "pulse" | "circuit";
  className?: string;
}

export function GlobalEmptyState({
  title,
  description,
  ctaText,
  onCtaClick,
  icon,
  className,
}: GlobalEmptyStateProps) {
  return (
    <div className={cn("flex-grow flex items-center justify-center p-6 relative min-h-[350px] overflow-hidden", className)}>
      <div className="bg-surface border border-border/40 rounded-2xl p-8 max-w-sm w-full text-center space-y-5 shadow-lg dark:bg-surface/60 dark:backdrop-blur-xl relative z-10">
        <div className="w-12 h-12 rounded-xl bg-signal/10 border border-signal/20 flex items-center justify-center mx-auto text-signal">
          {icon || <HelpCircle className="w-5 h-5" />}
        </div>

        <div className="space-y-2">
          <h3 className="font-display font-bold text-lg text-bone">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {ctaText && onCtaClick && (
          <Button onClick={onCtaClick} className="w-full group">
            {ctaText}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
