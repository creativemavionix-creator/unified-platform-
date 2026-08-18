import React, { useState } from 'react';
import { Search, Star, Download, Copy, Trash2, Share2, Pencil, Filter, Loader2 } from 'lucide-react';
import { useGeneratedImages } from '@/lib/image-generator/generated-images';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

export default function GalleryTab() {
  const { images, loading, error, toggleFavorite } = useGeneratedImages();
  const [search, setSearch] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = images.filter((img) => {
    const matchesSearch = img.prompt.toLowerCase().includes(search.toLowerCase());
    const matchesFav = !onlyFavorites || img.favorite;
    return matchesSearch && matchesFav;
  });

  const activeImage = images.find((i) => i.id === selected);

  if (loading) {
    return (
      <div className={`${card} py-16 flex items-center justify-center gap-2 text-sm text-slate-400`}>
        <Loader2 size={18} className="animate-spin text-purple-500" />
        Loading gallery…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-red-500">{error}</p>}

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

      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
        {filtered.map((img) => (
          <div
            key={img.id}
            onClick={() => setSelected(img.id)}
            className="group relative mb-3 break-inside-avoid rounded-2xl overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-900"
          >
            <img src={img.url} alt={img.prompt} className="w-full object-cover" style={{ aspectRatio: `${img.width}/${img.height}` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 inset-x-0 p-2.5">
                <p className="text-[11px] font-semibold text-white line-clamp-2">{img.prompt}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(img.filename); }}
                    className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-slate-700"
                  >
                    <Star size={11} className={img.favorite ? 'fill-yellow-400 text-yellow-400' : ''} />
                  </button>
                  <a
                    href={img.url}
                    download={img.filename}
                    onClick={(e) => e.stopPropagation()}
                    className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-slate-700"
                  >
                    <Download size={11} />
                  </a>
                  {[Copy, Share2, Pencil, Trash2].map((Icon, i) => (
                    <button key={i} onClick={(e) => e.stopPropagation()} className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-slate-700">
                      <Icon size={11} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {img.favorite && <Star size={14} className="absolute top-2 right-2 fill-yellow-400 text-yellow-400" />}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-sm text-slate-400">
          {images.length === 0 ? 'Generate images in Create to populate your gallery.' : 'No images match your filters.'}
        </div>
      )}

      {activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="max-w-3xl w-full rounded-2xl bg-white dark:bg-[#0c0c14] overflow-hidden grid grid-cols-1 sm:grid-cols-2">
            <img src={activeImage.url} alt={activeImage.prompt} className="w-full h-full object-cover max-h-[70vh]" />
            <div className="p-5 space-y-3">
              <span className={label}>Prompt</span>
              <p className="text-sm">{activeImage.prompt}</p>
              <div className="grid grid-cols-2 gap-3 text-[12px] text-slate-500">
                <p><span className="font-bold text-slate-700 dark:text-slate-200">Operation:</span> {activeImage.operation}</p>
                <p><span className="font-bold text-slate-700 dark:text-slate-200">Size:</span> {activeImage.width}×{activeImage.height}</p>
                <p className="col-span-2"><span className="font-bold text-slate-700 dark:text-slate-200">Created:</span> {new Date(activeImage.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <a
                  href={activeImage.url}
                  download={activeImage.filename}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[11px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
                >
                  <Download size={13} /> Download
                </a>
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
