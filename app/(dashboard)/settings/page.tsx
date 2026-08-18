"use client";

import React, { useState } from "react";
import {
  User,
  Building,
  CreditCard,
  Users,
  Shield,
  Key,
  Bell,
  Palette,
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Crown,
  History,
  Settings,
  ArrowUpRight,
  Mail,
  Phone,
  Globe,
  Check,
  MapPin,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { supabase, isDemoMode } from "@/lib/supabase";
import { insertActivity, logAndNotify } from "@/lib/supabase-actions";
import { useRealtimeActivity } from "@/hooks/use-realtime-activity";
import { useRealtimeTeamMembers } from "@/hooks/use-realtime-team-members";
import { useRealtimeRoles, type LocalRole } from "@/hooks/use-realtime-roles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, DataColumn } from "@/components/shared/DataTable";
import { DetailPanel } from "@/components/shared/DetailPanel";

type SettingsSection =
  | "profile"
  | "organization"
  | "billing"
  | "subscription"
  | "team"
  | "roles"
  | "security"
  | "api"
  | "notifications"
  | "activity"
  | "workspace"
  | "theme";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");

  // Destructive confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Settings sections navigation list
  const navList: { id: SettingsSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "organization", label: "Organization", icon: Building },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
    { id: "subscription", label: "Subscription", icon: Crown },
    { id: "team", label: "Team Management", icon: Users },
    { id: "roles", label: "Roles & Permissions", icon: Shield },
    { id: "security", label: "Security & Sessions", icon: Lock },
    { id: "api", label: "API Credentials", icon: Key },
    { id: "activity", label: "Activity History", icon: History },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "workspace", label: "Workspace Settings", icon: Settings },
    { id: "theme", label: "Theme & Accent", icon: Palette },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full flex flex-col flex-1">
      <div className="flex h-[calc(100vh-9.5rem)] rounded-xl border border-border/40 overflow-hidden bg-surface shadow-xl font-sans text-scale-xs">
      {/* Settings Shell Navigation */}
      <aside className="w-56 bg-surface border-r border-border/40 flex flex-col shrink-0">
        <div className="h-12 px-4 border-b border-border/40 flex items-center justify-between bg-void/35 shrink-0">
          <span className="font-display font-bold text-scale-sm text-bone">Settings</span>
        </div>
        <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
          {navList.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "relative flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg text-scale-xs font-medium transition-all text-left",
                  isActive
                    ? "bg-signal/10 text-signal border border-signal/20 shadow-sm shadow-signal/5"
                    : "text-muted-foreground hover:bg-void/40 hover:text-bone border border-transparent"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-signal" />
                )}
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-signal" : "text-muted-foreground/75")} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Settings Content Frame */}
      <main className="flex-1 bg-void/40 relative overflow-hidden flex flex-col">
        <div className={activeSection === "profile" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}><ProfileSettingsView /></div>
        <div className={activeSection === "organization" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}><OrganizationSettingsView /></div>
        <div className={activeSection === "billing" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}><BillingSettingsView /></div>
        <div className={activeSection === "subscription" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}><SubscriptionSettingsView /></div>
        <div className={activeSection === "team" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}><TeamSettingsView setConfirmDialog={setConfirmDialog} /></div>
        <div className={activeSection === "roles" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}><RolesPermissionsView /></div>
        <div className={activeSection === "security" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}><SecuritySettingsView setConfirmDialog={setConfirmDialog} /></div>
        <div className={activeSection === "api" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}><ApiSettingsView setConfirmDialog={setConfirmDialog} /></div>
        <div className={activeSection === "activity" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}><ActivityHistoryView /></div>
        <div className={activeSection === "notifications" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}><NotificationSettingsView /></div>
        <div className={activeSection === "workspace" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}><WorkspaceSettingsView /></div>
        <div className={activeSection === "theme" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}><ThemeSettingsView /></div>
      </main>
    </div>

    {/* Global Confirmation modal — rendered outside the overflow container */}
    {confirmDialog?.isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-surface border border-border/60 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg text-bone">{confirmDialog.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{confirmDialog.description}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(null)}
              className="flex-1 h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog(null);
              }}
              variant="destructive"
              className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

/* ==========================================
   SETTINGS SECTION VIEWS
   ========================================== */

// 1. Profile Settings
function ProfileSettingsView() {
  const [name, setName] = useState("Alex Mercer");
  const [displayName, setDisplayName] = useState("alexmercer");
  const [email, setEmail] = useState("alex@mercer.io");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [title, setTitle] = useState("Lead Architect");
  const [department, setDepartment] = useState("Engineering");
  const [bio, setBio] = useState("Building low-latency systems and modular node architectures. Passionate about developer tools and automation.");
  const [timezone, setTimezone] = useState("PST");
  const [linkedin, setLinkedin] = useState("linkedin.com/in/alexmercer");
  const [github, setGithub] = useState("github.com/alexmercer");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [avatarHover, setAvatarHover] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load profile from Supabase or localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("mvx_user_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setName(parsed.name);
        if (parsed.displayName) setDisplayName(parsed.displayName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.department) setDepartment(parsed.department);
        if (parsed.bio) setBio(parsed.bio);
        if (parsed.timezone) setTimezone(parsed.timezone);
        if (parsed.linkedin) setLinkedin(parsed.linkedin);
        if (parsed.github) setGithub(parsed.github);
      }
    } catch (e) {
      console.warn("Failed to parse cached profile", e);
    }

    if (isDemoMode || loaded) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoaded(true); return; }
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) { console.warn("[Profile] Load failed:", error.message); setLoaded(true); return; }
      if (data) {
        const loadedProfile = {
          name: data.full_name || name,
          displayName: data.display_name || displayName,
          email: data.email || email,
          phone: data.phone || phone,
          title: data.title || title,
          department: data.department || department,
          bio: data.bio || bio,
          timezone: data.timezone || timezone,
          linkedin: data.linkedin || linkedin,
          github: data.github || github,
        };

        if (data.full_name) setName(data.full_name);
        if (data.display_name) setDisplayName(data.display_name);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.title) setTitle(data.title);
        if (data.department) setDepartment(data.department);
        if (data.bio) setBio(data.bio);
        if (data.timezone) setTimezone(data.timezone);
        if (data.linkedin) setLinkedin(data.linkedin);
        if (data.github) setGithub(data.github);

        localStorage.setItem("mvx_user_profile", JSON.stringify(loadedProfile));
        window.dispatchEvent(new CustomEvent("mvx-profile-updated", { detail: { name: loadedProfile.name } }));
      }
      setLoaded(true);
    })();
  }, [loaded]);

  const handleSave = async () => {
    if (!isDemoMode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          full_name: name,
          display_name: displayName,
          email,
          title,
          department,
          phone,
          bio,
          timezone,
          linkedin,
          github,
        });
        if (error) {
          console.error("[Profile] Save failed:", error);
          toast.error(`Save failed: ${error.message}`);
          return;
        }
      }
    }

    const updatedProfile = {
      name,
      displayName,
      email,
      phone,
      title,
      department,
      bio,
      timezone,
      linkedin,
      github,
    };
    localStorage.setItem("mvx_user_profile", JSON.stringify(updatedProfile));
    window.dispatchEvent(new CustomEvent("mvx-profile-updated", { detail: { name } }));

    insertActivity({ title: "Profile settings updated", description: `Updated profile for ${name}`, type: "dev", userName: name });
    // Update TopBar immediately
    window.dispatchEvent(new CustomEvent("mvx-profile-updated", { detail: { name } }));
    toast.success("Profile saved"); setSuccessMsg("Profile updated successfully");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name) || "AM";

  return (
    <div className="flex-1 p-6 overflow-y-auto max-w-lg w-full space-y-6">
      <div className="space-y-1 border-b border-border/25 pb-3">
        <span className="eyebrow text-signal">PERSONAL IDENTITY</span>
        <h2 className="font-display font-bold text-scale-lg text-bone">Profile Information</h2>
        <p className="text-xs text-muted-foreground">Manage your public details, avatar, role, contact info, and profile metadata.</p>
      </div>

      {/* Avatar section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-signal/5 via-transparent to-transparent border border-border/40 p-6 rounded-xl space-y-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-signal/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <div
            className="relative w-20 h-20 rounded-full bg-void/50 ring-2 ring-signal/30 p-1 flex items-center justify-center cursor-pointer group"
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
          >
            <div className="w-full h-full rounded-full bg-signal/15 border border-signal/25 text-signal flex items-center justify-center font-display font-bold text-scale-lg">
              {avatarHover ? (
                <span className="text-[10px] font-sans text-signal">Upload</span>
              ) : (
                initials
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-display font-bold text-bone text-scale-base">{name}</p>
              <span className="eyebrow bg-signal/15 text-signal border border-signal/20 px-2 py-0.5 rounded-pill flex items-center gap-1">
                <Crown className="w-3 h-3 text-signal" /> Lead
              </span>
            </div>
            <p className="text-xs text-muted-foreground">@{displayName} · {title}</p>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="bg-surface border border-border/40 p-6 rounded-xl space-y-6 shadow-lg">
        {/* Sub-section 1: Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/10 pb-1.5">
            <User className="w-3.5 h-3.5 text-signal" />
            <h4 className="font-display font-semibold text-xs text-bone">Identity details</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <Input value={name} onChange={(e) => setName(e.target.value)} className="pl-9 bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Display Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground/60">@</span>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-7 bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Role / Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="flex w-full rounded border border-border/40 bg-void/50 text-bone px-2 py-2 h-9 text-scale-xs focus:outline-none focus:ring-1 focus:ring-signal"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Product">Product</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sub-section 2: Contact info */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-border/10 pb-1.5">
            <Mail className="w-3.5 h-3.5 text-signal" />
            <h4 className="font-display font-semibold text-xs text-bone">Contact & Preferences</h4>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9 bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Time Zone</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="flex w-full rounded border border-border/40 bg-void/50 text-bone pl-9 pr-2 py-2 h-9 text-scale-xs focus:outline-none focus:ring-1 focus:ring-signal"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">EST (Eastern)</option>
                  <option value="CST">CST (Central)</option>
                  <option value="PST">PST (Pacific)</option>
                  <option value="CET">CET (Central European)</option>
                  <option value="JST">JST (Japan)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Bio / About</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="flex w-full rounded border border-border/40 bg-void/50 text-bone px-3 py-2 text-scale-xs focus:outline-none focus:ring-1 focus:ring-signal resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Sub-section 3: Social connections */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-border/10 pb-1.5">
            <Globe className="w-3.5 h-3.5 text-signal" />
            <h4 className="font-display font-semibold text-xs text-bone">Social Profiles</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">LinkedIn</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/..." className="pl-9 bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">GitHub</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="github.com/..." className="pl-9 bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal" />
              </div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2">
          <Button type="button" onClick={handleSave} className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-9 w-full flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" /> Save Profile Info
          </Button>
          {successMsg && <p className="text-emerald-500 text-[11px] font-medium text-center mt-2">{successMsg}</p>}
        </div>
      </div>
    </div>
  );
}

