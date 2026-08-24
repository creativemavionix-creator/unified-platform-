'use client';

import { useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  Users,
  ShieldCheck,
  Flame,
  Zap,
  Clock,
  CalendarClock,
  TrendingUp,
  ChevronRight,
  Bot,
  UserCheck,
} from 'lucide-react';
import { useCrmStore } from '@/hooks/use-crm-store';
import {
  buildDashboardStats,
  buildFunnel,
  recentAiActivities,
  upcomingFollowups,
} from '@/lib/crm/metrics';

export type CrmTabId = 'dashboard' | 'leads' | 'assistant' | 'workflows' | 'analytics';

interface DashboardTabProps {
  onNavigate: (tab: CrmTabId) => void;
}

const cardStyle =
  'rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0c0c14] p-5 sm:p-6 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm hover:shadow-md';

const labelStyle =
  'text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500';

const priorityStyles: Record<string, { bg: string; text: string }> = {
  high: {
    bg: 'bg-red-500/10 dark:bg-red-500/15',
    text: 'text-red-600 dark:text-red-400',
  },
  medium: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
  },
  low: {
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-600 dark:text-slate-400',
  },
};

export default function DashboardTab({ onNavigate }: DashboardTabProps) {
  const { state } = useCrmStore();
  const { leads, activities, recommendations } = state;

  const statsLive = useMemo(
    () => buildDashboardStats(leads, activities, recommendations),
    [leads, activities, recommendations],
  );
  const funnel = useMemo(() => buildFunnel(leads), [leads]);
  const maxFunnel = Math.max(...funnel.map((f) => f.count), 1);
  const highPriorityLeads = useMemo(
    () => leads.filter((l) => l.priority === 'high').slice(0, 5),
    [leads],
  );
  const todaysAi = useMemo(() => recentAiActivities(activities, 8), [activities]);
  const followups = useMemo(() => upcomingFollowups(leads, 6), [leads]);

  const stats = [
    {
      label: 'Total Leads',
      value: statsLive.totalLeads.toLocaleString(),
      icon: Users,
      trend: `Avg score ${statsLive.avgScore}`,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      label: 'Qualified Leads',
      value: statsLive.qualifiedLeads.toLocaleString(),
      icon: ShieldCheck,
      trend: 'Live pipeline',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'High Priority',
      value: statsLive.highPriorityLeads,
      icon: Flame,
      trend: 'Requires Action',
      color: 'from-amber-500 to-rose-500',
    },
    {
      label: 'AI Actions Logged',
      value: statsLive.todaysAiActivities,
      icon: Zap,
      trend: 'From Ollama + store',
      color: 'from-purple-500 to-violet-500',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0c0c14] p-6 sm:p-8 shadow-sm">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 dark:bg-purple-950/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40">
              <Sparkles size={13} className="animate-pulse" />
              <span>AI SDR Assistant Active</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Your AI SDR logged{' '}
              <span className="text-purple-600 dark:text-purple-400">
                {statsLive.todaysAiActivities} lead activities
              </span>{' '}
              in this workspace.
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {statsLive.pendingRecommendations} recommendations
              </span>{' '}
              need review. Stats, funnel, and activity feed update from live CRM store + Ollama actions.
            </p>
          </div>

          <button
            onClick={() => onNavigate('assistant')}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:-translate-y-0.5"
          >
            Review AI Activity <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={cardStyle}>
              <div className="flex items-center justify-between">
                <span className={labelStyle}>{s.label}</span>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-sm`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{s.value}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                  <TrendingUp size={11} /> {s.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${cardStyle} lg:col-span-2 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-purple-600 dark:text-purple-400" />
                <span className={labelStyle}>Priority AI Recommendations</span>
              </div>
              <button
                onClick={() => onNavigate('assistant')}
                className="text-[12px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">
                  No pending recommendations — refresh from AI Assistant.
                </p>
              ) : (
                recommendations.slice(0, 4).map((r) => {
                  const style = priorityStyles[r.priority] || priorityStyles.low;
                  return (
                    <div
                      key={r.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 p-3.5 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${style.bg} ${style.text}`}
                        >
                          {r.priority}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{r.leadName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{r.message}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigate('assistant')}
                        className="shrink-0 text-xs font-bold text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 px-3 py-1.5 rounded-lg transition-colors text-center"
                      >
                        {r.action}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className={cardStyle}>
          <div className="flex items-center justify-between mb-5">
            <span className={labelStyle}>Conversion Funnel</span>
            <span className="text-[11px] font-medium text-slate-400">Live pipeline</span>
          </div>

          <div className="space-y-4">
            {funnel.map((f) => {
              const percentage = Math.round((f.count / maxFunnel) * 100);
              return (
                <div key={f.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{f.stage}</span>
                    <span className="text-slate-400">
                      <span className="font-bold text-slate-900 dark:text-white">{f.count}</span> ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardStyle}>
          <div className="flex items-center gap-2 mb-5">
            <Clock size={16} className="text-purple-600 dark:text-purple-400" />
            <span className={labelStyle}>Recent Autonomous Activities</span>
          </div>

          <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {todaysAi.length === 0 ? (
              <p className="text-sm text-slate-500">No AI activities yet — draft or re-score a lead.</p>
            ) : (
              todaysAi.map((a) => (
                <div key={a.id} className="relative flex items-start justify-between gap-3 group">
                  <div className="absolute -left-[18.5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#0c0c14] bg-purple-600 dark:bg-purple-400 group-hover:scale-125 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">{a.text}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-slate-400 whitespace-nowrap">{a.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={cardStyle}>
          <div className="flex items-center gap-2 mb-5">
            <CalendarClock size={16} className="text-purple-600 dark:text-purple-400" />
            <span className={labelStyle}>Upcoming Scheduled Follow-ups</span>
          </div>

          <div className="space-y-2">
            {followups.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {f.leadName} <span className="font-normal text-slate-400">({f.company})</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{f.type}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 text-[11px] font-bold text-purple-600 dark:text-purple-300">
                  {f.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cardStyle}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-purple-600 dark:text-purple-400" />
            <span className={labelStyle}>High-Priority Leads Requiring Attention</span>
          </div>
          <button
            onClick={() => onNavigate('leads')}
            className="text-[12px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            View all leads <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {highPriorityLeads.map((l) => (
            <div
              key={l.id}
              className="group rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 p-3.5 hover:border-purple-300 dark:hover:border-purple-800 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: l.avatarColor || '#8b5cf6' }}
                >
                  {l.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {l.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{l.company}</p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lead Score</span>
                <span className="text-xs font-black text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md">
                  {l.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
