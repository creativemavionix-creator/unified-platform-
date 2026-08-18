import React, { useState } from 'react';
import { Search, Sparkles, Wand2 } from 'lucide-react';
import { TEMPLATE_LIBRARY, FEATURED_THEMES } from '../presentationMockData';
import { setAccentColor } from '@/lib/presentation-builder/store';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5 sm:p-6';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const THEME_ACCENTS: Record<string, string> = {
  th1: '#C800FF',
  th2: '#64748b',
  th3: '#f59e0b',
  th4: '#0f172a',
  th5: '#ec4899',
  th6: '#2563eb',
};

type TemplateItem = (typeof TEMPLATE_LIBRARY)[number];
type ThemeItem = (typeof FEATURED_THEMES)[number];

type Props = {
  onUseTemplate?: (t: TemplateItem) => void;
  onUseTheme?: (t: ThemeItem) => void;
};

export default function TemplatesTab({ onUseTemplate, onUseTheme }: Props) {
  const categories = ['All', ...Array.from(new Set(TEMPLATE_LIBRARY.map((t) => t.category)))];
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = TEMPLATE_LIBRARY.filter(
    (t) =>
      (activeCategory === 'All' || t.category === activeCategory) &&
      t.name.toLowerCase().includes(query.toLowerCase()),
  );

  const applyTheme = (t: ThemeItem) => {
    setAccentColor(THEME_ACCENTS[t.id] || '#C800FF', t.id);
    onUseTheme?.(t);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className={label}>Featured Themes</p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {FEATURED_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTheme(t)}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              <img src={t.thumb} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {t.popular && (
                <span className="absolute top-1.5 left-1.5 rounded-full bg-purple-600 px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wide text-white">Popular</span>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1.5">
                <p className="text-[10.5px] font-bold text-white truncate">{t.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={card}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <p className={label}>Template Library</p>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 pl-9 pr-4 py-2 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-bold transition-colors ${
                activeCategory === c
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((t) => (
            <div key={t.id} className="group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:-translate-y-0.5 transition-all">
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <img src={t.thumb} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onUseTemplate?.(t)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-black text-purple-700"
                  >
                    <Wand2 size={12} /> Use Template
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[12.5px] font-bold truncate">{t.name}</p>
                <p className="text-[10.5px] text-slate-400">{t.category} · {t.slides} slides</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-10">
              <Sparkles size={20} className="mx-auto text-slate-300" />
              <p className="mt-2 text-[12.5px] text-slate-400">No templates match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