// 2. Organization Settings
function OrganizationSettingsView() {
  // Identity
  const [orgName, setOrgName] = useState("MaVionix Labs");
  const [legalName, setLegalName] = useState("MaVionix Technologies Pvt. Ltd.");
  const [industry, setIndustry] = useState("Technology");
  const [orgSize, setOrgSize] = useState("11-50");
  const [domain, setDomain] = useState("mavionix.internal");
  const [logoHover, setLogoHover] = useState(false);

  // Contact & Location
  const [bizEmail, setBizEmail] = useState("admin@mavionix.io");
  const [bizPhone, setBizPhone] = useState("+91 98765 43210");
  const [website, setWebsite] = useState("https://mavionix.io");
  const [address, setAddress] = useState("Whitefield, Bangalore, Karnataka");
  const [country, setCountry] = useState("India");
  const [orgTimezone, setOrgTimezone] = useState("IST");

  // Preferences
  const [currency, setCurrency] = useState("INR");
  const [orgLanguage, setOrgLanguage] = useState("en");
  const [fiscalStart, setFiscalStart] = useState("April");

  // UI state
  const [identitySuccess, setIdentitySuccess] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [prefSuccess, setPrefSuccess] = useState<string | null>(null);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [orgLoaded, setOrgLoaded] = useState(false);

  // Load org data from Supabase on mount
  React.useEffect(() => {
    if (isDemoMode || orgLoaded) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setOrgLoaded(true); return; }
      const { data, error } = await supabase.from("organizations").select("*").eq("owner_id", user.id).single();
      if (error) { console.warn("[Org] Load failed:", error.message); setOrgLoaded(true); return; }
      if (data) {
        if (data.name) setOrgName(data.name);
        if (data.legal_name) setLegalName(data.legal_name);
        if (data.industry) setIndustry(data.industry);
        if (data.size) setOrgSize(data.size);
        if (data.domain) setDomain(data.domain);
        if (data.email) setBizEmail(data.email);
        if (data.phone) setBizPhone(data.phone);
        if (data.website) setWebsite(data.website);
        if (data.address) setAddress(data.address);
        if (data.country) setCountry(data.country);
        if (data.timezone) setOrgTimezone(data.timezone);
        if (data.currency) setCurrency(data.currency);
        if (data.language) setOrgLanguage(data.language);
        if (data.fiscal_year_start) setFiscalStart(data.fiscal_year_start);
      }
      setOrgLoaded(true);
    })();
  }, [orgLoaded]);

  const handleSaveIdentity = async () => {
    if (!isDemoMode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("organizations").upsert({
          owner_id: user.id,
          name: orgName,
          legal_name: legalName,
          industry,
          size: orgSize,
          domain,
        }, { onConflict: "owner_id" });
      }
    }
    insertActivity({ title: "Organization identity updated", description: `Updated org name to "${orgName}"`, type: "business" });
    toast.success("Organization identity saved"); setIdentitySuccess("Organization identity saved");
    setTimeout(() => setIdentitySuccess(null), 2500);
  };
  const handleSaveContact = async () => {
    if (!isDemoMode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("organizations").update({
          email: bizEmail,
          phone: bizPhone,
          website,
          address,
          country,
          timezone: orgTimezone,
        }).eq("owner_id", user.id);
      }
    }
    insertActivity({ title: "Organization contact info updated", description: `Updated contact email to ${bizEmail}`, type: "business" });
    toast.success("Contact info saved"); setContactSuccess("Contact & location saved");
    setTimeout(() => setContactSuccess(null), 2500);
  };
  const handleSavePrefs = async () => {
    if (!isDemoMode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("organizations").update({
          currency,
          language: orgLanguage,
          fiscal_year_start: fiscalStart,
        }).eq("owner_id", user.id);
      }
    }
    insertActivity({ title: "Organization preferences updated", description: `Currency: ${currency}, Language: ${orgLanguage}`, type: "business" });
    toast.success("Preferences updated"); setPrefSuccess("Preferences updated");
    setTimeout(() => setPrefSuccess(null), 2500);
  };

  const selectClass = "flex w-full rounded border border-border/40 bg-void/50 text-bone px-2 py-2 h-9 text-scale-xs focus:outline-none focus:ring-1 focus:ring-signal";
  const inputClass = "bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal";

  return (
    <div className="flex-1 p-6 overflow-y-auto max-w-2xl w-full space-y-6">
      <div className="space-y-1 border-b border-border/25 pb-3">
        <span className="eyebrow text-signal">COMPANY MANAGEMENT</span>
        <h2 className="font-display font-bold text-scale-lg text-bone">Organization</h2>
        <p className="text-xs text-muted-foreground">Manage company identity details, branding assets, defaults, and business settings.</p>
      </div>

      {/* CARD 1 — Organization Identity */}
      <div className="bg-surface border border-border/40 p-5 rounded-xl space-y-4 shadow-lg">
        <h3 className="font-display font-bold text-scale-sm text-bone">Organization Identity</h3>

        {/* Logo */}
        <div className="flex items-center gap-4">
          <div
            className="relative w-14 h-14 rounded-xl bg-signal/15 border-2 border-signal/25 text-signal flex items-center justify-center font-display font-bold text-scale-base cursor-pointer"
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
          >
            {logoHover ? <span className="text-[10px] font-sans">Upload</span> : "ML"}
          </div>
          <div className="space-y-0.5">
            <p className="text-scale-xs font-medium text-bone">Organization Logo</p>
            <p className="text-[10px] text-muted-foreground">Hover and click to upload. Falls back to initials.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Organization Name</label>
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Legal Business Name</label>
            <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} className={inputClass} placeholder="Optional" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Industry</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selectClass}>
              <option value="Technology">Technology</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Education">Education</option>
              <option value="Government">Government</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Organization Size</label>
            <select value={orgSize} onChange={(e) => setOrgSize(e.target.value)} className={selectClass}>
              <option value="1-10">1–10</option>
              <option value="11-50">11–50</option>
              <option value="51-200">51–200</option>
              <option value="201-1000">201–1000</option>
              <option value="1000+">1000+</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Custom Domain</label>
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} className={inputClass} />
          </div>
        </div>

        <Button type="button" onClick={handleSaveIdentity} className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-9 w-full flex items-center justify-center gap-1.5">
          <Check className="w-4 h-4" /> Save Identity Details
        </Button>
        {identitySuccess && <p className="text-emerald-500 text-[11px] font-medium text-center mt-2">{identitySuccess}</p>}
      </div>

      {/* CARD 2 — Contact & Location */}
      <div className="bg-surface border border-border/40 p-5 rounded-xl space-y-4 shadow-lg">
        <h3 className="font-display font-bold text-scale-sm text-bone">Contact & Location</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Business Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
              <Input type="email" value={bizEmail} onChange={(e) => setBizEmail(e.target.value)} className="pl-9 bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Support Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
              <Input value={bizPhone} onChange={(e) => setBizPhone(e.target.value)} className="pl-9 bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Website URL</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} className="pl-9 bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
              <Input value={address} onChange={(e) => setAddress(e.target.value)} className="pl-9 bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Country</label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Time Zone (Org Default)</label>
          <select value={orgTimezone} onChange={(e) => setOrgTimezone(e.target.value)} className={selectClass}>
            <option value="IST">IST (India Standard Time)</option>
            <option value="UTC">UTC</option>
            <option value="EST">EST (Eastern)</option>
            <option value="PST">PST (Pacific)</option>
            <option value="CET">CET (Central European)</option>
            <option value="JST">JST (Japan)</option>
          </select>
        </div>

        <Button type="button" onClick={handleSaveContact} className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-9 w-full flex items-center justify-center gap-1.5">
          <Check className="w-4 h-4" /> Save Contact Details
        </Button>
        {contactSuccess && <p className="text-emerald-500 text-[11px] font-medium text-center mt-2">{contactSuccess}</p>}
      </div>

      {/* CARD 3 — Preferences & Defaults */}
      <div className="bg-surface border border-border/40 p-5 rounded-xl space-y-4 shadow-lg">
        <h3 className="font-display font-bold text-scale-sm text-bone">Preferences & Defaults</h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Default Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClass}>
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
              <option value="JPY">¥ JPY</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Default Language</label>
            <select value={orgLanguage} onChange={(e) => setOrgLanguage(e.target.value)} className={selectClass}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Fiscal Year Start</label>
            <select value={fiscalStart} onChange={(e) => setFiscalStart(e.target.value)} className={selectClass}>
              <option value="January">January</option>
              <option value="April">April</option>
              <option value="July">July</option>
              <option value="October">October</option>
            </select>
          </div>
        </div>

        <Button type="button" onClick={handleSavePrefs} className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-9 w-full flex items-center justify-center gap-1.5">
          <Check className="w-4 h-4" /> Save Preferences
        </Button>
        {prefSuccess && <p className="text-emerald-500 text-[11px] font-medium text-center mt-2">{prefSuccess}</p>}
      </div>

      {/* CARD 4 — Danger Zone */}
      <div className="bg-surface border border-destructive/30 rounded-xl p-5 space-y-4 shadow-lg">
        <h3 className="font-display font-bold text-scale-sm text-destructive">Danger Zone</h3>

        {/* Org ID */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Organization ID (read-only)</label>
          <div className="flex items-center gap-2">
            <Input value="org_mvx_9a72cdb1" readOnly className="bg-void/30 border-border/30 text-scale-xs text-muted-foreground font-mono flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={() => { navigator.clipboard.writeText("org_mvx_9a72cdb1"); setActionMsg("Copied!"); setTimeout(() => setActionMsg(null), 1500); }}
              className="h-9 px-3 text-scale-xs shrink-0"
            >
              Copy
            </Button>
          </div>
          {actionMsg && <p className="text-emerald-500 text-[10px] font-medium">{actionMsg}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowTransferConfirm(true)}
            className="flex-1 h-9 text-scale-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
          >
            Transfer Ownership
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 h-9 text-scale-xs"
          >
            Delete Organization
          </Button>
        </div>
      </div>

      {/* Transfer Ownership Confirm */}
      {showTransferConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border/60 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-bone">Transfer Ownership</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This will transfer organization ownership to another admin. You will be downgraded to an Admin role.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowTransferConfirm(false)} className="flex-1 h-10">
                Cancel
              </Button>
              <Button onClick={() => { setShowTransferConfirm(false); setActionMsg("Ownership transfer initiated"); setTimeout(() => setActionMsg(null), 2500); }} className="flex-1 h-10">
                Confirm Transfer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Organization Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border/60 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-bone">Delete Organization</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This will permanently delete the organization, all workspaces, projects, team data, and associated resources. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1 h-10">
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => { setShowDeleteConfirm(false); setActionMsg("Organization deleted"); setTimeout(() => setActionMsg(null), 2500); }} className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white">
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. Billing & Plans
interface InvoiceRecord {
  id: string;
  date: string;
  total: string;
  state: string;
}

function BillingSettingsView() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([
    { id: "INV-9022", date: "2026-07-01", total: "$49.00", state: "PAID" },
    { id: "INV-9011", date: "2026-06-01", total: "$49.00", state: "PAID" },
  ]);
  const [loaded, setLoaded] = useState(false);

  // Load invoices from Supabase
  React.useEffect(() => {
    if (isDemoMode || loaded) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
      if (!profile?.org_id) return;
      const { data } = await supabase
        .from("billing_invoices")
        .select("*")
        .eq("org_id", profile.org_id)
        .order("billing_date", { ascending: false })
        .limit(20);
      if (data && data.length > 0) {
        setInvoices(data.map((inv: { id: string; billing_date: string; amount: number; status: string }) => ({
          id: inv.id.slice(0, 8).toUpperCase(),
          date: inv.billing_date,
          total: `$${inv.amount.toFixed(2)}`,
          state: inv.status.toUpperCase(),
        })));
      }
      setLoaded(true);
    })();
  }, [loaded]);

  const columns: DataColumn<InvoiceRecord>[] = [
    { key: "id", header: "Invoice ID", sortable: true },
    { key: "date", header: "Billing Date" },
    { key: "total", header: "Amount Charged" },
    {
      key: "state",
      header: "Status",
      render: (row) => (
        <span className="text-emerald-500 font-mono text-[9px] font-bold border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.2 rounded">
          {row.state}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="space-y-1 border-b border-border/25 pb-3">
        <span className="eyebrow text-signal">FINANCIAL LOGISTICS</span>
        <h2 className="font-display font-bold text-scale-lg text-bone">Billing & Plans</h2>
        <p className="text-xs text-muted-foreground">Review your tier allocations, monthly invoices, and transaction logs.</p>
      </div>

      {/* Plan Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-signal/5 via-transparent to-transparent border border-border/40 rounded-xl p-6 shadow-lg space-y-4 max-w-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-signal/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-center relative z-10">
          <h3 className="font-display font-bold text-scale-base text-bone">Pro Workspace</h3>
          <span className="font-mono text-[9px] font-bold bg-signal/10 text-signal border border-signal/20 px-2 py-0.5 rounded-pill uppercase">
            active plan
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-normal relative z-10">
          Workspace capacity: <strong className="text-bone font-semibold">5 member allocations</strong>, unlimited micro-service worker flows, and full cross-suite integrations.
        </p>
      </div>

      {/* Invoices */}
      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg relative z-10">
        <h3 className="font-display font-bold text-scale-sm text-bone mb-3.5">Invoice Billing Logs</h3>
        <DataTable data={invoices} columns={columns} />
      </div>
    </div>
  );
}

// 4. Team Management Settings
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

function TeamSettingsView({
  setConfirmDialog,
}: {
  setConfirmDialog: React.Dispatch<React.SetStateAction<ConfirmDialogState | null>>;
}) {
  const { members, inviteMember, removeMember, changeMemberRole } = useRealtimeTeamMembers();

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const handleDeleteMember = (member: TeamMember) => {
    setConfirmDialog({
      isOpen: true,
      title: "Remove Team Member?",
      description: `Confirm removal of ${member.name} (${member.email}) from this workspace. This action cannot be undone.`,
      onConfirm: () => {
        removeMember(member.id);
        setSelectedMember(null);
        logAndNotify({
          activityTitle: `Team member removed: ${member.name}`,
          activityDescription: `Removed ${member.email} from workspace`,
          activityType: "business",
          notificationTitle: "Team Member Removed",
          notificationDescription: `${member.name} (${member.email}) has been removed.`,
          notificationType: "warning",
          notificationSuite: "system",
        });
        toast.success(`${member.name} removed from team`);
      },
    });
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    const member = members.find(m => m.id === memberId);
    changeMemberRole(memberId, newRole);
    insertActivity({
      title: `Role changed for ${member?.name ?? "member"}`,
      description: `Changed role to ${newRole}`,
      type: "business",
    });
    toast.success(`Role updated to ${newRole}`);
  };

  const columns: DataColumn<TeamMember>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email Address" },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <select
          value={row.role}
          onChange={(e) => handleRoleChange(row.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="bg-void/50 border border-border/40 rounded px-2 py-1 text-scale-xs text-bone focus:outline-none focus:ring-1 focus:ring-signal"
        >
          <option value="Owner">Owner</option>
          <option value="Admin">Admin</option>
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
        </select>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteMember(row);
          }}
          className="text-muted-foreground hover:text-red-500 w-7 h-7 hover:bg-red-500/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <div className="space-y-1">
          <span className="eyebrow text-signal">WORKSPACE ROSTER</span>
          <h2 className="font-display font-bold text-scale-lg text-bone">Team Management</h2>
          <p className="text-xs text-muted-foreground">Invite team contributors, manage active user seats, and control workspace access.</p>
        </div>
        <Button
          onClick={async () => {
            const newName = `Contributor #${members.length + 1}`;
            const newEmail = `team-${members.length + 1}@internal.io`;
            const newRole = "Viewer";
            await inviteMember(newName, newEmail, newRole);
            logAndNotify({
              activityTitle: `Team member invited: ${newName}`,
              activityDescription: `Invited ${newEmail} as ${newRole}`,
              activityType: "business",
              notificationTitle: "Team Member Invited",
              notificationDescription: `${newName} (${newEmail}) has been invited.`,
              notificationType: "info",
              notificationSuite: "system",
            });
            toast.success("Team member invited");
          }}
          className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-8 px-3 rounded-lg flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Invite Member
        </Button>
      </div>

      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg relative z-10">
        {members.length === 0 ? (
          <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-3 border border-dashed border-border/25 rounded-xl bg-void/10 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-lg bg-signal/10 border border-signal/25 flex items-center justify-center text-signal">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-bone">No Contributors Registered</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Invite your first contributor to start pair-programming or managing pipelines together.
              </p>
            </div>
          </div>
        ) : (
          <DataTable
            data={members}
            columns={columns}
            filterKey="name"
            filterPlaceholder="Search team member..."
          />
        )}
      </div>

      <DetailPanel
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title="Team Member Profile"
        subtitle={selectedMember?.role}
      >
        <div className="space-y-4 text-scale-xs text-bone select-text">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Member Name</span>
            <p className="font-semibold text-bone">{selectedMember?.name}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Email Address</span>
            <p className="font-mono text-muted-foreground">{selectedMember?.email}</p>
          </div>
          <div className="space-y-2 pt-2 border-t border-border/10">
            <Button
              onClick={() => selectedMember && handleDeleteMember(selectedMember)}
              variant="destructive"
              className="text-[10px] h-8 w-full"
            >
              Remove Member from Workspace
            </Button>
          </div>
        </div>
      </DetailPanel>
    </div>
  );
}

