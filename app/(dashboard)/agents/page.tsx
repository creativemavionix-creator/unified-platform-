"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Star,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GalleryGrid, GalleryItem } from "@/components/shared/GalleryGrid";
import { BuilderShell } from "@/components/shared/BuilderShell";
import { toast } from "sonner";
import { logAndNotify, installAgent, getInstalledAgentIds } from "@/lib/supabase-actions";
import { isDemoMode } from "@/lib/supabase";

const initialAgents: GalleryItem[] = [
  {
    id: "agt-1",
    title: "Synapse Code Copilot",
    category: "Development",
    icon: "💻",
    description: "Autonomously drafts database schemas, designs APIs, and checks TypeScript types for compilation errors.",
    rating: 4.9,
    price: "49",
    featured: true,
    tags: ["copilot", "coding"],
  },
  {
    id: "agt-2",
    title: "Composer Visualizer",
    category: "Creative",
    icon: "🎨",
    description: "Generates multi-frame videos, designs custom brand identity sheets, and builds slider decks.",
    rating: 4.8,
    price: "0",
    featured: false,
    tags: ["creative", "visual"],
  },
  {
    id: "agt-3",
    title: "Telemetry Webhook Broker",
    category: "Automation",
    icon: "⚡",
    description: "Listens for Stripe webhooks and routes automated discord notification event triggers.",
    rating: 4.7,
    price: "19",
    featured: false,
    tags: ["automation", "cron"],
  },
  {
    id: "agt-4",
    title: "Deploy Rollback Auditor",
    category: "Development",
    icon: "🛡️",
    description: "Monitors staging deployment pipelines and triggers automatic rollbacks on telemetry failures.",
    rating: 4.6,
    price: "29",
    featured: false,
    tags: ["ops", "deploy"],
  },
];

