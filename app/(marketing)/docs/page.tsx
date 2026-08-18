"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

interface DocTopic {
  id: string;
  title: string;
  category: string;
  content: React.ReactNode;
}

export default function DocumentationPage() {
  const [activeTopic, setActiveTopic] = useState("start");

  const topics: DocTopic[] = [
    {
      id: "start",
      title: "Platform Overview",
      category: "Getting Started",
      content: (
        <div className="space-y-4">
          <p>
            Welcome to the MaVionix platform documentation. MaVionix coordinates developer workspaces, visual asset builders, active webhooks, and agent marketplace listings under a single telemetry instance.
          </p>
          <h3 className="font-display font-bold text-bone text-scale-sm pt-2">System Stack Prerequisites</h3>
          <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
            <li>Node.js version 18.x.x or higher</li>
            <li>Active terminal shell sandbox environment</li>
            <li>Auth token keys for API endpoints ingest</li>
          </ul>
        </div>
      ),
    },
    {
      id: "webhooks",
      title: "Configuring Webhooks",
      category: "Integrations",
      content: (
        <div className="space-y-4">
          <p>
            MaVionix webhooks dispatch real-time events payload buffers directly to configured operational gateways (such as Slack channels). Use this code snippet to bind triggers to ingest parameters:
          </p>
          <div className="bg-surface border border-border/60 rounded-xl p-4 font-mono text-[11px] text-bone leading-relaxed overflow-x-auto select-text">
            <pre>
              <span className="text-pulse">const</span> dispatchWebhook = <span className="text-pulse">async</span> (payload) =&gt; {"{"}
              {"\n"}  <span className="text-pulse">const</span> res = <span className="text-pulse">await</span> fetch(<span className="text-circuit">{"\"https://mavionix.internal/v1/webhook-receiver\""}</span>, {"{"}
              {"\n"}    method: <span className="text-circuit">{"\"POST\""}</span>,
              {"\n"}    headers: {"{"} Authorization: <span className="text-circuit">{"\"Bearer mvx_live_...\""}</span> {"}"},
              {"\n"}    body: JSON.stringify(payload),
              {"\n"}  {"}"});
              {"\n"}  <span className="text-pulse">return</span> res.json();
              {"\n"}{"}"}
            </pre>
          </div>
        </div>
      ),
    },
    {
      id: "database",
      title: "Database Relational Canvas",
      category: "Canvas Utilities",
      content: (
        <div className="space-y-4">
          <p>
            Our visual Database Designer renders table schema grids utilizing a custom React Flow canvas interface. Schema nodes allow:
          </p>
          <ul className="list-decimal list-inside space-y-1.5 text-muted-foreground">
            <li>Primary key binding triggers (represented as 🔑 emoji markers)</li>
            <li>Relation connectors drag-and-drop handles linking fields to parent columns</li>
            <li>Exporting schema mappings as PostgreSQL DDL commands</li>
          </ul>
        </div>
      ),
    },
  ];

  const currentTopic = topics.find((t) => t.id === activeTopic) || topics[0];

  return (
    <div className="relative min-h-screen bg-void pt-24 pb-16 select-text">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          
          {/* Docs Navigation */}
          <aside className="bg-surface border border-border/40 p-4 rounded-xl space-y-4">
            <div className="flex items-center gap-2 px-2 pb-2 border-b border-border/20">
              <BookOpen className="w-4 h-4 text-signal" />
              <span className="font-display font-bold text-bone text-scale-sm">Topics Guide</span>
            </div>
            
            <nav className="space-y-3 text-scale-xs">
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTopic(t.id)}
                  className={cn(
                    "flex flex-col text-left w-full px-2 py-1.5 rounded transition-all focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none",
                    activeTopic === t.id
                      ? "bg-signal/15 text-signal font-semibold"
                      : "text-muted-foreground hover:text-bone hover:bg-void/40"
                  )}
                >
                  <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">
                    {t.category}
                  </span>
                  <span className="mt-0.5 truncate">{t.title}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Doc Content Pane */}
          <article className="md:col-span-3 bg-surface border border-border/40 rounded-xl p-6 md:p-8 space-y-6 shadow-xl text-scale-xs text-muted-foreground leading-relaxed">
            <div className="space-y-1 pb-4 border-b border-border/20">
              <span className="text-[9px] font-mono text-signal uppercase tracking-wider font-bold">
                {currentTopic.category}
              </span>
              <h1 className="font-display font-bold text-bone text-scale-lg sm:text-xl">
                {currentTopic.title}
              </h1>
            </div>

            {currentTopic.content}
          </article>

        </div>
      </div>
    </div>
  );
}
