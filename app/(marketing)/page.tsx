"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Terminal, Sparkles, Cpu, Bot, CheckCircle, Zap } from "lucide-react";
import Link from "next/link";

const samplePrompts = [
  "Scaffold a typescript microservices environment with docker support...",
  "Compose a custom soundscape and matching vector graphics for creative asset production...",
  "Orchestrate a webhooks pipeline triggering automated slack reports...",
  "Instruct a pool of cognitive agents to analyze MRR conversion graphs...",
];

export default function MarketingLanding() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(70);

  // Typewriter effect for cycling prompts
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fullText = samplePrompts[promptIndex];

    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
        setTypingSpeed(30);
      }, typingSpeed);
    } else {
      timer = setTimeout(() => {
        setCurrentText((prev) => fullText.slice(0, prev.length + 1));
        setTypingSpeed(60);
      }, typingSpeed);
    }

    if (!isDeleting && currentText === fullText) {
      timer = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setPromptIndex((prev) => (prev + 1) % samplePrompts.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, promptIndex, typingSpeed]);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Hero Section with glow */}
      <section className="hero-glow relative py-24 sm:py-32 lg:py-40 px-4">
        <div className="max-w-6xl mx-auto w-full relative z-10">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text block */}
            <div className="space-y-8">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill border border-signal/25 bg-signal/5 dark:bg-signal/10">
                <Sparkles className="w-3.5 h-3.5 text-signal" />
                <span className="eyebrow text-signal">UNIFIED AI WORKSTATION</span>
              </div>

              {/* Hero headline - heavy weight, uppercase, tight leading */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-bone leading-[1.05] uppercase">
                ORCHESTRATE CODE,{" "}
                <span className="text-gradient">CREATIVE</span>{" "}
                & AUTOMATION IN{" "}
                <span className="text-gradient">ONE SPACE</span>
              </h1>

              {/* Body copy */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
                MaVionix is the cognitive work engine connecting developer setups, creative assets generation, webhooks pipelines, and autonomous AI agents.
              </p>

              {/* Two-tier CTA buttons side by side */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/signup">
                  <Button size="lg" className="group">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Sign In to Workstation
                  </Button>
                </Link>
              </div>

              {/* Stat blocks */}
              <div className="flex flex-wrap gap-4 pt-6">
                <div className="flex flex-col items-center px-5 py-3 rounded-2xl border border-border/40 bg-surface/50 dark:bg-surface/30">
                  <span className="stat-number text-2xl">4.8K+</span>
                  <span className="eyebrow text-muted-foreground mt-1">ACTIVE USERS</span>
                </div>
                <div className="flex flex-col items-center px-5 py-3 rounded-2xl border border-border/40 bg-surface/50 dark:bg-surface/30">
                  <span className="stat-number text-2xl">99.9%</span>
                  <span className="eyebrow text-muted-foreground mt-1">UPTIME</span>
                </div>
                <div className="flex flex-col items-center px-5 py-3 rounded-2xl border border-border/40 bg-surface/50 dark:bg-surface/30">
                  <span className="stat-number text-2xl">50M+</span>
                  <span className="eyebrow text-muted-foreground mt-1">TOKENS/DAY</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive typing element */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Typing AI Search Mockup */}
                <div className="w-full bg-surface border border-border/40 p-2 rounded-2xl shadow-2xl dark:shadow-signal/5 relative group card-glass">
                  <div className="flex items-center gap-3 bg-void/60 dark:bg-void/80 rounded-xl border border-border/30 px-4 h-14 relative overflow-hidden">
                    <Search className="w-5 h-5 text-signal shrink-0" />
                    <div className="flex-1 text-left font-mono text-sm text-bone truncate select-none">
                      {currentText}
                      <span className="w-0.5 h-5 bg-signal inline-block ml-0.5 animate-pulse" />
                    </div>
                    <button className="bg-signal text-white text-xs font-semibold h-8 rounded-pill px-4 transition-opacity opacity-80 group-hover:opacity-100 shadow-md shadow-signal/20">
                      Ask AI
                    </button>
                  </div>

                  {/* Suite indicators below search */}
                  <div className="flex items-center justify-between px-4 py-3 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-signal" />
                      <span>Dev Suite</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-signal" />
                      <span>AI Creative</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-signal" />
                      <span>Automation</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-signal" />
                      <span>Agents</span>
                    </div>
                  </div>
                </div>

                {/* Decorative purple glow behind the card */}
                <div className="absolute -inset-4 -z-10 rounded-3xl bg-signal/5 blur-2xl dark:bg-signal/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-20 px-4 border-t border-border/10">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section eyebrow + headline */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill border border-signal/25 bg-signal/5 dark:bg-signal/10">
              <Zap className="w-3.5 h-3.5 text-signal" />
              <span className="eyebrow text-signal">PLATFORM CAPABILITIES</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-bone uppercase leading-tight">
              EVERYTHING YOU NEED,{" "}
              <span className="text-gradient">UNIFIED</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              From scaffolding microservices to generating creative assets and automating workflows — all in one coordinated platform.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border/40 bg-surface/50 dark:bg-surface/30 dark:backdrop-blur-sm p-6 space-y-4 hover:border-signal/30 transition-colors card-gradient-bar">
              <div className="w-10 h-10 rounded-xl bg-signal/10 border border-signal/20 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-signal" />
              </div>
              <h3 className="font-display font-bold text-lg text-bone">Developer Sandbox</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Instant Node/Python configurations, database structures validator, and real-time logs inspector.
              </p>
              <div className="flex items-center gap-2 text-signal text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>12 integrated tools</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-surface/50 dark:bg-surface/30 dark:backdrop-blur-sm p-6 space-y-4 hover:border-signal/30 transition-colors card-gradient-bar">
              <div className="w-10 h-10 rounded-xl bg-signal/10 border border-signal/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-signal" />
              </div>
              <h3 className="font-display font-bold text-lg text-bone">Creative AI Playground</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Visual asset composer, audio score compositor, and markdown copywriting assistants.
              </p>
              <div className="flex items-center gap-2 text-signal text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>8 creative tools</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-surface/50 dark:bg-surface/30 dark:backdrop-blur-sm p-6 space-y-4 hover:border-signal/30 transition-colors card-gradient-bar">
              <div className="w-10 h-10 rounded-xl bg-signal/10 border border-signal/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-signal" />
              </div>
              <h3 className="font-display font-bold text-lg text-bone">DAG Flow Engine</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Link events, map webhooks listener triggers, and deploy self-healing automated processes.
              </p>
              <div className="flex items-center gap-2 text-signal text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>15 automation nodes</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