export default function AgentMarketplacePage() {
  const [agents] = useState<GalleryItem[]>(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<GalleryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"All" | "Development" | "Creative" | "Automation">("All");
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());

  // Purchase/Install flow modal states
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installStatus, setInstallStatus] = useState<"idle" | "installing" | "success">("idle");

  // Load installed agent IDs on mount
  useEffect(() => {
    if (isDemoMode) return;
    getInstalledAgentIds().then((ids) => setInstalledIds(new Set(ids)));
  }, []);

  const filteredAgents = agents.filter((agent) => {
    // Search query matches
    const matchesSearch =
      agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Category matches
    const matchesCat = activeCategory === "All" || agent.category === activeCategory;

    return matchesSearch && matchesCat;
  });

  const handleAction = (item: GalleryItem, action: string) => {
    if (action === "details") {
      setSelectedAgent(item);
    }
  };

  const handleInstallClick = () => {
    setShowInstallModal(true);
    setInstallStatus("idle");
  };

  const handleConfirmInstall = async () => {
    setInstallStatus("installing");
    await new Promise((resolve) => setTimeout(resolve, 800));
    setInstallStatus("success");
    toast.success(`${selectedAgent?.title} installed successfully`);
    // Write to agent_installations table
    if (selectedAgent) {
      installAgent(selectedAgent.id);
      setInstalledIds((prev) => { const next = new Set(prev); next.add(selectedAgent.id); return next; });
    }
    logAndNotify({
      activityTitle: `Agent installed: ${selectedAgent?.title}`,
      activityDescription: `Installed "${selectedAgent?.title}" (${selectedAgent?.category}) to workspace`,
      activityType: "automation",
      notificationTitle: "Agent Installed",
      notificationDescription: `"${selectedAgent?.title}" is now active in your workspace.`,
      notificationType: "success",
      notificationSuite: "system",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 bg-void">
      {selectedAgent ? (
        /* Agent Details Page */
        <BuilderShell title="Agent Telemetry Profile" accent="signal" isEmpty={false}>
          <div className="flex-grow p-6 overflow-y-auto max-w-4xl mx-auto w-full space-y-6 select-text">
            
            {/* Header / Back CTA */}
            <div className="flex justify-between items-center pb-4 border-b border-border/20">
              <Button
                onClick={() => setSelectedAgent(null)}
                variant="ghost"
                className="text-scale-xs text-signal hover:bg-signal/10 h-8"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Marketplace
              </Button>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                Agent ID: {selectedAgent.id}
              </span>
            </div>

            {/* Profile Hero Block */}
            <div className="bg-surface border border-border/40 rounded-xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-signal/15 border border-signal/25 text-signal flex items-center justify-center font-display text-scale-xl">
                    {selectedAgent.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display font-bold text-bone text-scale-lg">{selectedAgent.title}</h2>
                      {selectedAgent.featured && (
                        <span className="text-[8px] font-mono font-bold tracking-widest bg-pulse text-void px-2 py-0.5 rounded uppercase">
                          featured
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
                      {selectedAgent.category} Suite
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mt-2 sm:mt-0">
                  <span className="text-scale-lg font-mono font-bold text-bone">
                    {selectedAgent.price === "0" ? "FREE" : `$${selectedAgent.price} / mo`}
                  </span>
                </div>
              </div>

              <p className="text-scale-xs text-muted-foreground leading-relaxed pt-2">
                {selectedAgent.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border/10">
                <div className="flex items-center gap-1.5 text-scale-xs text-muted-foreground">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-mono font-semibold text-bone">{selectedAgent.rating?.toFixed(1)}</span>
                  <span>(42 user telemetry integrations)</span>
                </div>

                <Button
                  onClick={handleInstallClick}
                  disabled={!!selectedAgent && installedIds.has(selectedAgent.id)}
                  className={cn(
                    "font-semibold text-scale-xs h-9 px-6 rounded-lg shadow-lg",
                    selectedAgent && installedIds.has(selectedAgent.id)
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-signal hover:bg-signal/90 text-void"
                  )}
                >
                  {selectedAgent && installedIds.has(selectedAgent.id) ? "✓ Installed" : "Install Agent"}
                </Button>
              </div>
            </div>

            {/* Capability Checklist */}
            <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="font-display font-bold text-scale-base text-bone border-b border-border/20 pb-2">
                Operational Capabilities
              </h3>
              <ul className="space-y-3.5 text-scale-xs text-muted-foreground font-sans">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-signal shrink-0 mt-0.5" />
                  <span>Syncs environment context metadata safely to active database instances.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-signal shrink-0 mt-0.5" />
                  <span>Allows auto-trigger webhook integrations linking notifications nodes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-signal shrink-0 mt-0.5" />
                  <span>Monitors visual canvas coordinates for runtime diagnostics tests.</span>
                </li>
              </ul>
            </div>
          </div>
        </BuilderShell>
      ) : (
        /* Agent Listing Catalogue */
        <BuilderShell title="Agent Integration Marketplace" isEmpty={false}>
          <div className="flex-grow p-6 overflow-y-auto space-y-6 flex flex-col">
            
            {/* Filters, search, category pills */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-border/20 pb-4">
              <div className="flex items-center gap-2 bg-void/50 border border-border/40 p-1.5 rounded-lg w-full sm:max-w-xs relative z-10">
                <Search className="w-4 h-4 text-muted-foreground pl-1 shrink-0" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agents..."
                  className="bg-transparent border-0 h-6 p-0 text-scale-xs focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(["All", "Development", "Creative", "Automation"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider border transition-colors",
                      activeCategory === cat
                        ? "bg-signal/10 border-signal text-signal"
                        : "border-border/30 text-muted-foreground hover:text-bone hover:border-border/80"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            {filteredAgents.length === 0 ? (
              /* Empty state for search filters */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/40 rounded-xl py-12 space-y-4">
                <AlertCircle className="w-8 h-8 text-signal bg-signal/10 border border-signal/25 rounded-full p-1.5" />
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-bone text-scale-base">No Agents Matching Filters</h4>
                  <p className="text-scale-xs text-muted-foreground max-w-xs font-sans">
                    We couldn&apos;t find any agent listing matching your current filter settings.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-8 px-4 rounded-lg"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <GalleryGrid
                items={filteredAgents}
                mode="agent"
                accent="signal"
                onItemActionClick={handleAction}
              />
            )}
          </div>
        </BuilderShell>
      )}

      {/* Purchase / Installation Modal Popup */}
      {showInstallModal && selectedAgent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border/60 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            
            {installStatus === "idle" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-signal uppercase tracking-wider">confirm deployment</span>
                  <h3 className="font-display font-bold text-bone text-scale-base">
                    Deploy {selectedAgent.title}?
                  </h3>
                  <p className="text-scale-xs text-muted-foreground leading-relaxed">
                    This will install the agent client telemetry and allocate workspace run slots.
                  </p>
                </div>

                <div className="bg-void/50 border border-border/30 rounded-lg p-3 font-mono text-[10px] text-muted-foreground space-y-1.5">
                  <p><span className="text-bone">Licensing:</span> {selectedAgent.price === "0" ? "Trial Sandbox" : "Commercial Monthly"}</p>
                  <p><span className="text-bone">Cost:</span> {selectedAgent.price === "0" ? "$0" : `$${selectedAgent.price} / mo`}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowInstallModal(false)}
                    className="flex-1 h-10 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmInstall}
                    className="flex-1 h-10 rounded-xl"
                  >
                    Authorize Install
                  </Button>
                </div>
              </div>
            )}

            {installStatus === "installing" && (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <Loader2 className="w-8 h-8 text-signal animate-spin" />
                <div className="text-center space-y-1">
                  <p className="font-display font-semibold text-bone text-scale-xs">Authorizing client gateway...</p>
                  <p className="text-[10px] text-muted-foreground">Mapping environment nodes</p>
                </div>
              </div>
            )}

            {installStatus === "success" && (
              <div className="space-y-5 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-bone text-scale-base">Installation Complete!</h3>
                  <p className="text-scale-xs text-muted-foreground leading-relaxed px-2">
                    {selectedAgent.title} is now successfully deployed and linked to the active workspace.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowInstallModal(false);
                    setSelectedAgent(null);
                  }}
                  className="w-full h-10 rounded-xl"
                >
                  Return to Workspace
                </Button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
