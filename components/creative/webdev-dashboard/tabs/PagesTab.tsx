import { useState } from 'react';
import {
  Plus, Copy, Trash2, Home, FileText, Search, MoreVertical, ExternalLink,
} from 'lucide-react';
import { PAGES } from '../data/siteBuilderMockData';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14]';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

function seoColor(score: number) {
  if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 70) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

export default function PagesTab() {
  const [query, setQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = PAGES.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.slug.includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">Page Manager</h2>
          <p className="text-sm text-slate-400 mt-1">Add, duplicate, and organize pages for Northline Studio.</p>
        </div>
        <button className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider hover:-translate-y-0.5 transition-transform">
          <Plus size={14} /> New Page
        </button>
      </div>

      <div className={`${card} reveal-up p-4 sm:p-5`}>
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages by name or URL slug…"
            className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-purple-400 dark:focus:border-purple-600"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="pb-2.5 pr-3">Page</th>
                <th className="pb-2.5 pr-3">URL Slug</th>
                <th className="pb-2.5 pr-3">Status</th>
                <th className="pb-2.5 pr-3">SEO Score</th>
                <th className="pb-2.5 pr-3">Last Edited</th>
                <th className="pb-2.5 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 dark:border-slate-900 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 shrink-0 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-300">
                        {p.isHome ? <Home size={14} /> : <FileText size={14} />}
                      </div>
                      <span className="text-sm font-bold">{p.name}</span>
                      {p.isHome && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">Home</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-[13px] text-slate-500 font-mono">{p.slug}</td>
                  <td className="py-3 pr-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      p.status === 'published'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>{p.status}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`text-sm font-black ${seoColor(p.seoScore)}`}>{p.seoScore}</span>
                    <span className="text-[11px] text-slate-400">/100</span>
                  </td>
                  <td className="py-3 pr-3 text-[12.5px] text-slate-400">{p.lastEdited}</td>
                  <td className="py-3 relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <MoreVertical size={15} />
                    </button>
                    {openMenu === p.id && (
                      <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] shadow-xl p-1.5">
                        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900">
                          <ExternalLink size={13} /> Open in Editor
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900">
                          <Copy size={13} /> Duplicate
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                          <Trash2 size={13} /> Delete Page
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className={`${card} reveal-up p-5`}>
          <p className={label}>Total Pages</p>
          <p className="mt-2 text-2xl font-black">{PAGES.length}</p>
        </div>
        <div className={`${card} reveal-up p-5`}>
          <p className={label}>Published</p>
          <p className="mt-2 text-2xl font-black">{PAGES.filter((p) => p.status === 'published').length}</p>
        </div>
        <div className={`${card} reveal-up p-5`}>
          <p className={label}>Avg. SEO Score</p>
          <p className="mt-2 text-2xl font-black">{Math.round(PAGES.reduce((s, p) => s + p.seoScore, 0) / PAGES.length)}</p>
        </div>
      </div>
    </div>
  );
}
