import React, { useState } from 'react';
import { Search, Image as ImageIcon, Shapes, BarChart3, Palette, Star, Upload, Grid3x3 } from 'lucide-react';
import { ASSET_LIBRARY } from '../../../data/presentationMockData';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5 sm:p-6';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const CATEGORIES = [
  { id: 'images', name: 'Images', icon: ImageIcon },
  { id: 'icons', name: 'Icons', icon: Shapes },
  { id: 'charts', name: 'Charts', icon: BarChart3 },
  { id: 'brand', name: 'Brand Assets', icon: Palette },
] as const;

export default function AssetsTab() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('images');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['img2']);

  const toggleFav = (id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  return (
    <div className="space-y-6">
      <div className={`${card} flex flex-col sm:flex-row sm:items-center gap-3`}>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search images, icons, charts, brand assets..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          />
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shrink-0"
          style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
        >
          <Upload size={14} /> Upload
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const active = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                active ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
              }`}
            >
              <Icon size={13} /> {c.name}
            </button>
          );
        })}
      </div>

      {category === 'images' && (
        <div className={card}>
          <div className="flex items-center justify-between mb-4">
            <span className={label}>Image Library</span>
            <Grid3x3 size={15} className="text-slate-400" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ASSET_LIBRARY.images
              .filter((i) => i.id.toLowerCase().includes(search.toLowerCase()) || search === '')
              .map((img) => (
                <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer">
                  <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button
                    onClick={() => toggleFav(img.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center"
                  >
                    <Star size={12} className={favorites.includes(img.id) ? 'fill-yellow-400 text-yellow-400' : 'text-white'} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {category === 'icons' && (
        <div className={card}>
          <span className={label}>Icon Library</span>
          <div className="mt-4 grid grid-cols-4 sm:grid-cols-8 gap-3">
            {ASSET_LIBRARY.icons.map((name) => (
              <button key={name} className="aspect-square rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-1.5 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                <Shapes size={20} className="text-purple-500" />
                <span className="text-[9.5px] font-semibold text-slate-400 truncate px-1">{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {category === 'charts' && (
        <div className={card}>
          <span className={label}>Chart Types</span>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ASSET_LIBRARY.charts.map((name) => (
              <button key={name} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3 hover:border-purple-300 dark:hover:border-purple-700 transition-colors text-left">
                <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                  <BarChart3 size={16} />
                </div>
                <span className="text-[13px] font-bold">{name} Chart</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {category === 'brand' && (
        <div className={card}>
          <span className={label}>Brand Assets</span>
          <div className="mt-4 space-y-2">
            {ASSET_LIBRARY.brandAssets.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                    <Palette size={16} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold">{b.name}</p>
                    <p className="text-[11px] text-slate-400">{b.type}</p>
                  </div>
                </div>
                <button className="text-[11px] font-bold text-purple-600 dark:text-purple-300">Use</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
