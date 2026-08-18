"use client";

import React from "react";
import { Layers, Settings, FileSpreadsheet } from "lucide-react";
import { GlobalEmptyState } from "./GlobalEmptyState";

interface BuilderShellProps {
  title: string;
  accent?: "signal" | "circuit" | "pulse";
  sidebarTitle?: string;
  sidebarContent?: React.ReactNode;
  propertiesTitle?: string;
  propertiesContent?: React.ReactNode;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyCtaText?: string;
  onEmptyCtaClick?: () => void;
  children: React.ReactNode;
}

export function BuilderShell({
  title,
  sidebarTitle = "Components",
  sidebarContent,
  propertiesTitle = "Properties",
  propertiesContent,
  isEmpty = false,
  emptyTitle = "No Active Workspace Project",
  emptyDescription = "Initialize this builder suite module to deploy visual assets and coordinate operations.",
  emptyCtaText = "Initialize Workspace",
  onEmptyCtaClick,
  children,
}: BuilderShellProps) {
  return (
    <div className="flex flex-col h-full bg-void rounded-2xl border border-border/30 overflow-hidden shadow-lg">
      {/* Sub-Header bar */}
      <div className="h-12 bg-surface border-b border-border/30 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-signal" />
          <span className="font-display font-bold text-sm text-bone">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="eyebrow text-muted-foreground">
            STATUS: ACTIVE
          </span>
        </div>
      </div>

      {/* Main Workspace */}
      {isEmpty ? (
        <GlobalEmptyState
          title={emptyTitle}
          description={emptyDescription}
          ctaText={emptyCtaText}
          onCtaClick={onEmptyCtaClick}
          icon={<Layers className="w-5 h-5 text-signal" />}
          className="min-h-[400px]"
        />
      ) : (
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Sidebar */}
          {sidebarContent && (
            <aside className="w-60 bg-surface border-r border-border/30 flex flex-col shrink-0">
              <div className="h-10 px-3 border-b border-border/30 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="eyebrow text-muted-foreground">{sidebarTitle}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {sidebarContent}
              </div>
            </aside>
          )}

          {/* Middle Canvas */}
          <div className="flex-1 bg-void relative overflow-hidden flex flex-col">
            {children}
          </div>

          {/* Right Properties Panel */}
          {propertiesContent && (
            <aside className="w-64 bg-surface border-l border-border/30 flex flex-col shrink-0">
              <div className="h-10 px-3 border-b border-border/30 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="eyebrow text-muted-foreground">{propertiesTitle}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {propertiesContent}
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
