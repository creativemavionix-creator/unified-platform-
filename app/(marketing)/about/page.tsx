"use client";

import { Code, Award, Lightbulb, Users } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
}

export default function AboutPage() {
  const team: TeamMember[] = [
    {
      name: "Alex Mercer",
      role: "Lead Architect",
      bio: "Former compiler engineer dedicated to building low-latency visual layout engines and modular node connections.",
      initials: "AM",
    },
    {
      name: "Sarah Connor",
      role: "Ops Director",
      bio: "Oversees workflow systems operations, cloud telemetry scaling limits, and active session security audits.",
      initials: "SC",
    },
    {
      name: "Marcus Vance",
      role: "Product Principal",
      bio: "Spearheads B2B SaaS template configs wizards, microservices modules, and developer integrations directories.",
      initials: "MV",
    },
  ];

  return (
    <div className="relative min-h-screen py-24 px-4 select-text">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill border border-signal/25 bg-signal/5 dark:bg-signal/10">
            <Users className="w-3.5 h-3.5 text-signal" />
            <span className="eyebrow text-signal">PLATFORM STORY</span>
          </div>
          <h1 className="font-display font-extrabold text-bone text-3xl sm:text-4xl uppercase tracking-tight leading-tight">
            ABOUT{" "}
            <span className="text-gradient">MAVIONIX</span>
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            MaVionix is built by a team of systems developers, designer practitioners, and automations engineers. We unify development, creative arts, and enterprise tools under a single coordinated framework.
          </p>
        </div>

        {/* Company Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: "Visual Primitives", desc: "Grounding interfaces in strict node-canvas architectures for database schemas and cron pipelines.", icon: Code },
            { title: "Utilitarian Calm", desc: "Reducing layout clutter through dense, data-rich list entries and responsive side drawers.", icon: Lightbulb },
            { title: "Telemetry Core", desc: "Ensuring every event dispatch triggers correct state change records with rollback safety.", icon: Award },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border/40 bg-surface/80 dark:bg-surface/40 dark:backdrop-blur-xl p-6 space-y-4 hover:border-signal/30 transition-colors card-gradient-bar"
              >
                <div className="w-10 h-10 rounded-xl bg-signal/10 border border-signal/20 text-signal flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-bone">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Team Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill border border-signal/25 bg-signal/5 dark:bg-signal/10">
              <Users className="w-3.5 h-3.5 text-signal" />
              <span className="eyebrow text-signal">OUR TEAM</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl text-bone uppercase tracking-tight">
              THE WORKSTATION <span className="text-gradient">ARCHITECTS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-border/40 bg-surface/80 dark:bg-surface/40 dark:backdrop-blur-xl p-6 flex flex-col items-center text-center group hover:border-signal/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-signal/10 border border-signal/20 text-signal flex items-center justify-center font-display font-bold text-lg mb-4 group-hover:scale-105 transition-transform duration-300">
                  {member.initials}
                </div>
                <h4 className="font-display font-bold text-bone text-base">{member.name}</h4>
                <span className="eyebrow text-signal mt-1">{member.role}</span>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
