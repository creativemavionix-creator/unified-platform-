"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Code2,
  Briefcase,
  Sparkles,
  Cpu,
  Bot,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import { isDemoMode } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";

export interface SidebarItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

export const sidebarGroups: SidebarGroup[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", name: "Dashboard Home", icon: LayoutDashboard, href: "/dashboard" },
    ]
  },
  {
    label: "Core Workspaces",
    items: [
      { id: "dev", name: "Developer Suite", icon: Code2, href: "/dev" },
      { id: "automation", name: "Automation Suite", icon: Cpu, href: "/automation" },
      { id: "creative", name: "Creative AI Lab", icon: Sparkles, href: "/creative" },
      { id: "business", name: "Business Operations", icon: Briefcase, href: "/business" },
    ]
  },
  {
    label: "Platform Utilities",
    items: [
      { id: "agents", name: "Agent Marketplace", icon: Bot, href: "/agents" },
      { id: "settings", name: "Settings", icon: Settings, href: "/settings" },
    ]
  }
];

export const flatSidebarItems = sidebarGroups.flatMap((g) => g.items);

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onCollapseToggle?: (collapsed: boolean) => void;
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({
  className,
  collapsed = false,
  onCollapseToggle,
  isMobile = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (pathname === "/dashboard") {
      setActiveIndex(0);
      return;
    }
    const idx = flatSidebarItems.findIndex(
      (item) => item.href !== "/dashboard" && pathname.startsWith(item.href)
    );
    if (idx !== -1) setActiveIndex(idx);
  }, [pathname]);

  const handleItemClick = (href: string) => {
    router.push(href);
    if (onNavigate) onNavigate();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full relative">
      {/* Brand Logo Header */}
      <div className="flex items-center h-16 px-4 border-b border-border/30">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-signal/10 border border-signal/20 overflow-hidden shrink-0">
            <Image
              src="/logo.jpg"
              alt="MaVionix Logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-display font-bold text-xl tracking-tight text-bone">
              Ma<span className="text-gradient">Vionix</span>
            </span>
          )}
        </div>
      </div>

      {/* Floating Collapse Edge Trigger (Desktop/Tablet only) */}
      {!isMobile && onCollapseToggle && (
        <button
          onClick={() => onCollapseToggle(!collapsed)}
          className={cn(
            "absolute top-[4.5rem] -right-3 w-6 h-6 rounded-full bg-surface border border-border/40 text-muted-foreground hover:text-bone hover:border-signal flex items-center justify-center shadow-md cursor-pointer z-40 transition-all hover:scale-105"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-signal" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-signal" />
          )}
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-grow px-3 py-4 space-y-4 overflow-y-auto">
        {sidebarGroups.map((group, groupIdx) => (
          <div key={group.label} className="space-y-1.5">
            {/* Group Label */}
            {(!collapsed || isMobile) ? (
              <span className="text-[9px] font-bold text-muted-foreground/45 tracking-widest px-3 block uppercase select-none">
                {group.label}
              </span>
            ) : (
              groupIdx > 0 && <div className="h-px bg-border/20 my-3 mx-1" />
            )}

            {group.items.map((item) => {
              const flatIdx = flatSidebarItems.findIndex((i) => i.id === item.id);
              const isActive = flatIdx === activeIndex;
              const Icon = item.icon;

              if (collapsed && !isMobile) {
                return (
                  <Tooltip key={item.id} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleItemClick(item.href)}
                        className={cn(
                          "flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200 relative overflow-hidden my-1",
                          isActive
                            ? "bg-signal/12 text-signal border border-signal/20 shadow-sm shadow-signal/5"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-bone"
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-signal shadow-[0_0_8px_#00E5FF]" />
                        )}
                        <Icon className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-surface border-border/40 text-sm">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.href)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-left relative overflow-hidden",
                    isActive
                      ? "bg-signal/12 text-signal border border-signal/20 shadow-sm shadow-signal/5"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-bone"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-signal shadow-[0_0_8px_#00E5FF]" />
                  )}
                  <Icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-signal" : "text-muted-foreground/80")} />
                  <span className={cn("truncate", isActive && "font-semibold text-bone")}>{item.name}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Demo Mode indicator */}
      {isDemoMode && !collapsed && !isMobile && (
        <div className="px-3 pb-2 mt-auto">
          <div className="text-[10px] text-center text-signal bg-signal/10 border border-signal/20 rounded-lg px-2 py-1.5 font-mono">
            DEMO MODE
          </div>
        </div>
      )}
    </div>
  );

  return (
    <aside
      className={cn(
        "bg-surface border-r border-border/30 flex flex-col shrink-0 transition-all duration-300 relative",
        collapsed ? "w-[4.5rem]" : "w-60",
        className
      )}
    >
      {sidebarContent}
    </aside>
  );
}
