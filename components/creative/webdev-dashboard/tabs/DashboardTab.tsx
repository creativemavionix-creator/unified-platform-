import {
  Globe, Files, HardDrive, Zap, ArrowRight, Sparkles, ExternalLink, Plus,
} from 'lucide-react';
import {
  SITES, WORKSPACE_STATS, AI_ACTIVITIES, FORM_SUBMISSIONS,
} from '../data/siteBuilderMockData';
import type { TabId } from '../SiteBuilderWorkspace';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const statusStyles: Record<string, string> = {
  live: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  draft: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  building: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
};

export default function DashboardTab({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const storagePct = Math.round((WORKSPACE_STATS.storageUsedGb / WORKSPACE_STATS.storageLimitGb) * 100);
  const bandwidthPct = Math.round((WORKSPACE_STATS.bandwidthUsedGb / WORKSPACE_STATS.bandwidthLimitGb) * 100);

  return (
    <div className="space-y-8">
      <div className="reveal-up rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14]">
        <div className="relative flex flex-col gap-4">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-purple-600 dark:text-purple-300">
            <Sparkles size={13} /> AI Site Generator
          </p>
          <h2 className="text-xl sm:text-2xl font-black max-w-2xl text-slate-900 dark:text-white">
            Describe the site you want to build, and let AI lay out the pages, sections, and copy for you.
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. A landing page for a boutique coffee roastery with an online store"
              className="flex-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-5 py-3 text-sm outline-none focus:border-purple-400 dark:focus:border-purple-600"
            />
            <button className="btn-primary shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-black uppercase tracking-wider hover:-translate-y-0.5 transition-transform">
              Generate Site <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Sites', value: WORKSPACE_STATS.activeSites, icon: Globe },
          { label: 'Total Pages', value: WORKSPACE_STATS.totalPages, icon: Files },
          { label: 'AI Actions Today', value: WORKSPACE_STATS.aiActionsToday, icon: Zap },
          { label: 'Storage Used', value: `${WORKSPACE_STATS.storageUsedGb} GB`, icon: HardDrive },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${card} reveal-up`}>
              <div className="flex items-center justify-between">
                <span className={label}>{s.label}</span>
                <Icon size={16} className="text-purple-500" />
              </div>
              <p className="mt-3 text-2xl font-black">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={`${card} lg:col-span-2 reveal-up`}>
          <div className="flex items-center justify-between mb-4">
            <p className={label}>Your Sites</p>
            <button
              onClick={() => onNavigate('editor')}
              className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-300 hover:underline"
            >
              <Plus size={13} /> Create Site
            </button>
          </div>
          <div className="space-y-2">
            {SITES.map((site) => (
              <button
                key={site.id}
                onClick={() => onNavigate('editor')}
                className="w-full flex items-center gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 hover:border-purple-200 dark:hover:border-purple-800 transition-colors text-left"
              >
                <div
                  className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-white font-black text-sm"
                  style={{ backgroundColor: site.thumbnailColor }}
                >
                  {site.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold truncate">{site.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${statusStyles[site.status]}`}>
                      {site.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <ExternalLink size={10} /> {site.domain} · {site.pages} pages · {site.lastEdited}
                  </p>
                </div>
                <p className="text-xs font-bold text-slate-400 shrink-0">{site.visitors30d.toLocaleString()} visits</p>
              </button>
            ))}
          </div>
        </div>

        <div className={`${card} reveal-up flex flex-col gap-5`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className={label}>Storage</p>
              <p className="text-xs font-bold">{WORKSPACE_STATS.storageUsedGb} / {WORKSPACE_STATS.storageLimitGb} GB</p>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${storagePct}%`, backgroundImage: 'linear-gradient(90deg, #C800FF, #7C3AED)' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className={label}>Bandwidth</p>
              <p className="text-xs font-bold">{WORKSPACE_STATS.bandwidthUsedGb} / {WORKSPACE_STATS.bandwidthLimitGb} GB</p>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${bandwidthPct}%`, backgroundImage: 'linear-gradient(90deg, #0EA5E9, #7C3AED)' }} />
            </div>
          </div>
          <button
            onClick={() => onNavigate('publish')}
            className="mt-1 w-full text-center rounded-full border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-300 text-[11px] font-black uppercase tracking-wider py-2.5 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
          >
            Manage Plan & Usage
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className={`${card} reveal-up`}>
          <p className={`${label} mb-4`}>Recent AI Activity</p>
          <div className="space-y-3">
            {AI_ACTIVITIES.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="mt-0.5 w-7 h-7 shrink-0 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-300">
                  <Sparkles size={13} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold">{a.action}</p>
                  <p className="text-[11.5px] text-slate-400 truncate">{a.detail}</p>
                </div>
                <span className="ml-auto shrink-0 text-[10.5px] text-slate-400">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} reveal-up`}>
          <p className={`${label} mb-4`}>Recent Form Submissions</p>
          <div className="space-y-3">
            {FORM_SUBMISSIONS.map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                <div className="w-8 h-8 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-black text-slate-500">
                  {f.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold truncate">{f.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{f.page}</p>
                </div>
                <span className="shrink-0 text-[10.5px] text-slate-400">{f.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
