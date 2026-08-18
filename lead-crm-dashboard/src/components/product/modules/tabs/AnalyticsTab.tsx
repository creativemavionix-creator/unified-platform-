'use client';

import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  Target,
  Clock,
  Percent,
  Download,
  Calendar,
  ArrowUpRight,
  Sparkles,
  BarChart2,
  Layers,
  PieChart,
  Bot,
} from 'lucide-react';
import { useCrmStore } from '@/hooks/use-crm-store';
import {
  buildAiPerformance,
  buildDashboardStats,
  buildFunnel,
  buildGrowthSeries,
  buildLeadSources,
} from '@/lib/crm/metrics';

const card =
  'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5 transition-all duration-200 hover:border-purple-500/30 dark:hover:border-purple-500/30';
const label =
  'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 flex items-center gap-2';

type TimeRange = '7D' | '30D' | '90D' | 'YTD';

export default function AnalyticsTab() {
  const { state } = useCrmStore();
  const { leads, activities, recommendations } = state;

  const [timeRange, setTimeRange] = useState<TimeRange>('30D');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const growthAll = useMemo(() => buildGrowthSeries(leads), [leads]);
  const funnel = useMemo(() => buildFunnel(leads), [leads]);
  const sources = useMemo(() => buildLeadSources(leads), [leads]);
  const stats = useMemo(
    () => buildDashboardStats(leads, activities, recommendations),
    [leads, activities, recommendations],
  );
  const aiPerf = useMemo(
    () => buildAiPerformance(leads, activities, recommendations),
    [leads, activities, recommendations],
  );

  const filteredGrowth = useMemo(() => {
    switch (timeRange) {
      case '7D':
        return growthAll.slice(-3);
      case '30D':
        return growthAll.slice(-6);
      case '90D':
        return growthAll.slice(-9);
      case 'YTD':
      default:
        return growthAll;
    }
  }, [timeRange, growthAll]);

  const maxLeads = useMemo(() => Math.max(...filteredGrowth.map((m) => m.leads), 1), [filteredGrowth]);
  const maxFunnel = useMemo(() => Math.max(...funnel.map((f) => f.count), 1), [funnel]);

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += '--- MONTHLY GROWTH ---\nMonth,Leads\n';
    filteredGrowth.forEach((m) => {
      csvContent += `${m.month},${m.leads}\n`;
    });

    csvContent += '\n--- CONVERSION FUNNEL ---\nStage,Count\n';
    funnel.forEach((f) => {
      csvContent += `${f.stage},${f.count}\n`;
    });

    csvContent += '\n--- LEAD SOURCES ---\nSource,Count,Percentage\n';
    sources.forEach((s) => {
      csvContent += `${s.name},${s.count},${s.pct}%\n`;
    });

    csvContent += '\n--- AI PERFORMANCE ---\nMetric,Value\n';
    csvContent += `Leads Processed,${aiPerf.leadsProcessedAutonomously}\n`;
    csvContent += `Emails Drafted,${aiPerf.emailsDrafted}\n`;
    csvContent += `Call Scripts,${aiPerf.callScriptsGenerated}\n`;
    csvContent += `Approvals Needed,${aiPerf.humanApprovalsNeeded}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Analytics_Report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpiScorecards = [
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: Percent,
      change: 'Won / total',
      isPositive: true,
    },
    {
      label: 'Avg Lead Score',
      value: String(stats.avgScore),
      icon: Clock,
      change: 'Live store',
      isPositive: true,
    },
    {
      label: 'Follow-up Success',
      value: `${aiPerf.followUpSuccessRate}%`,
      icon: Target,
      change: 'Active pipeline',
      isPositive: true,
    },
    {
      label: 'Leads This Month',
      value: (filteredGrowth[filteredGrowth.length - 1]?.leads || 0).toLocaleString(),
      icon: TrendingUp,
      change: `${stats.totalLeads} total`,
      isPositive: true,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-purple-500" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Timeframe:
          </span>
          <div className="flex items-center gap-1 bg-white dark:bg-[#0c0c14] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {(['7D', '30D', '90D', 'YTD'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#0c0c14] border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 text-slate-700 dark:text-slate-200 hover:text-purple-600 transition-all shadow-xs active:scale-95"
        >
          <Download size={14} className="text-purple-500" />
          Export CSV Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiScorecards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${card} reveal-up relative overflow-hidden group`}>
              <div className="flex items-center justify-between">
                <span className={label}>{s.label}</span>
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {s.value}
                </p>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                  <ArrowUpRight size={12} />
                  {s.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${card} reveal-up flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <span className={label}>
                <BarChart2 size={14} className="text-purple-500" />
                Lead Growth & Conversions
              </span>
              {hoveredMonth && (
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-full">
                  {hoveredMonth}: {filteredGrowth.find((m) => m.month === hoveredMonth)?.leads} leads
                </span>
              )}
            </div>

            <div className="mt-8 flex items-end gap-2 sm:gap-3 h-44">
              {filteredGrowth.map((m) => {
                const isHovered = hoveredMonth === m.month;
                const heightPct = (m.leads / maxLeads) * 100;
                return (
                  <div
                    key={m.month}
                    onMouseEnter={() => setHoveredMonth(m.month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-full flex flex-col justify-end h-36 gap-0.5 relative">
                      {isHovered && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 px-2 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold rounded shadow-lg whitespace-nowrap pointer-events-none">
                          {m.leads} leads
                        </div>
                      )}
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isHovered ? 'brightness-125 shadow-lg shadow-purple-500/30 scale-x-105' : 'opacity-90'
                        }`}
                        style={{
                          height: `${heightPct}%`,
                          backgroundImage: 'linear-gradient(180deg, #C800FF 0%, #7C3AED 100%)',
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10.5px] font-bold transition-colors ${
                        isHovered ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'
                      }`}
                    >
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundImage: 'linear-gradient(180deg, #C800FF 0%, #7C3AED 100%)' }}
              />
              <span>Pipeline-weighted monthly view</span>
            </div>
            <span className="font-semibold text-slate-500">Peak: {maxLeads}</span>
          </div>
        </div>

        <div className={`${card} reveal-up flex flex-col justify-between`}>
          <div>
            <span className={label}>
              <Layers size={14} className="text-purple-500" />
              Conversion Funnel
            </span>
            <div className="mt-6 space-y-3.5">
              {funnel.map((f) => {
                const widthPct = (f.count / maxFunnel) * 100;
                return (
                  <div key={f.stage} className="group">
                    <div className="flex items-center justify-between text-[12px] font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {f.stage}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {f.count.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-slate-400">({Math.round(widthPct)}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500 group-hover:brightness-110"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Top-Funnel Volume</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">{maxFunnel.toLocaleString()} Leads</span>
          </div>
        </div>
      </div>

      <div className={`${card} reveal-up`}>
        <div className="flex items-center justify-between mb-4">
          <span className={label}>
            <PieChart size={14} className="text-purple-500" />
            Lead Sources Breakdown
          </span>
          <span className="text-[11px] font-semibold text-slate-400">By Acquisition Channel</span>
        </div>
        <div className="space-y-3.5">
          {sources.map((s) => (
            <div key={s.name} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 group">
              <span className="sm:w-44 sm:shrink-0 text-[12.5px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-purple-500 transition-colors truncate">
                {s.name}
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                <div
                  className="h-full rounded-full bg-purple-600 group-hover:bg-purple-500 transition-all duration-500"
                  style={{ width: `${s.pct}%` }}
                />
              </div>
              <div className="sm:w-28 sm:shrink-0 sm:text-right flex items-center justify-between sm:justify-end gap-2 text-[12px]">
                <span className="font-bold text-slate-900 dark:text-slate-100">{s.count}</span>
                <span className="text-slate-400 font-medium">({s.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${card} reveal-up relative overflow-hidden`}>
        <div className="flex items-center justify-between mb-5">
          <span className={label}>
            <Bot size={14} className="text-purple-500" />
            Autonomous AI Performance
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-full border border-purple-200/50 dark:border-purple-800/50">
            <Sparkles size={12} /> Live from CRM store
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Leads Processed', value: aiPerf.leadsProcessedAutonomously.toLocaleString() },
            { label: 'Emails Drafted', value: aiPerf.emailsDrafted.toLocaleString() },
            { label: 'Call Scripts', value: aiPerf.callScriptsGenerated },
            { label: 'Avg Response', value: aiPerf.avgResponseTime },
            { label: 'Follow-up Rate', value: `${aiPerf.followUpSuccessRate}%` },
            { label: 'Approvals Needed', value: aiPerf.humanApprovalsNeeded },
          ].map((s) => (
            <div
              key={s.label}
              className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 hover:border-purple-500/30 transition-all"
            >
              <p className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-300">{s.value}</p>
              <p className="mt-1 text-[10.5px] font-semibold text-slate-400 line-clamp-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
