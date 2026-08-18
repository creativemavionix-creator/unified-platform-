import React, { useState } from 'react';
import { Download, FileImage, Layers, Link2, Send, CheckSquare, Square } from 'lucide-react';
import { MOCK_GALLERY } from '../imageGeneratorMockData';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const FORMATS = [
  { id: 'png', name: 'PNG', desc: 'Best for sharp edges and transparency' },
  { id: 'jpg', name: 'JPG', desc: 'Smaller file size, best for photos' },
  { id: 'webp', name: 'WEBP', desc: 'Modern format, great compression' },
  { id: 'png-transparent', name: 'Transparent PNG', desc: 'Removes background automatically' },
];

export default function ExportTab() {
  const [selected, setSelected] = useState<string[]>([MOCK_GALLERY[0].id, MOCK_GALLERY[1].id]);
  const [format, setFormat] = useState('png');
  const [highRes, setHighRes] = useState(true);

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className={`${card} reveal-up`}>
        <div className="flex items-center justify-between mb-4">
          <span className={label}>Select images to export</span>
          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-300">{selected.length} selected</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {MOCK_GALLERY.slice(0, 12).map((img) => {
            const active = selected.includes(img.id);
            return (
              <button key={img.id} onClick={() => toggle(img.id)} className="relative aspect-square rounded-xl overflow-hidden">
                <img src={img.url} alt={img.prompt} className={`w-full h-full object-cover transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`} />
                <div className="absolute top-1.5 left-1.5 text-white drop-shadow">
                  {active ? <CheckSquare size={16} className="fill-purple-600/20" /> : <Square size={16} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className={`${card} reveal-up`}>
          <span className={label}>Export Format</span>
          <div className="mt-3 space-y-2">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`w-full text-left rounded-xl border px-3.5 py-2.5 transition-colors ${
                  format === f.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <p className="text-[13px] font-bold">{f.name}</p>
                <p className="text-[11px] text-slate-400">{f.desc}</p>
              </button>
            ))}
          </div>
          <label className="mt-4 flex items-center justify-between text-[12.5px] font-semibold text-slate-600 dark:text-slate-300">
            High Resolution (4K)
            <input type="checkbox" checked={highRes} onChange={() => setHighRes((v) => !v)} className="accent-purple-600 w-4 h-4" />
          </label>
        </div>

        <div className={`${card} reveal-up`}>
          <span className={label}>Actions</span>
          <div className="mt-3 space-y-2">
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-[11px] font-black uppercase tracking-wider text-white" style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}>
              <Download size={14} /> Batch Download ({selected.length})
            </button>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <Link2 size={14} /> Copy Share Link
            </button>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <Send size={14} /> Publish to Project
            </button>
          </div>
        </div>

        <div className={`${card} reveal-up flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center">
            <FileImage size={18} />
          </div>
          <div>
            <p className="text-[12.5px] font-bold">Estimated export size</p>
            <p className="text-[11px] text-slate-400">{(selected.length * (highRes ? 8.4 : 2.1)).toFixed(1)} MB · {format.toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
