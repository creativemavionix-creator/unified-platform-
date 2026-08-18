"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !msg.trim()) return;

    setStatus("submitting");
    // Simulate 800ms API message buffer dispatch
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatus("success");
  };

  return (
    <div className="relative min-h-screen bg-void pt-24 pb-16 px-4 flex items-center justify-center select-text">
      <div className="bg-surface border border-border/40 p-6 md:p-8 rounded-xl max-w-md w-full space-y-6 shadow-2xl relative z-10 font-sans text-scale-xs text-bone">
        
        {status !== "success" ? (
          <div className="space-y-6">
            <div className="space-y-2 border-b border-border/20 pb-4">
              <span className="text-[10px] font-mono text-signal uppercase tracking-widest font-bold">
                connect gateway
              </span>
              <h1 className="font-display font-bold text-bone text-scale-base sm:text-lg">
                Contact MaVionix support
              </h1>
              <p className="text-scale-xs text-muted-foreground leading-normal">
                Submit details below. The client message will route immediately to our active customer support ticket queue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Your Name</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Email Address</label>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@doe.com"
                  className="bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-signal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Message</label>
                <textarea
                  required
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Describe your resourcing requirements..."
                  className="flex w-full rounded border border-border/40 bg-void/50 text-bone px-3 py-2 text-scale-xs focus:outline-none focus:ring-1 focus:ring-signal h-24"
                />
              </div>

              <Button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-9 rounded-lg flex items-center justify-center gap-1.5 shadow-md"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Ticket...</span>
                  </>
                ) : (
                  <span>Send Message</span>
                )}
              </Button>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-5 py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-bone text-scale-base">Ticket Submitted!</h3>
              <p className="text-scale-xs text-muted-foreground leading-relaxed px-4">
                Message successfully routed to queue. A support operator agent will verify this ticket shortly.
              </p>
            </div>
            <Button
              onClick={() => {
                setName("");
                setEmail("");
                setMsg("");
                setStatus("idle");
              }}
              variant="outline"
              className="border-border/60 hover:bg-void/40 text-bone text-scale-xs h-9 px-6 rounded-lg bg-void/35"
            >
              Send Another Message
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
