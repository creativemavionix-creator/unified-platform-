import React from 'react';
import { Wand2, Star, FolderKanban, Layers, TrendingUp, ArrowRight, Bell, Activity } from 'lucide-react';
import {
  RECENT_PRESENTATIONS, QUICK_TEMPLATES, FEATURED_THEMES, AI_SUGGESTIONS,
  ANALYTICS, NOTIFICATIONS, RECENT_ACTIVITY,
} from '../../../data/presentationMockData';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5 sm:p-6';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

export default function DashboardTab({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const favorites = RECENT_PRESENTATIONS.filter((p) => p.favorite);

  const stats = [
    { label: 'Presentations', value: ANALYTICS.totals.totalPresentations, icon: FolderKanban },
    { label: 'Slides Generated', value: ANALYTICS.totals.totalSlidesGenerated.toLocaleString(), icon: Layers },
    { label: 'Exports', value: ANALYTICS.totals.totalExports, icon: TrendingUp },
    { label: 'Collaborators', value: ANALYTICS.totals.activeCollaborators, icon: Star },
  ];

  return (
    <div className="space-y-8">
      {/* Hero prompt box */}
      <div className={`${card} relative overflow-hidden`}>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-purple-600 dark:text-purple-300">Workspace Overview</p>
        <h2 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">What are we presenting today?</h2>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <input
            placeholder="Describe your presentation, paste a topic, or drop in notes..."
            className="flex-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-5 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          />
          <button
            onClick={() => onNavigate('create')}
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:-translate-y-0.5 transition-transform shrink-0"
            style={{ backgroundColor: '#6d28d9' }}
          >
            <Wand2 size={15} />
            Generate
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={card}>
              <div className="flex items-center justify-between">
                <span className={label}>{s.label}</span>
                <Icon size={16} className="text-purple-500" />
              </div>
              <p className="mt-3 text-2xl font-black">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick templates */}
        <div className={`${card} lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <span className={label}>Quick Templates</span>
            <button onClick={() => onNavigate('templates')} className="text-[11px] font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => onNavigate('create')}
                className="text-left rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:border-purple-300 dark:hover:border-purple-700 hover:-translate-y-0.5 transition-all"
              >
                <p className="text-[12.5px] font-bold">{t.label}</p>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{t.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className={card}>
          <span className={label}>AI Suggestions</span>
          <div className="mt-4 space-y-3">
            {AI_SUGGESTIONS.map((s, i) => (
              <div key={i} className="flex gap-2 text-[12.5px] text-slate-600 dark:text-slate-300">
                <TrendingUp size={14} className="text-purple-500 mt-0.5 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent presentations */}
        <div className={`${card} lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <span className={label}>Recent Presentations</span>
            <button onClick={() => onNavigate('editor')} className="text-[11px] font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1">
              Open library <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {RECENT_PRESENTATIONS.slice(0, 6).map((p) => (
              <button key={p.id} onClick={() => onNavigate('editor')} className="text-left rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:-translate-y-0.5 transition-all">
                <div className="aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <img src={p.cover} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5">
                  <p className="text-[12px] font-bold truncate">{p.title}</p>
                  <p className="text-[10.5px] text-slate-400">{p.slideCount} slides · {p.updatedAt}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Featured themes */}
        <div className={card}>
          <span className={label}>Featured Themes</span>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {FEATURED_THEMES.filter((t) => t.popular).map((t) => (
              <div key={t.id} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={t.thumb} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-x-0 bottom-0 bg-black/50 px-1.5 py-1">
                  <p className="text-[9.5px] font-bold text-white truncate">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Favorites */}
        <div className={card}>
          <span className={label}>Favorite Presentations</span>
          <div className="mt-4 space-y-2.5">
            {favorites.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-2.5 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                <img src={p.cover} className="w-11 h-11 rounded-lg object-cover" alt={p.title} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold truncate">{p.title}</p>
                  <p className="text-[11px] text-slate-400">{p.slideCount} slides · {p.updatedAt}</p>
                </div>
                <Star size={14} className="fill-yellow-400 text-yellow-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className={card}>
          <div className="flex items-center gap-2 mb-1">
            <Bell size={14} className="text-purple-500" />
            <span className={label}>Notifications</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {NOTIFICATIONS.map((n) => (
              <div key={n.id} className="flex items-start gap-2">
                {n.unread && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-600 shrink-0" />}
                <div className={n.unread ? '' : 'pl-3.5'}>
                  <p className="text-[12px] text-slate-600 dark:text-slate-300">{n.text}</p>
                  <p className="text-[10.5px] text-slate-400">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className={card}>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-purple-500" />
            <span className={label}>Recent Activity</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {RECENT_ACTIVITY.map((a) => (
              <div key={a.id}>
                <p className="text-[12px] text-slate-600 dark:text-slate-300">{a.text}</p>
                <p className="text-[10.5px] text-slate-400">{a.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
