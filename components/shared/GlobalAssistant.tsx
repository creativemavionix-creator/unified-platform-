"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles, Send } from "lucide-react";

const contextMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dev": "Dev Suite",
  "/creative": "Creative Suite",
  "/business": "Business Suite",
  "/automation": "Automation Suite",
  "/agents": "Agent Marketplace",
  "/settings": "Settings",
};

const suggestedPrompts = [
  "Build a landing page for my SaaS product",
  "Generate a brand identity kit",
  "Create an automation workflow for new leads",
  "Analyze last quarter's revenue data",
  "Design a mobile app wireframe",
  "Set up CI/CD for my Node.js project",
];

export function GlobalAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const currentContext = Object.entries(contextMap).find(([path]) => pathname.startsWith(path))?.[1] || "Platform";

  const handleSend = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: messageText },
      { role: "assistant", content: `I'll help you with that. Based on your current context in ${currentContext}, I'm analyzing your request: "${messageText}". This is a simulated response — in production, this connects to the MaVionix AI engine.` },
    ]);
    setInput("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Floating trigger button — visible on all authenticated routes */}
      <SheetTrigger asChild>
        <button
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-signal hover:bg-signal-hover text-white flex items-center justify-center shadow-xl shadow-signal/30 transition-all duration-200 widget-pulse group"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </SheetTrigger>

      <SheetContent className="w-[380px] sm:w-[420px] bg-surface border-border/30 p-0 flex flex-col rounded-l-2xl">
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border/30 bg-void/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C026D3] to-[#6366F1] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <SheetTitle className="font-display font-bold text-base text-bone">
                  MaVionix AI
                </SheetTitle>
                <span className="text-xs text-muted-foreground">
                  Context: {currentContext}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="bg-void/50 dark:bg-void/80 border border-border/20 p-4 rounded-2xl text-sm text-muted-foreground leading-relaxed">
                <p className="font-medium text-bone mb-2">Welcome to MaVionix AI</p>
                <p>I can help you build websites, generate creative assets, automate workflows, manage business operations, and more. What would you like to work on?</p>
              </div>

              {/* Suggested prompts */}
              <div className="space-y-2">
                <span className="eyebrow text-muted-foreground">SUGGESTIONS</span>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedPrompts.slice(0, 4).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="text-left text-sm px-3 py-2.5 rounded-xl border border-border/30 bg-void/30 hover:border-signal/40 hover:bg-signal/5 transition-colors text-bone"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-signal text-white rounded-br-md"
                      : "bg-void/50 dark:bg-void/80 border border-border/20 text-bone rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-border/30 bg-void/20">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask AI anything (${currentContext})...`}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