// 5. Security & Sessions Settings
interface ActiveSession {
  id: string;
  device: string;
  ip: string;
  date: string;
}

function SecuritySettingsView({
  setConfirmDialog,
}: {
  setConfirmDialog: React.Dispatch<React.SetStateAction<ConfirmDialogState | null>>;
}) {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  // Form states for manual session input
  const [deviceName, setDeviceName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [lastActive, setLastActive] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Load sessions from Supabase or localStorage (in demo mode)
  React.useEffect(() => {
    (async () => {
      if (isDemoMode) {
        try {
          const stored = localStorage.getItem("mvx_demo_sessions");
          if (stored) {
            setSessions(JSON.parse(stored));
          } else {
            setSessions([]);
          }
        } catch (e) {
          console.warn("Failed to load demo sessions", e);
          setSessions([]);
        }
        setSessionsLoaded(true);
        return;
      }
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setSessions([]);
          setSessionsLoaded(true);
          return;
        }
        const { data, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("user_id", user.id)
          .eq("revoked", false)
          .order("last_active_at", { ascending: false });
          
        if (error) {
          console.error("Failed to load sessions from Supabase", error);
          setSessions([]);
        } else if (data) {
          setSessions(data.map((s: any) => ({
            id: s.id,
            device: s.device ?? "Unknown Device",
            ip: s.ip_address ?? "Unknown IP",
            date: s.user_agent || (s.last_active_at ? new Date(s.last_active_at).toLocaleDateString() : "Unknown"),
          })));
        }
      } catch (err) {
        console.error("Error loading sessions:", err);
        setSessions([]);
      }
      setSessionsLoaded(true);
    })();
  }, [sessionsLoaded]);

  const handleRevoke = (session: ActiveSession) => {
    setConfirmDialog({
      isOpen: true,
      title: "Revoke Active Session?",
      description: `Confirm session revocation for ${session.device}. The client session token will be invalidated immediately.`,
      onConfirm: async () => {
        setSessions(prev => prev.filter((s) => s.id !== session.id));
        if (!isDemoMode) {
          try {
            await supabase.from("sessions").update({ revoked: true }).eq("id", session.id);
          } catch (err) {
            console.error("Failed to revoke session in Supabase:", err);
          }
        } else {
          // Demo Mode: update localStorage
          try {
            const stored = localStorage.getItem("mvx_demo_sessions");
            if (stored) {
              const demoSessions = JSON.parse(stored);
              const updated = demoSessions.filter((s: any) => s.id !== session.id);
              localStorage.setItem("mvx_demo_sessions", JSON.stringify(updated));
            }
          } catch (e) {
            console.warn("Failed to remove from localStorage:", e);
          }
        }
        insertActivity({ title: "Session revoked", description: `Revoked session for ${session.device}`, type: "dev" });
        toast.success("Session revoked");
      },
    });
  };

  const handleAddSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim() || !ipAddress.trim() || !lastActive.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    // IP Address Format Validation (simple check for inet DB compat)
    const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipv4Regex.test(ipAddress) && !ipAddress.includes(":")) {
      toast.error("Please enter a valid IP address (e.g. 192.168.1.102 or ::1)");
      return;
    }

    const newSessionId = `s-${Date.now()}`;
    const newSession: ActiveSession = {
      id: newSessionId,
      device: deviceName,
      ip: ipAddress,
      date: lastActive,
    };

    if (!isDemoMode) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("sessions")
            .insert({
              user_id: user.id,
              device: deviceName,
              ip_address: ipAddress,
              user_agent: lastActive,
              last_active_at: new Date().toISOString(),
              revoked: false,
            })
            .select()
            .single();

          if (error) {
            console.error("Failed to insert session into Supabase:", error);
            toast.error(`Failed to save: ${error.message}`);
            return;
          }
          if (data) {
            newSession.id = data.id;
          }
        }
      } catch (err) {
        console.error("Error creating session in Supabase:", err);
        toast.error("An error occurred while saving to Supabase.");
        return;
      }
    } else {
      // Demo Mode: save to localStorage
      try {
        const stored = localStorage.getItem("mvx_demo_sessions");
        const demoSessions = stored ? JSON.parse(stored) : [];
        demoSessions.push(newSession);
        localStorage.setItem("mvx_demo_sessions", JSON.stringify(demoSessions));
      } catch (e) {
        console.warn("Failed to save to localStorage:", e);
      }
    }

    setSessions((prev) => [...prev, newSession]);
    insertActivity({ title: "Session added", description: `Manually added session for ${deviceName}`, type: "dev" });
    toast.success("Session added successfully");
    
    // Clear form and close
    setDeviceName("");
    setIpAddress("");
    setLastActive("");
    setShowAddForm(false);
  };

  const columns: DataColumn<ActiveSession>[] = [
    { key: "device", header: "Device Render", sortable: true },
    { key: "ip", header: "IP Address" },
    { key: "date", header: "Last active" },
    {
      key: "actions",
      header: "Revoke",
      render: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleRevoke(row)}
          className="text-muted-foreground hover:text-pulse w-7 h-7 hover:bg-void/40"
        >
          <Lock className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex-grow p-6 overflow-y-auto space-y-6">
      <div className="space-y-1 border-b border-border/25 pb-3">
        <span className="eyebrow text-signal">SECURITY INTEGRITY</span>
        <h2 className="font-display font-bold text-scale-lg text-bone">Security Center</h2>
        <p className="text-xs text-muted-foreground">Configure authentication layers, track active user sessions, and revoke keys.</p>
      </div>

      {/* 2FA Card - Cosmetic and disabled-looking UI */}
      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg flex justify-between items-center max-w-md opacity-60 pointer-events-none">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-scale-xs text-bone">Two-Factor Authentication (2FA)</h3>
          <p className="text-[10px] text-muted-foreground">Add secondary validation keys protection.</p>
        </div>
        <Button
          variant="outline"
          disabled
          className="text-scale-xs h-8 px-4 rounded font-mono border-border/40 text-muted-foreground bg-void/20"
        >
          DISABLED
        </Button>
      </div>

      {/* Active Sessions */}
      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg relative z-10 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-bold text-scale-sm text-bone">Active Workspace Sessions</h3>
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-8 px-3 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Session
            </Button>
          )}
        </div>

        {/* Add Session Form */}
        {showAddForm && (
          <form onSubmit={handleAddSessionSubmit} className="bg-void/40 border border-border/20 rounded-xl p-5 space-y-4 max-w-md animate-in fade-in slide-in-from-top-2 duration-250">
            <h4 className="font-display font-semibold text-scale-xs text-bone">Add New Session Manually</h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Device Name</label>
                <Input
                  type="text"
                  placeholder='e.g. Apple MacBook Pro (macOS)'
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">IP Address</label>
                <Input
                  type="text"
                  placeholder='e.g. 192.168.1.102'
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Status / Last Active</label>
                <Input
                  type="text"
                  placeholder='e.g. Active Session'
                  value={lastActive}
                  onChange={(e) => setLastActive(e.target.value)}
                  className="bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setDeviceName("");
                  setIpAddress("");
                  setLastActive("");
                }}
                className="text-scale-xs h-8 px-3 rounded-lg border-border/40 text-muted-foreground hover:bg-void/40"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-8 px-3 rounded-lg flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Add Session
              </Button>
            </div>
          </form>
        )}

        {/* Sessions DataTable or Empty State */}
        {sessions.length === 0 ? (
          <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-3 border border-dashed border-border/20 rounded-xl bg-void/10 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-lg bg-signal/10 border border-signal/25 flex items-center justify-center text-signal">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-bone">No Active Sessions</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                No active login sessions detected. You can add one manually above.
              </p>
            </div>
          </div>
        ) : (
          <DataTable data={sessions} columns={columns} />
        )}
      </div>
    </div>
  );
}

