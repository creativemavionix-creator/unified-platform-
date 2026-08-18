"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopBar } from "@/components/shared/TopBar";
import { GlobalAssistant } from "@/components/shared/GlobalAssistant";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onCollapseToggle={() => setCollapsed(!collapsed)}
        className="hidden lg:flex"
      />

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 bg-surface border-r border-border/30 w-64"
        >
          <Sidebar
            isMobile
            onNavigate={() => setMobileOpen(false)}
            className="w-full border-none"
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-void flex flex-col">
          {children}
        </main>
      </div>

      {/* Global AI Assistant — persistent on all authenticated routes */}
      <GlobalAssistant />
    </div>
  );
}
