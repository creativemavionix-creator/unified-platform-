"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, Bell, Settings, Menu, User, LogOut, Shield, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { supabase, isDemoMode } from "@/lib/supabase";
import { toast } from "sonner";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  className?: string;
  onMenuClick?: () => void;
}

export function TopBar({ className, onMenuClick }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [breadcrumb, setBreadcrumb] = useState<{ suite: string; tool: string | null }>({ suite: "", tool: null });

  useEffect(() => {
    const updateBreadcrumbs = () => {
      const suiteMapping: Record<string, string> = {
        "/dashboard": "Dashboard Home",
        "/dev": "Developer Suite",
        "/automation": "Automation Suite",
        "/creative": "Creative AI Lab",
        "/business": "Business Operations",
        "/agents": "Agent Marketplace",
        "/settings": "Settings",
      };

      let activeSuite = "";
      for (const [key, val] of Object.entries(suiteMapping)) {
        if (pathname.startsWith(key)) {
          activeSuite = val;
          break;
        }
      }

      const params = new URLSearchParams(window.location.search);
      const toolId = params.get("tool");

      const toolMapping: Record<string, string> = {
        image: "Image Generation",
        video: "Video Generation",
        logo: "Logo Generator",
        brand: "Brand Identity Sheet",
        presentation: "Presentation Builder",
        uiux: "UI/UX Layout Frame",
        animation: "Animation Studio",
        voice: "Voice Generator",
        assets: "Creative Asset Library",
        website: "Website Builder",
        mobile: "Mobile App Builder",
        saas: "SaaS Template Wizard",
        api: "API Schema Designer",
        backend: "Backend Service Manager",
        database: "Database Designer",
        deployment: "Deployment Dashboard",
        project: "Project Manager (Kanban)",
        code: "Code Workstation Layout",
        prompt: "AI Prompt Workspace",
        builder: "Workflow Builder",
        dashboard: "Operations Dashboard",
        triggers: "Event Triggers",
        scheduled: "Scheduled Tasks",
        generator: "AI Flow Generator",
        integrations: "Integrations Gateway",
        monitoring: "Monitoring Logs",
        crm: "CRM Pipeline",
        hrms: "HRMS Employees",
        erp: "ERP Hub",
        finance: "Finance Ledgers",
        inventory: "Inventory Stock",
        procurement: "Procurement POs",
        legal: "Legal Agreements",
        support: "Customer Support",
        analytics: "Analytics Dashboard",
      };

      setBreadcrumb({
        suite: activeSuite,
        tool: toolId ? toolMapping[toolId] || toolId : null,
      });
    };

    updateBreadcrumbs();
    window.addEventListener("url-change", updateBreadcrumbs);
    return () => window.removeEventListener("url-change", updateBreadcrumbs);
  }, [pathname]);

  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications: notifs, markRead: markReadAsync, markAllRead: markAllReadAsync } = useRealtimeNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  const [userName, setUserName] = useState("Alex Mercer");
  const [userInitials, setUserInitials] = useState("AM");

  const unreadCount = notifs.filter(n => !n.read).length;

  const getInitials = (fullName: string) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Sync profile details
  useEffect(() => {
    // 1. Initial load from localStorage
    try {
      const stored = localStorage.getItem("mvx_user_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) {
          setUserName(parsed.name);
          setUserInitials(getInitials(parsed.name));
        }
      }
    } catch (e) {
      console.warn("Failed to parse cached profile", e);
    }

    // 2. Fetch from Supabase if not in demo mode
    const loadProfile = async () => {
      if (isDemoMode) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
          if (!error && data?.full_name) {
            setUserName(data.full_name);
            setUserInitials(getInitials(data.full_name));
            // Cache in localStorage
            localStorage.setItem("mvx_user_profile", JSON.stringify({ name: data.full_name }));
          }
        }
      } catch (err) {
        console.warn("[TopBar] Failed to load profile from Supabase:", err);
      }
    };
    loadProfile();

    // 3. Listen to custom profile update event
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ name: string }>;
      if (customEvent.detail?.name) {
        setUserName(customEvent.detail.name);
        setUserInitials(getInitials(customEvent.detail.name));
      }
    };
    window.addEventListener("mvx-profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("mvx-profile-updated", handleProfileUpdate);
    };
  }, []);

  const markRead = (id: string) => {
    markReadAsync(id);
    toast.info("Notification marked as read");
  };

  const markAllRead = () => {
    markAllReadAsync();
    toast.success("All notifications marked as read");
  };

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const handleLogout = async () => {
    if (!isDemoMode) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("mvx_session");
    localStorage.removeItem("mvx_user_profile");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <header className={cn("h-16 bg-surface/80 backdrop-blur-xl border-b border-border/20 flex items-center justify-between sticky top-0 z-20 w-full px-4 sm:px-6", className)}>
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        {/* Breadcrumbs */}
        {breadcrumb.suite && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground select-none font-medium shrink-0 border-r border-border/20 pr-4 mr-2 hidden md:flex">
            <span>{breadcrumb.suite}</span>
            {breadcrumb.tool && (
              <>
                <span className="text-muted-foreground/35">/</span>
                <span className="text-signal font-semibold">{breadcrumb.tool}</span>
              </>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative w-full max-w-md group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-signal transition-colors" />
          <Input
            type="text"
            placeholder="Ask MaVionix AI anything…"
            className="pl-9 pr-4 h-9 rounded-xl bg-void/40 dark:bg-void/60"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        {/* Notifications Bell + Panel */}
        <div className="relative" ref={panelRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-muted-foreground hover:text-bone"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-signal animate-pulse" />
            )}
          </Button>

          {/* Notifications Panel */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface border border-border/40 rounded-2xl shadow-2xl z-[60] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-signal" />
                  <span className="font-display font-bold text-sm text-bone">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="eyebrow text-signal bg-signal/10 px-2 py-0.5 rounded-pill border border-signal/20">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-signal hover:underline font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications list */}
              <div className="max-h-80 overflow-y-auto divide-y divide-border/20">
                {notifs.slice(0, 8).map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className={cn(
                      "flex items-start gap-3 p-3 w-full text-left transition-colors hover:bg-muted/30",
                      !notif.read && "bg-signal/5 dark:bg-signal/8"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0",
                      notif.type === "success" ? "bg-emerald-500" :
                      notif.type === "error" ? "bg-red-500" :
                      notif.type === "warning" ? "bg-amber-500" :
                      "bg-signal"
                    )} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-bone truncate">{notif.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{notif.description}</p>
                    </div>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-signal shrink-0 mt-2" />
                    )}
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-border/30 text-center">
                <button
                  onClick={() => { setNotifOpen(false); router.push("/dashboard"); }}
                  className="text-xs text-signal hover:underline font-medium"
                >
                  View all on Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 hover:bg-muted/60 text-bone h-9"
            >
              <div className="w-7 h-7 rounded-full bg-signal/10 border border-signal/20 text-signal flex items-center justify-center font-display font-semibold text-xs">
                {userInitials}
              </div>
              <span className="text-sm font-medium hidden md:inline">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 bg-surface border-border/40 rounded-xl" align="end">
            <DropdownMenuLabel className="font-display font-bold text-bone text-sm px-3 py-2">
              My Workspace
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/30" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-sm hover:bg-muted/60 cursor-pointer py-2 rounded-lg mx-1">
                <User className="mr-2 h-4 w-4 text-signal" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm hover:bg-muted/60 cursor-pointer py-2 rounded-lg mx-1">
                <Settings className="mr-2 h-4 w-4 text-signal" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm hover:bg-muted/60 cursor-pointer py-2 rounded-lg mx-1">
                <Shield className="mr-2 h-4 w-4 text-signal" />
                <span>Security</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border/30" />
            <DropdownMenuItem onClick={handleLogout} className="text-sm text-destructive hover:bg-destructive/10 cursor-pointer py-2 rounded-lg mx-1">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