// 6. API Credentials Settings
interface ApiKeyItem {
  id: string;
  name: string;
  token: string;
  scope: string;
  revealed: boolean;
}

function ApiSettingsView({
  setConfirmDialog,
}: {
  setConfirmDialog: React.Dispatch<React.SetStateAction<ConfirmDialogState | null>>;
}) {
  const [keys, setKeys] = useState<ApiKeyItem[]>([
    { id: "k-1", name: "Prod server ingest token", token: "mvx_live_9011_98a72cdb", scope: "read_write", revealed: false },
    { id: "k-2", name: "Development sand test key", token: "mvx_test_4022_b3cd8aa7", scope: "read_only", revealed: false },
  ]);
  const [keysLoaded, setKeysLoaded] = useState(false);

  // Load API keys from Supabase
  React.useEffect(() => {
    if (isDemoMode || keysLoaded) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
      if (!profile?.org_id) return;
      const { data } = await supabase
        .from("api_keys")
        .select("*")
        .eq("org_id", profile.org_id)
        .eq("revoked", false)
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setKeys(data.map((k: { id: string; name: string; key_prefix: string; scope: string }) => ({
          id: k.id,
          name: k.name,
          token: `${k.key_prefix}••••••••••••••••`,
          scope: k.scope,
          revealed: false,
        })));
      }
      setKeysLoaded(true);
    })();
  }, [keysLoaded]);

  const handleToggleReveal = (id: string) => {
    setKeys(keys.map((key) => (key.id === id ? { ...key, revealed: !key.revealed } : key)));
  };

  const handleDeleteKey = (key: ApiKeyItem) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete API Ingest Token?",
      description: `Confirm permanent deletion of ${key.name}. Destructive change. Any systems using this token will fail immediately.`,
      onConfirm: async () => {
        setKeys(keys.filter((k) => k.id !== key.id));
        if (!isDemoMode) {
          await supabase.from("api_keys").update({ revoked: true }).eq("id", key.id);
        }
        insertActivity({ title: `API key revoked: ${key.name}`, description: `Revoked key "${key.name}" (${key.scope})`, type: "dev" });
        toast.success("API key revoked");
      },
    });
  };

  const handleCreateKey = async () => {
    const newName = `Custom Token #${keys.length + 1}`;
    const newToken = `mvx_live_custom_${Date.now().toString(36)}`;
    const localKey: ApiKeyItem = { id: `k-${Date.now()}`, name: newName, token: newToken, scope: "read_only", revealed: false };
    
    if (!isDemoMode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
        if (profile?.org_id) {
          const { data } = await supabase.from("api_keys").insert({
            org_id: profile.org_id,
            created_by: user.id,
            name: newName,
            key_prefix: newToken.slice(0, 12),
            key_hash: newToken, // In production, hash this
            scope: "read",
          }).select().single();
          if (data) localKey.id = data.id;
        }
      }
    }
    setKeys([...keys, localKey]);
    insertActivity({ title: `API key created: ${newName}`, description: `Created new key with read_only scope`, type: "dev" });
    toast.success("API key created");
  };

  const columns: DataColumn<ApiKeyItem>[] = [
    { key: "name", header: "Credential name", sortable: true },
    {
      key: "token",
      header: "Ingest Token",
      render: (row) => (
        <div className="flex items-center gap-2 font-mono">
          <span>{row.revealed ? row.token : "••••••••••••••••"}</span>
          <button
            onClick={() => handleToggleReveal(row.id)}
            className="text-muted-foreground hover:text-bone text-[10px]"
          >
            {row.revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      ),
    },
    { key: "scope", header: "Scopes binding" },
    {
      key: "actions",
      header: "Revoke",
      render: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteKey(row)}
          className="text-muted-foreground hover:text-pulse w-7 h-7 hover:bg-void/40"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <div className="space-y-1">
          <span className="eyebrow text-signal">INTEGRATIONS AND INGEST</span>
          <h2 className="font-display font-bold text-scale-lg text-bone">API Ingest Credentials</h2>
          <p className="text-xs text-muted-foreground">Manage API credentials, authentication tokens, and service hooks.</p>
        </div>
        <Button
          onClick={handleCreateKey}
          className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-8 px-3 rounded-lg flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Create API Key
        </Button>
      </div>

      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg relative z-10">
        {keys.length === 0 ? (
          <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-3 border border-dashed border-border/25 rounded-xl bg-void/10 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-lg bg-signal/10 border border-signal/25 flex items-center justify-center text-signal">
              <Key className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-bone">No Ingest Credentials Available</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                You haven't generated any ingest API credentials for this organization.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleCreateKey}
              className="bg-signal hover:bg-signal/90 text-void font-semibold text-xs h-8 px-4 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Create API Key
            </Button>
          </div>
        ) : (
          <DataTable data={keys} columns={columns} />
        )}
      </div>
    </div>
  );
}

