"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Sun, Moon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LogoVariation } from "@/services/logoGenerator";
import { downloadPdf, downloadPng, downloadSvg } from "./logoDownloadUtils";

interface LogoDetailModalProps {
  variation: LogoVariation | null;
  brandName: string;
  onClose: () => void;
  onRefine: (instruction: string) => Promise<void>;
  onSendToBrandKit: (logoId: string) => void;
  isRefining?: boolean;
}

export function LogoDetailModal({
  variation,
  brandName,
  onClose,
  onRefine,
  onSendToBrandKit,
  isRefining = false,
}: LogoDetailModalProps) {
  const [previewDark, setPreviewDark] = useState(true);
  const [refineText, setRefineText] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!variation) return;
    setRefineText("");
    setPreviewDark(true);
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [variation, onClose]);

  if (!variation) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-void/80 backdrop-blur-sm p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logo-detail-title"
        className="w-full max-w-lg rounded-2xl border border-border/40 bg-surface shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
          <div>
            <h2 id="logo-detail-title" className="font-display font-bold text-scale-sm text-bone">
              {brandName} — Concept Preview
            </h2>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
              {variation.format} · {variation.id.slice(0, 12)}
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Background check</span>
            <div className="inline-flex rounded-lg border border-border/40 p-0.5">
              <button
                type="button"
                onClick={() => setPreviewDark(false)}
                className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1",
                  !previewDark ? "bg-pulse/15 text-pulse" : "text-muted-foreground"
                )}
              >
                <Sun className="w-3 h-3" /> Light
              </button>
              <button
                type="button"
                onClick={() => setPreviewDark(true)}
                className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1",
                  previewDark ? "bg-pulse/15 text-pulse" : "text-muted-foreground"
                )}
              >
                <Moon className="w-3 h-3" /> Dark
              </button>
            </div>
          </div>

          <div
            className={cn(
              "rounded-2xl border border-border/30 p-8 flex items-center justify-center min-h-[220px]",
              previewDark ? "bg-void" : "bg-white"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={variation.imageUrl} alt="" className="max-h-48 max-w-full object-contain" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => downloadPng(variation)}>
              PNG
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => downloadSvg(variation)}>
              SVG
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => downloadPdf(variation)}>
              PDF
            </Button>
          </div>

          <form
            className="space-y-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!refineText.trim() || isRefining) return;
              await onRefine(refineText.trim());
            }}
          >
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Refine this concept
            </label>
            <div className="flex gap-2">
              <Input
                value={refineText}
                onChange={(e) => setRefineText(e.target.value)}
                placeholder='e.g. "make the icon smaller", "try blue instead"'
                className="bg-void/50 border-border/40 text-scale-xs"
              />
              <Button type="submit" disabled={!refineText.trim() || isRefining} className="bg-pulse hover:bg-pulse/90 text-void shrink-0">
                {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refine"}
              </Button>
            </div>
          </form>

          <Button
            type="button"
            variant="outline"
            className="w-full border-pulse/30 text-pulse hover:bg-pulse/10"
            onClick={() => onSendToBrandKit(variation.id)}
          >
            Send to Brand Identity Sheet
          </Button>
        </div>
      </div>
    </div>
  );
}
