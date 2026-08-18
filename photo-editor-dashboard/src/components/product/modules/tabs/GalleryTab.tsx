import { Download, Search, Star } from 'lucide-react';
import { useState } from 'react';
import { useGeneratedImages } from '../../../../lib/generated-images';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5';

export default function GalleryTab() {
  const { images, loading, error, toggleFavorite } = useGeneratedImages();
  const [search, setSearch] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const filtered = images.filter((image) => image.prompt.toLowerCase().includes(search.toLowerCase()) && (!onlyFavorites || image.favorite));
  const download = (url: string, filename: string) => { const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); };

  return <div className="space-y-5">
    <div className={`${card} flex flex-col gap-3 sm:flex-row`}><div className="relative flex-1"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search generated images..." className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm" /></div><button onClick={() => setOnlyFavorites((value) => !value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold dark:border-slate-800"><Star size={14} className="mr-1 inline" />Favorites</button></div>
    {error && <p className="text-sm text-red-500">{error}</p>}
    {loading ? <p className="py-16 text-center text-sm text-slate-400">Loading generated images…</p> : filtered.length === 0 ? <p className="py-16 text-center text-sm text-slate-400">Generate an image to start your gallery.</p> : <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">{filtered.map((image) => <div key={image.id} className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900"><img src={image.url} alt={image.prompt} className="w-full" /><div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/65 p-2 text-white"><p className="line-clamp-1 text-xs">{image.prompt || image.operation}</p><div className="flex gap-1"><button onClick={() => toggleFavorite(image.filename)}><Star size={15} className={image.favorite ? 'fill-yellow-400 text-yellow-400' : ''} /></button><button onClick={() => download(image.url, image.filename)}><Download size={15} /></button></div></div></div>)}</div>}
  </div>;
}
