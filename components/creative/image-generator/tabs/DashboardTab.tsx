import React, { useState } from 'react';
import { Wand2, Star, FolderKanban, Image as ImageIcon, TrendingUp, ArrowRight } from 'lucide-react';
import {
  RECENT_PROJECTS, MOCK_GALLERY, QUICK_TEMPLATES, AI_SUGGESTIONS, STYLE_LIBRARY, ANALYTICS,
} from '../imageGeneratorMockData';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5 sm:p-6';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

export type ImageTabId = 'dashboard' | 'create' | 'gallery' | 'editor' | 'brandkit' | 'export' | 'history';

export default function DashboardTab({ onNavigate }: { onNavigate: (tab: ImageTabId, prompt?: string) => void }) {
  const [heroPrompt, setHeroPrompt] = useState('');
  const recentCreations = MOCK_GALLERY.slice(0, 6);
  const favorites = MOCK_GALLERY.filter((i) => i.favorite).slice(0, 4);

  const stats = [
    { label: 'Total Generations', value: ANALYTICS.totals.totalGenerations.toLocaleString(), icon: Wand2 },
    { label: 'Downloads', value: ANALYTICS.totals.totalDownloads.toLocaleString(), icon: ImageIcon },
    { label: 'Favorites', value: ANALYTICS.totals.totalFavorites.toLocaleString(), icon: Star },
    { label: 'Active Projects', value: ANALYTICS.totals.activeProjects, icon: FolderKanban },
  ];

  return (
    <div className="space-y-8">
      {/* Hero prompt box */}
      <div className={`${card} reveal-up relative overflow-hidden`}>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-purple-600 dark:text-purple-300">Workspace Overview</p>
        <h2 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">What are we creating today?</h2>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <input
            value={heroPrompt}
            onChange={(e) => setHeroPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="flex-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-5 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          />
          <button
            onClick={() => onNavigate('create', heroPrompt.trim() || undefined)}
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:-translate-y-0.5 transition-transform shrink-0"
            style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)', boxShadow: '0 8px 20px -4px rgba(200,0,255,0.45)' }}
          >
            <Wand2 size={15} />
            Generate
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${card} reveal-up reveal-delay-${Math.min(i + 1, 4)}`}>
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
        <div className={`${card} reveal-up lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <span className={label}>Quick Templates</span>
            <button onClick={() => onNavigate('create')} className="text-[11px] font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => onNavigate('create', t.prompt)}
                className="text-left rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:border-purple-300 dark:hover:border-purple-700 hover:-translate-y-0.5 transition-all"
              >
                <p className="text-[12.5px] font-bold">{t.label}</p>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{t.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className={`${card} reveal-up`}>
          <span className={label}>AI Suggestions</span>
          <div className="mt-4 space-y-3">
            {AI_SUGGESTIONS.slice(0, 4).map((s, i) => (
              <div key={i} className="flex gap-2 text-[12.5px] text-slate-600 dark:text-slate-300">
                <TrendingUp size={14} className="text-purple-500 mt-0.5 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent creations */}
        <div className={`${card} reveal-up lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <span className={label}>Recent Creations</span>
            <button onClick={() => onNavigate('gallery')} className="text-[11px] font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1">
              Open gallery <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {recentCreations.map((img) => (
              <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Featured styles */}
        <div className={`${card} reveal-up`}>
          <span className={label}>Featured Styles</span>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {STYLE_LIBRARY.filter((s) => s.popular).map((s) => (
              <div key={s.id} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={s.thumb} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-x-0 bottom-0 bg-black/50 px-1.5 py-1">
                  <p className="text-[9.5px] font-bold text-white truncate">{s.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent projects */}
        <div className={`${card} reveal-up`}>
          <span className={label}>Recent Projects</span>
          <div className="mt-4 space-y-2.5">
            {RECENT_PROJECTS.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-2.5 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                <img src={p.cover} className="w-11 h-11 rounded-lg object-cover" alt={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-400">{p.imageCount} images · {p.updatedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorites */}
        <div className={`${card} reveal-up`}>
          <span className={label}>Favorites</span>
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            {favorites.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden">
                <img src={img.url} className="w-full h-full object-cover" alt={img.prompt} />
                <Star size={13} className="absolute top-1.5 right-1.5 fill-yellow-400 text-yellow-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
