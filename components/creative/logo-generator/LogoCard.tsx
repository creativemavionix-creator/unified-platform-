"use client";

import React from "react";
import { motion } from "framer-motion";
import { Download, Heart, RefreshCw, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LogoVariation } from "@/services/logoGenerator";

interface LogoCardProps {
  variation: LogoVariation;
  index: number;
  isFavorite: boolean;
  onOpen: () => void;
  onDownload: () => void;
  onToggleFavorite: () => void;
  onRegenerateOne: () => void;
  onRefine: () => void;
}

export function LogoCard({
  variation,
  index,
  isFavorite,
  onOpen,
  onDownload,
  onToggleFavorite,
  onRegenerateOne,
  onRefine,
}: LogoCardProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      onClick={onOpen}
      className="group relative aspect-square w-full rounded-2xl border border-border/40 overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse/50"
      style={{
        backgroundImage:
          "linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)",
        backgroundSize: "16px 16px",
        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
      }}
      aria-label={`Open logo variation ${index + 1}`}
    >
      <div className="absolute inset-0 bg-void/40" />
      <div className="relative z-10 flex h-full items-center justify-center p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={variation.imageUrl}
          alt=""
          className="max-h-full max-w-full object-contain drop-shadow-sm"
        />
      </div>

      {isFavorite && (
        <span className="absolute top-2 right-2 z-20 rounded-full bg-pulse/90 p-1.5 text-void shadow-lg">
          <Heart className="w-3 h-3 fill-current" />
        </span>
      )}

      <div
        className={cn(
          "absolute inset-0 z-20 flex items-center justify-center gap-2 bg-void/75 opacity-0 transition-opacity",
          "group-hover:opacity-100 group-focus-within:opacity-100"
        )}
      >
        {[
          { icon: Download, label: "Download", onClick: onDownload },
          { icon: Heart, label: "Favorite", onClick: onToggleFavorite },
          { icon: RefreshCw, label: "Regenerate", onClick: onRegenerateOne },
          { icon: PenLine, label: "Refine", onClick: onRefine },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-surface/90 text-bone hover:border-pulse/40 hover:text-pulse transition-colors"
          >
            <Icon className={cn("w-4 h-4", label === "Favorite" && isFavorite && "fill-pulse text-pulse")} />
          </button>
        ))}
      </div>
    </motion.button>
  );
}