// 7. Notifications settings
function NotificationSettingsView() {
  const [emailToggle, setEmailToggle] = useState(true);
  const [appToggle, setAppToggle] = useState(true);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Load notification preferences from profiles
  React.useEffect(() => {
    if (isDemoMode || prefsLoaded) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("email_alerts, in_app_alerts").eq("id", user.id).single();
      if (data) {
        if (data.email_alerts !== null) setEmailToggle(data.email_alerts);
        if (data.in_app_alerts !== null) setAppToggle(data.in_app_alerts);
      }
      setPrefsLoaded(true);
    })();
  }, [prefsLoaded]);

  const handleEmailToggle = async () => {
    const newVal = !emailToggle;
    setEmailToggle(newVal);
    if (!isDemoMode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("profiles").update({ email_alerts: newVal }).eq("id", user.id);
    }
  };

  const handleAppToggle = async () => {
    const newVal = !appToggle;
    setAppToggle(newVal);
    if (!isDemoMode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("profiles").update({ in_app_alerts: newVal }).eq("id", user.id);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto max-w-lg w-full space-y-6">
      <div className="space-y-1 border-b border-border/25 pb-3">
        <span className="eyebrow text-signal">COMMUNICATION PREFERENCES</span>
        <h2 className="font-display font-bold text-scale-lg text-bone">Notifications Alert</h2>
        <p className="text-xs text-muted-foreground">Toggle email updates, live build release digests, and in-app execution warnings.</p>
      </div>

      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex justify-between items-center py-1 border-b border-border/10">
          <div className="space-y-0.5">
            <h4 className="font-semibold text-bone">Email Alerts Channel</h4>
            <p className="text-[10px] text-muted-foreground">Receive daily build release digests.</p>
          </div>
          <Button
            onClick={handleEmailToggle}
            variant="outline"
            className={cn(
              "text-scale-xs h-8 px-3 rounded font-mono",
              emailToggle
                ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                : "border-border/40 text-muted-foreground hover:bg-void/40"
            )}
          >
            {emailToggle ? "ON" : "OFF"}
          </Button>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-border/10">
          <div className="space-y-0.5">
            <h4 className="font-semibold text-bone">In-App Live Alerts</h4>
            <p className="text-[10px] text-muted-foreground">Real-time triggers execution alerts.</p>
          </div>
          <Button
            onClick={handleAppToggle}
            variant="outline"
            className={cn(
              "text-scale-xs h-8 px-3 rounded font-mono",
              appToggle
                ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                : "border-border/40 text-muted-foreground hover:bg-void/40"
            )}
          >
            {appToggle ? "ON" : "OFF"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// 8. Theme Settings View
function ThemeSettingsView() {
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [accentDemo, setAccentDemo] = useState<"signal" | "pulse" | "circuit">("signal");
  const { setTheme } = useTheme();
  const [themeLoaded, setThemeLoaded] = useState(false);

  // Load persisted theme preference from profiles
  React.useEffect(() => {
    if (isDemoMode || themeLoaded) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("theme, accent").eq("id", user.id).single();
      if (data) {
        if (data.theme === "light" || data.theme === "dark") {
          setThemeMode(data.theme);
          setTheme(data.theme);
        }
        if (data.accent === "signal" || data.accent === "pulse" || data.accent === "circuit") {
          setAccentDemo(data.accent);
        }
      }
      setThemeLoaded(true);
    })();
  }, [themeLoaded, setTheme]);

  const handleThemeChange = async (mode: "dark" | "light") => {
    setThemeMode(mode);
    setTheme(mode);
    if (!isDemoMode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("profiles").update({ theme: mode }).eq("id", user.id);
    }
  };

  return (
    <div className="flex-grow p-6 overflow-y-auto space-y-6 max-w-lg w-full">
      <div className="space-y-1 border-b border-border/25 pb-3">
        <span className="eyebrow text-signal">INTERFACE STYLING</span>
        <h2 className="font-display font-bold text-scale-lg text-bone">Theme & Accent Settings</h2>
        <p className="text-xs text-muted-foreground">Customize appearance theme wrapper and suite colors to fit your brand.</p>
      </div>

      {/* Theme Selectors */}
      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="font-display font-bold text-scale-sm text-bone">Interface Appearance</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: "dark", label: "Obsidian Void (Dark)" },
            { id: "light", label: "Glacier Bone (Light)" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleThemeChange(mode.id as "dark" | "light")}
              className={cn(
                "p-4 rounded-xl border bg-void/35 text-left text-scale-xs transition-all",
                themeMode === mode.id
                  ? "border-signal ring-1 ring-signal text-signal"
                  : "border-border/30 text-muted-foreground hover:border-border/80"
              )}
            >
              <span className="font-display font-bold text-bone block">{mode.label}</span>
              <span className="text-[10px] text-muted-foreground block mt-1">Platform theme wrapper</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Previewer */}
      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-4">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-scale-sm text-bone">Product Suites Accent</h3>
          <p className="text-[10px] text-muted-foreground">Select accent token variables to trigger palette changes.</p>
        </div>

        <div className="flex gap-4">
          {[
            { id: "signal", label: "Dev & Biz Accent", color: "bg-[#8B5CF6]" },
            { id: "pulse", label: "Creative AI Accent", color: "bg-[#EC4899]" },
            { id: "circuit", label: "Automation Influx", color: "bg-[#22D3EE]" },
          ].map((acc) => (
            <button
              key={acc.id}
              onClick={() => setAccentDemo(acc.id as "signal" | "pulse" | "circuit")}
              className={cn(
                "flex-grow p-3 rounded-lg border bg-void/35 text-center text-[10px] font-semibold transition-all flex flex-col items-center gap-2",
                accentDemo === acc.id
                  ? "border-signal ring-1 ring-signal text-signal"
                  : "border-border/30 text-muted-foreground hover:border-border/80"
              )}
            >
              <div className={cn("w-3 h-3 rounded-full", acc.color)} />
              <span>{acc.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 9. Roles & Permissions

function RolesPermissionsView() {
  const { roles, createRole } = useRealtimeRoles();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleProjects, setNewRoleProjects] = useState("View");
  const [newRoleBilling, setNewRoleBilling] = useState("None");
  const [newRoleSettings, setNewRoleSettings] = useState("None");
  const [newRoleTeam, setNewRoleTeam] = useState("View");

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    await createRole({
      name: newRoleName.trim(),
      projects: newRoleProjects,
      billing: newRoleBilling,
      settings: newRoleSettings,
      team: newRoleTeam,
    });
    logAndNotify({
      activityTitle: `Role created: ${newRoleName.trim()}`,
      activityDescription: `New role "${newRoleName.trim()}" with Projects=${newRoleProjects}`,
      activityType: "business",
      notificationTitle: "Role Created",
      notificationDescription: `New role "${newRoleName.trim()}" has been created.`,
      notificationType: "success",
      notificationSuite: "system",
    });
    toast.success(`Role "${newRoleName.trim()}" created`);
    setNewRoleName("");
    setNewRoleProjects("View");
    setNewRoleBilling("None");
    setNewRoleSettings("None");
    setNewRoleTeam("View");
    setShowCreateForm(false);
  };

  const columns: DataColumn<LocalRole>[] = [
    { key: "role", header: "Role", sortable: true },
    { key: "members", header: "Members", sortable: true },
    { key: "projects", header: "Projects" },
    { key: "billing", header: "Billing" },
    { key: "settings", header: "Settings" },
    { key: "team", header: "Team Mgmt" },
  ];

  const permOptions = ["Full", "Edit", "View", "None"];

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="space-y-1 border-b border-border/25 pb-3">
        <span className="eyebrow text-signal">ACCESS INTEGRITY</span>
        <h2 className="font-display font-bold text-scale-lg text-bone">Roles & Permissions</h2>
        <p className="text-xs text-muted-foreground">Define workspace roles, fine-grained access rules, and permission layers.</p>
      </div>

      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-bold text-scale-sm text-bone">Permission Matrix</h3>
          <Button onClick={() => setShowCreateForm(true)} className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-8 px-3 rounded-lg flex items-center gap-1">
            <Plus className="w-4 h-4" /> Create Role
          </Button>
        </div>

        {showCreateForm && (
          <div className="border border-border/40 rounded-lg p-4 bg-void/30 space-y-3">
            <h4 className="font-semibold text-bone text-scale-xs">New Role</h4>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Role Name</label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Enter role name..."
                className="bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Projects</label>
                <select value={newRoleProjects} onChange={(e) => setNewRoleProjects(e.target.value)} className="flex w-full rounded border border-border/40 bg-void/50 text-bone px-2 py-1.5 text-scale-xs focus:outline-none focus:ring-1 focus:ring-signal">
                  {permOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Billing</label>
                <select value={newRoleBilling} onChange={(e) => setNewRoleBilling(e.target.value)} className="flex w-full rounded border border-border/40 bg-void/50 text-bone px-2 py-1.5 text-scale-xs focus:outline-none focus:ring-1 focus:ring-signal">
                  {permOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Settings</label>
                <select value={newRoleSettings} onChange={(e) => setNewRoleSettings(e.target.value)} className="flex w-full rounded border border-border/40 bg-void/50 text-bone px-2 py-1.5 text-scale-xs focus:outline-none focus:ring-1 focus:ring-signal">
                  {permOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Team</label>
                <select value={newRoleTeam} onChange={(e) => setNewRoleTeam(e.target.value)} className="flex w-full rounded border border-border/40 bg-void/50 text-bone px-2 py-1.5 text-scale-xs focus:outline-none focus:ring-1 focus:ring-signal">
                  {permOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" onClick={handleCreateRole} className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-8 px-4 rounded-lg flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Add Role
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="border-border/60 hover:bg-void/40 text-bone text-scale-xs h-8 px-4 rounded-lg">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {roles.length === 0 ? (
          <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-3 border border-dashed border-border/25 rounded-xl bg-void/10 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-lg bg-signal/10 border border-signal/25 flex items-center justify-center text-signal">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-bone">No Roles Configured</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                No roles found in this workspace. Create custom roles to bind permissions.
              </p>
            </div>
          </div>
        ) : (
          <DataTable data={roles} columns={columns} />
        )}
      </div>

      {/* Permission legend */}
      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-3">
        <h3 className="font-display font-bold text-scale-sm text-bone">Permission Levels</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-scale-xs">
          {[
            { level: "Full", desc: "Create, edit, delete, manage" },
            { level: "Edit", desc: "Create and edit, no delete" },
            { level: "View", desc: "Read-only access" },
            { level: "None", desc: "No access" },
          ].map((item) => (
            <div key={item.level} className="p-3 rounded-lg border border-border/30 bg-void/30">
              <span className="font-semibold text-bone block">{item.level}</span>
              <span className="text-[10px] text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 10. Subscription — plan comparison cards
function SubscriptionSettingsView() {
  const [currentPlan, setCurrentPlan] = useState("Pro");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [subLoaded, setSubLoaded] = useState(false);

  // Load current subscription from Supabase
  React.useEffect(() => {
    if (isDemoMode || subLoaded) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
      if (!profile?.org_id) return;
      const { data } = await supabase
        .from("subscriptions")
        .select("plan_tier")
        .eq("org_id", profile.org_id)
        .single();
      if (data?.plan_tier) {
        const tierMap: Record<string, string> = { free: "Free", pro: "Pro", enterprise: "Enterprise" };
        setCurrentPlan(tierMap[data.plan_tier] ?? "Pro");
      }
      setSubLoaded(true);
    })();
  }, [subLoaded]);

  const plans = [
    { name: "Free", price: "$0", features: ["1 seat", "100K tokens/mo", "Dev Suite only", "Community support"] },
    { name: "Pro", price: "$49", features: ["5 seats", "500K tokens/mo", "All suites", "Priority support", "Custom integrations"] },
    { name: "Enterprise", price: "$199", features: ["Unlimited seats", "Unlimited tokens", "All suites + API", "Dedicated support", "SSO & SAML", "Custom contracts"] },
  ];

  const handleUpgrade = async (planName: string) => {
    setCurrentPlan(planName);
    if (!isDemoMode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
        if (profile?.org_id) {
          const tierMap: Record<string, string> = { Free: "free", Pro: "pro", Enterprise: "enterprise" };
          const priceMap: Record<string, number> = { Free: 0, Pro: 49, Enterprise: 199 };
          const seatsMap: Record<string, number> = { Free: 1, Pro: 5, Enterprise: 999 };
          await supabase.from("subscriptions").upsert({
            org_id: profile.org_id,
            plan_tier: tierMap[planName],
            price: priceMap[planName],
            seats_total: seatsMap[planName],
            status: "active",
            billing_period: "monthly",
          }, { onConflict: "org_id" });
        }
      }
    }
    logAndNotify({
      activityTitle: `Subscription changed to ${planName}`,
      activityDescription: `Upgraded workspace plan to ${planName}`,
      activityType: "business",
      notificationTitle: "Plan Updated",
      notificationDescription: `Your workspace is now on the ${planName} plan.`,
      notificationType: "success",
      notificationSuite: "system",
    });
    toast.success(`Upgraded to ${planName} plan`);
    setSuccessMsg("Plan updated");
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="space-y-1 border-b border-border/25 pb-3">
        <span className="eyebrow text-signal">PLAN TIER OVERVIEW</span>
        <h2 className="font-display font-bold text-scale-lg text-bone">Subscription Plans</h2>
        <p className="text-xs text-muted-foreground">Compare service capabilities, features, and scale constraints for our plans.</p>
      </div>
      {successMsg && <p className="text-emerald-500 text-[11px] font-medium">{successMsg}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.name === currentPlan;
          return (
            <div
              key={plan.name}
              className={cn(
                "bg-surface/80 dark:bg-surface/40 dark:backdrop-blur-xl border rounded-2xl p-6 space-y-5 transition-all relative overflow-hidden group hover:border-signal/30",
                isCurrent ? "border-signal ring-1 ring-signal/20 card-gradient-bar" : "border-border/40"
              )}
            >
              {isCurrent && (
                <span className="absolute top-3 right-3 eyebrow bg-signal text-white px-2 py-0.5 rounded-pill">CURRENT</span>
              )}
              <div>
                <h3 className="font-display font-bold text-bone text-scale-base">{plan.name}</h3>
                <p className="stat-number text-3xl font-extrabold text-bone mt-1.5">{plan.price}<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
              </div>
              <ul className="space-y-2 text-scale-xs text-muted-foreground">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-signal shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button
                variant={isCurrent ? "outline" : "default"}
                className="w-full text-scale-xs h-9"
                disabled={isCurrent}
                onClick={() => !isCurrent && handleUpgrade(plan.name)}
              >
                {isCurrent ? "Current Plan" : "Upgrade"}
                {!isCurrent && <ArrowUpRight className="w-3.5 h-3.5 ml-1" />}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 11. Activity History — unified timeline
function ActivityHistoryView() {
  const { activities: history, loading } = useRealtimeActivity();

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="space-y-1 border-b border-border/25 pb-3">
        <span className="eyebrow text-signal">SYSTEM AUDIT TRAILS</span>
        <h2 className="font-display font-bold text-scale-lg text-bone">Activity History</h2>
        <p className="text-xs text-muted-foreground">Unified timeline of developer pipeline events, admin config changes, and system alerts.</p>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-8 text-scale-xs">Loading activity...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-3 border border-dashed border-border/20 rounded-xl bg-void/10 animate-in fade-in duration-300">
          <div className="w-10 h-10 rounded-lg bg-signal/10 border border-signal/25 flex items-center justify-center text-signal">
            <History className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-bone">No Activity Logged</p>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              System events and audit logs will automatically populate here as actions occur.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-1">
          {history.slice(0, 20).map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-void/30 transition-colors">
              <div className="w-2 h-2 rounded-full bg-signal mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-scale-xs font-medium text-bone">{item.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {item.user} · {formatTime(item.created_at)}
                </p>
              </div>
              <span className="eyebrow text-muted-foreground capitalize shrink-0">{item.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 12. Workspace Settings — general workspace-level config
function WorkspaceSettingsView() {
  const [wsName, setWsName] = useState("MaVionix Labs");
  const [wsTimezone, setWsTimezone] = useState("UTC");
  const [wsLanguage, setWsLanguage] = useState("en");
  const [wsUrl, setWsUrl] = useState("mavionix-labs");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);
  const [wsLoaded, setWsLoaded] = useState(false);

  // Load workspace settings from organizations table
  React.useEffect(() => {
    if (isDemoMode || wsLoaded) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("organizations").select("name, domain, timezone, language").eq("owner_id", user.id).single();
      if (data) {
        if (data.name) setWsName(data.name);
        if (data.domain) setWsUrl(data.domain);
        if (data.timezone) setWsTimezone(data.timezone);
        if (data.language) setWsLanguage(data.language);
      }
      setWsLoaded(true);
    })();
  }, [wsLoaded]);

  const handleSave = async () => {
    if (!isDemoMode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("organizations").update({
          name: wsName,
          domain: wsUrl,
          timezone: wsTimezone,
          language: wsLanguage,
        }).eq("owner_id", user.id);
      }
    }
    insertActivity({ title: "Workspace settings updated", description: `Workspace: ${wsName}, TZ: ${wsTimezone}`, type: "business" });
    toast.success("Workspace settings saved"); setSuccessMsg("Workspace settings saved successfully");
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    toast.success("Workspace deleted"); setDeleteSuccessMsg("Workspace deleted");
    setTimeout(() => setDeleteSuccessMsg(null), 2000);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto max-w-lg w-full space-y-6">
      <div className="space-y-1 border-b border-border/25 pb-3">
        <span className="eyebrow text-signal">SPACE LOGISTICS</span>
        <h2 className="font-display font-bold text-scale-lg text-bone">Workspace Settings</h2>
        <p className="text-xs text-muted-foreground">Manage workspace name, URLs, localization, and administrative credentials.</p>
      </div>

      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-4">
        <form className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Workspace Name</label>
            <Input value={wsName} onChange={(e) => setWsName(e.target.value)} className="bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Workspace URL Slug</label>
            <Input value={wsUrl} onChange={(e) => setWsUrl(e.target.value)} className="bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Default Timezone</label>
            <select
              value={wsTimezone}
              onChange={(e) => setWsTimezone(e.target.value)}
              className="flex w-full rounded border border-border/40 bg-void/50 text-bone px-2 py-2 h-9 text-scale-xs focus:outline-none focus:ring-1 focus:ring-signal"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="EST">EST (Eastern Standard Time)</option>
              <option value="PST">PST (Pacific Standard Time)</option>
              <option value="CET">CET (Central European Time)</option>
              <option value="JST">JST (Japan Standard Time)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Default Language</label>
            <select
              value={wsLanguage}
              onChange={(e) => setWsLanguage(e.target.value)}
              className="flex w-full rounded border border-border/40 bg-void/50 text-bone px-2 py-2 h-9 text-scale-xs focus:outline-none focus:ring-1 focus:ring-signal"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
            </select>
          </div>
          <Button type="button" onClick={handleSave} className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-9 w-full flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" /> Save Workspace Settings
          </Button>
          {successMsg && <p className="text-emerald-500 text-[11px] font-medium text-center">{successMsg}</p>}
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-surface border border-destructive/30 rounded-xl p-5 shadow-lg space-y-3">
        <h3 className="font-display font-bold text-scale-sm text-destructive">Danger Zone</h3>
        <p className="text-scale-xs text-muted-foreground">
          Deleting this workspace will permanently remove all projects, data, and team member access. This action cannot be undone.
        </p>
        <Button variant="destructive" className="text-scale-xs h-9" onClick={() => setShowDeleteConfirm(true)}>
          Delete Workspace
        </Button>
        {deleteSuccessMsg && <p className="text-emerald-500 text-[11px] font-medium">{deleteSuccessMsg}</p>}
      </div>

      {/* Local delete confirmation dialog — rendered with portal-like fixed positioning */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-surface border border-border/60 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-bone">Are you sure?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This will permanently delete the workspace and all associated data. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                variant="destructive"
                className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
