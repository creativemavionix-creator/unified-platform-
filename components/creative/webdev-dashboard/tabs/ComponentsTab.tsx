import { useState } from 'react';
import { Search, Blocks, Plus } from 'lucide-react';
import { SECTION_LIBRARY } from '../data/siteBuilderMockData';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14]';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const CATEGORIES = ['All', 'Hero', 'CTA', 'Pricing', 'Social Proof', 'Testimonials', 'FAQ', 'Team', 'E-commerce', 'Footer'];

export default function ComponentsTab() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = SECTION_LIBRARY.filter((s) => {
    const matchesQuery = s.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'All' || s.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black">Section & Component Library</h2>
        <p className="text-sm text-slate-400 mt-1">Drag any pre-built, responsive block into your canvas. {SECTION_LIBRARY.length} sections available.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections — e.g. pricing, hero, footer…"
            className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-purple-400 dark:focus:border-purple-600"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11.5px] font-bold whitespace-nowrap transition-colors ${
              category === c
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className={`${card} reveal-up group overflow-hidden`}>
            <div
              className="h-28 flex items-center justify-center relative"
              style={{ background: `linear-gradient(135deg, ${s.accent}22, ${s.accent}08)` }}
            >
              <Blocks size={26} style={{ color: s.accent }} />
              <button className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-all">
                <span className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-wider">
                  <Plus size={13} /> Add to Page
                </span>
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm font-bold truncate">{s.name}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: s.accent }}>{s.category}</span>
                <span className="text-[11px] text-slate-400">{s.uses} uses</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
            <p className="text-sm font-bold text-slate-400">No sections match your search.</p>
          </div>
        )}
      </div>

      <div className={`${card} reveal-up p-5 flex items-center justify-between flex-wrap gap-3`}>
        <div>
          <p className={label}>Most Used Section</p>
          <p className="mt-1 text-sm font-bold">Split Hero with Video — used on 214 pages across all sites</p>
        </div>
        <button className="rounded-full border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-300 text-[11px] font-black uppercase tracking-wider px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors">
          Suggest with AI
        </button>
      </div>
    </div>
  );
}
