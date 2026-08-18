import React, { useState } from 'react';
import { Search, Star, Download, Copy, Trash2, Share2, Pencil, Filter, Play } from 'lucide-react';
import { MOCK_GALLERY, STYLE_CATEGORIES } from '../videoGeneratorMockData';
import VideoThumb from './VideoThumb';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0b14] p-5';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

export default function GalleryTab() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = MOCK_GALLERY.filter((v) => {
    const matchesSearch = v.prompt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || v.style.toLowerCase().includes(category.toLowerCase());
    const matchesFav = !onlyFavorites || v.favorite;
    return matchesSearch && matchesCategory && matchesFav;
  });

  const collections = Array.from(new Set(MOCK_GALLERY.map((v) => v.collection).filter(Boolean)));
  const activeVideo = MOCK_GALLERY.find((v) => v.id === selected);

  return (
    <div className="space-y-5">
      <div className={`${card} reveal-up flex flex-col sm:flex-row sm:items-center gap-3`}>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your gallery..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          />
        </div>
        <button
          onClick={() => setOnlyFavorites((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[12px] font-bold border transition-colors ${
            onlyFavorites ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300' : 'border-slate-200 dark:border-slate-800 text-slate-500'
          }`}
        >
          <Star size={14} className={onlyFavorites ? 'fill-yellow-400 text-yellow-400' : ''} />
          Favorites
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-[12px] font-bold text-slate-500">
          <Filter size={14} /> Filters
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STYLE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
              category === c ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {collections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {collections.map((c) => (
            <span key={c} className="rounded-full border border-slate-200 dark:border-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-500">
              📁 {c}
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((v) => (
          <div key={v.id} onClick={() => setSelected(v.id)} className="group relative cursor-pointer">
            <VideoThumb video={v} className="aspect-video" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
              <div className="absolute bottom-0 inset-x-0 p-2.5">
                <p className="text-[11px] font-semibold text-white line-clamp-2">{v.prompt}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  {[Download, Copy, Share2, Pencil, Trash2].map((Icon, i) => (
                    <button key={i} onClick={(e) => e.stopPropagation()} className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-slate-700">
                      <Icon size={11} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {v.favorite && <Star size={14} className="absolute top-2 right-2 z-10 fill-yellow-400 text-yellow-400" />}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-sm text-slate-400">No videos match your filters.</div>
      )}

      {/* Detail modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="max-w-3xl w-full rounded-2xl bg-white dark:bg-[#0c0c14] overflow-hidden grid grid-cols-1 sm:grid-cols-2">
            <div className="relative bg-black flex items-center justify-center">
              <img src={activeVideo.poster} alt={activeVideo.title} className="w-full h-full object-cover max-h-[70vh]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur flex items-center justify-center">
                  <Play size={22} className="text-white fill-white ml-1" />
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <span className={label}>Prompt</span>
              <p className="text-sm">{activeVideo.prompt}</p>
              <div className="grid grid-cols-2 gap-3 text-[12px] text-slate-500">
                <p><span className="font-bold text-slate-700 dark:text-slate-200">Style:</span> {activeVideo.style}</p>
                <p><span className="font-bold text-slate-700 dark:text-slate-200">Ratio:</span> {activeVideo.ratio}</p>
                <p><span className="font-bold text-slate-700 dark:text-slate-200">Duration:</span> {activeVideo.duration}</p>
                <p><span className="font-bold text-slate-700 dark:text-slate-200">Resolution:</span> {activeVideo.resolution}</p>
                <p><span className="font-bold text-slate-700 dark:text-slate-200">Model:</span> {activeVideo.model}</p>
                <p><span className="font-bold text-slate-700 dark:text-slate-200">Created:</span> {activeVideo.createdAt}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="btn-primary flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[11px] font-black uppercase tracking-wider">
                  <Download size={13} /> Download
                </button>
                <button onClick={() => setSelected(null)} className="rounded-full border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-[11px] font-bold text-slate-500">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
