"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Download, RefreshCw, Star, ArrowRight, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface GalleryItem {
  id: string;
  title: string;
  category?: string;
  description?: string;
  type?: "image" | "video" | "logo" | "vector" | "font" | "audio" | "agent";
  placeholderGradient?: string;
  price?: string;
  rating?: number;
  featured?: boolean;
  tags?: string[];
  icon?: string;
}

interface GalleryGridProps {
  items: GalleryItem[];
  mode: "generation" | "asset" | "agent";
  accent?: "pulse" | "signal";
  onItemActionClick?: (item: GalleryItem, action: "download" | "regenerate" | "details") => void;
  isLoading?: boolean;
}

export function GalleryGrid({
  items,
  mode,
  accent = "pulse",
  onItemActionClick,
  isLoading = false,
}: GalleryGridProps) {
  const isCreative = accent === "pulse";
  
  const hoverClass = isCreative
    ? "hover:border-pulse/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]"
    : "hover:border-signal/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]";

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-48 rounded-xl border border-border/40 bg-surface/50 animate-pulse flex flex-col justify-between p-4"
          >
            <div className="w-1/3 h-4 bg-void/50 rounded" />
            <div className="space-y-2">
              <div className="w-3/4 h-3 bg-void/50 rounded" />
              <div className="w-1/2 h-3 bg-void/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "bg-surface border border-border/40 rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between group",
            hoverClass
          )}
        >
          {/* Card Head (Media viewport or info block) */}
          {mode === "generation" && (
            <div className="relative aspect-video w-full overflow-hidden bg-void/80 flex items-center justify-center border-b border-border/30">
              {/* Solid-color/gradient placeholder */}
              <div
                className={cn(
                  "absolute inset-0 opacity-40 transition-transform duration-500 group-hover:scale-105",
                  item.placeholderGradient || "bg-gradient-to-tr from-void to-surface"
                )}
              />
              {/* Overlay label */}
              <span className="relative font-mono text-[10px] text-muted-foreground uppercase tracking-widest bg-void/80 border border-border/45 px-2.5 py-1 rounded">
                {item.title}
              </span>

              {/* Generation Quick Actions Hover overlay */}
              <div className="absolute inset-0 bg-void/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-200">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onItemActionClick?.(item, "download")}
                  className="w-9 h-9 border-border/60 hover:bg-surface text-bone rounded-lg"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onItemActionClick?.(item, "regenerate")}
                  className="w-9 h-9 border-border/60 hover:bg-surface text-bone rounded-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {mode === "asset" && (
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{item.category}</span>
                </div>
                <h4 className="font-display font-semibold text-bone text-scale-base">{item.title}</h4>
              </div>

              {/* Asset gradient preview banner */}
              <div
                className={cn(
                  "h-16 w-full rounded-lg opacity-40 border border-border/20 flex items-center justify-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
                  item.placeholderGradient || "bg-gradient-to-r from-void to-surface"
                )}
              >
                {item.title.split(" ").slice(0, 2).join(" ")}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {item.tags?.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-border/40 bg-void/50 text-muted-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mode === "agent" && (
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Agent Icon + Name + Category + Badges */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border font-display font-bold text-scale-base",
                      item.featured ? "bg-pulse/10 border-pulse/25 text-pulse shadow-[0_0_10px_rgba(236,72,153,0.1)]" : "bg-signal/10 border-signal/25 text-signal"
                    )}>
                      {item.icon || item.title[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-bold text-bone text-scale-sm leading-none">{item.title}</h4>
                        {item.featured && (
                          <span className="text-[8px] font-mono font-bold tracking-widest bg-pulse text-void px-1.5 py-0.2 rounded uppercase">
                            featured
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{item.category}</span>
                    </div>
                  </div>
                </div>

                <p className="text-scale-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>

              {/* Rating + Price details */}
              <div className="flex items-center justify-between border-t border-border/15 pt-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span className="font-mono text-scale-xs font-semibold text-bone">{item.rating?.toFixed(1)}</span>
                </div>
                
                <span className="text-scale-xs font-mono font-bold text-bone uppercase">
                  {item.price === "0" || !item.price ? "free" : `$${item.price} / mo`}
                </span>
              </div>
            </div>
          )}

          {/* Card Footer (CTA Action row for agents / details) */}
          {mode === "agent" && (
            <div className="p-4 bg-void/35 border-t border-border/30 flex justify-end">
              <Button
                onClick={() => onItemActionClick?.(item, "details")}
                className="w-full bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-8 rounded-lg flex items-center justify-center gap-1.5"
              >
                <span>Details & Deploy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
