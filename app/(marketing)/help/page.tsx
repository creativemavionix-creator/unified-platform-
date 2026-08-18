"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalEmptyState } from "@/components/shared/GlobalEmptyState";

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  desc: string;
  readTime: string;
}

const initialArticles: HelpArticle[] = [
  { id: "1", title: "Configure webhook triggers mapping", category: "Integrations", desc: "How to safely point Stripe webhook triggers to active dispatch notification nodes.", readTime: "4 min read" },
  { id: "2", title: "Managing active developer sessions", category: "Security", desc: "Detailed guide on revoking client security tokens in the settings center.", readTime: "3 min read" },
  { id: "3", title: "Allocating pricing token limits", category: "Billing", desc: "Understanding sandbox monthly tokens limits configurations for Pro suites.", readTime: "5 min read" },
  { id: "4", title: "Mapping tables in database designer", category: "Development", desc: "Draggable node canvas basics for drawing database schema relationship lines.", readTime: "6 min read" },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"All" | "Integrations" | "Security" | "Billing" | "Development">("All");

  const categoriesList = ["All", "Integrations", "Security", "Billing", "Development"] as const;

  const filteredArticles = initialArticles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === "All" || art.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="relative min-h-screen bg-void pt-24 pb-16 select-text">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="space-y-4 text-center max-w-xl mx-auto">
          <span className="text-[10px] font-mono text-signal uppercase tracking-widest font-bold">
            support center
          </span>
          <h1 className="font-display font-bold text-bone text-scale-xl sm:text-3xl">
            MaVionix Help Center
          </h1>
          
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-surface border border-border/45 p-2 rounded-lg max-w-md mx-auto relative z-10">
            <Search className="w-4 h-4 text-muted-foreground pl-1 shrink-0" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles..."
              className="bg-transparent border-0 h-6 p-0 text-scale-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-signal"
            />
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Sidebar Nav */}
          <aside className="bg-surface border border-border/40 p-4 rounded-xl space-y-1">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2.5 px-2">
              help categories
            </p>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 rounded-lg text-scale-xs font-semibold text-left transition-colors focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none",
                  activeCategory === cat
                    ? "bg-signal/15 text-signal"
                    : "text-muted-foreground hover:bg-void/40 hover:text-bone"
                )}
              >
                <span>{cat}</span>
              </button>
            ))}
          </aside>

          {/* Articles Content */}
          <div className="md:col-span-3">
            {filteredArticles.length === 0 ? (
              <GlobalEmptyState
                title="No Articles Found"
                description={`We couldn't find any help articles matching "${searchQuery}" under the "${activeCategory}" category.`}
                ctaText="Clear Filters"
                onCtaClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                icon={<AlertCircle className="w-5 h-5 text-signal" />}
                className="bg-surface/50 border border-border/40 rounded-xl"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-signal/50 transition-colors group"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-signal uppercase tracking-wider">
                          {art.category}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-mono">{art.readTime}</span>
                      </div>
                      <h3 className="font-display font-bold text-scale-sm text-bone group-hover:text-signal transition-colors">
                        {art.title}
                      </h3>
                      <p className="text-scale-xs text-muted-foreground leading-normal">{art.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/10 flex justify-end">
                      <Button variant="ghost" className="text-scale-xs h-7 text-bone group-hover:text-signal transition-colors p-0 flex items-center gap-1">
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
