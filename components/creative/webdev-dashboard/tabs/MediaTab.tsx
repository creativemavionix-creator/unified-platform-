import { useState } from 'react';
import {
  Search, UploadCloud, Grid3x3, List, Image as ImageIcon, Film, FileText, Shapes, Trash2, CheckSquare, Square,
} from 'lucide-react';
import { MEDIA_ASSETS } from '../data/siteBuilderMockData';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14]';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const TYPE_ICON: Record<string, React.ElementType> = { image: ImageIcon, video: Film, svg: Shapes, document: FileText };
const TYPE_COLOR: Record<string, string> = { image: '#7C3AED', video: '#EA580C', svg: '#0EA5E9', document: '#059669' };

const FOLDERS = ['All', 'Home', 'About', 'Brand', 'Documents', 'Icons', 'Assets'];

export default function MediaTab() {
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = MEDIA_ASSETS.filter(
    (m) => m.name.toLowerCase().includes(query.toLowerCase()) && (folder === 'All' || m.folder === folder),
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">Site Asset & Media Manager</h2>
          <p className="text-sm text-slate-400 mt-1">{MEDIA_ASSETS.length} assets · {MEDIA_ASSETS.filter((m) => !m.used).length} unused</p>
        </div>
        <button className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider hover:-translate-y-0.5 transition-transform">
          <UploadCloud size={14} /> Upload Files
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <aside className={`${card} p-3 lg:w-56 shrink-0 h-fit`}>
          <p className={`${label} px-2 pb-2`}>Folders</p>
          <div className="space-y-1">
            {FOLDERS.map((f) => (
              <button
                key={f}
                onClick={() => setFolder(f)}
                className={`w-full text-left rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
                  folder === f
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/12 dark:text-purple-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 space-y-4 min-w-0">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search assets by filename…"
                className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-purple-400 dark:focus:border-purple-600"
              />
            </div>
            <div className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 p-1 shrink-0">
              <button onClick={() => setView('grid')} className={`w-8 h-8 flex items-center justify-center rounded-full ${view === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>
                <Grid3x3 size={14} />
              </button>
              <button onClick={() => setView('list')} className={`w-8 h-8 flex items-center justify-center rounded-full ${view === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>
                <List size={14} />
              </button>
            </div>
          </div>

          {selected.size > 0 && (
            <div className={`${card} px-4 py-2.5 flex items-center justify-between`}>
              <p className="text-[12.5px] font-bold">{selected.size} selected</p>
              <div className="flex gap-2">
                <button className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-white px-3 py-1.5">Move</button>
                <button className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-rose-500 px-3 py-1.5">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          )}

          {view === 'grid' ? (
            <div className="grid sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((m) => {
                const Icon = TYPE_ICON[m.type];
                const isSel = selected.has(m.id);
                return (
                  <div key={m.id} className={`${card} reveal-up overflow-hidden relative group`}>
                    <button onClick={() => toggle(m.id)} className="absolute top-2 left-2 z-10 text-white drop-shadow">
                      {isSel ? <CheckSquare size={18} className="text-purple-400" /> : <Square size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </button>
                    {!m.used && (
                      <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">Unused</span>
                    )}
                    <div className="h-24 flex items-center justify-center" style={{ backgroundColor: `${TYPE_COLOR[m.type]}14` }}>
                      <Icon size={26} style={{ color: TYPE_COLOR[m.type] }} />
                    </div>
                    <div className="p-3">
                      <p className="text-[12.5px] font-bold truncate">{m.name}</p>
                      <p className="text-[10.5px] text-slate-400 mt-0.5">{m.size} · {m.folder}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`${card} p-2`}>
              {filtered.map((m) => {
                const Icon = TYPE_ICON[m.type];
                const isSel = selected.has(m.id);
                return (
                  <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <button onClick={() => toggle(m.id)}>
                      {isSel ? <CheckSquare size={16} className="text-purple-500" /> : <Square size={16} className="text-slate-300" />}
                    </button>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${TYPE_COLOR[m.type]}14` }}>
                      <Icon size={14} style={{ color: TYPE_COLOR[m.type] }} />
                    </div>
                    <p className="text-[13px] font-semibold flex-1 truncate">{m.name}</p>
                    <span className="text-[11px] text-slate-400 w-20 shrink-0">{m.folder}</span>
                    <span className="text-[11px] text-slate-400 w-16 shrink-0">{m.size}</span>
                    <span className="text-[11px] text-slate-400 w-24 shrink-0 hidden sm:block">{m.addedAt}</span>
                    {!m.used && <span className="text-[9px] font-black uppercase text-amber-500 shrink-0">Unused</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
