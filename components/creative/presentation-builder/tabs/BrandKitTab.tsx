import React, { useState } from 'react';
import { Palette, Type, Image as ImageIcon, LayoutTemplate, Wand2, Plus } from 'lucide-react';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { addBrandColor, setAccentColor } from '@/lib/presentation-builder/store';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5 sm:p-6';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const CUSTOM_THEMES = [
  { name: 'Founder Mode', hex: '#C800FF' },
  { name: 'Enterprise Clean', hex: '#2563eb' },
  { name: 'Bold Gradient', hex: '#7C3AED' },
  { name: 'Editorial', hex: '#0f172a' },
];

type Props = {
  onUseTemplate?: (name: string) => void;
};

export default function BrandKitTab({ onUseTemplate }: Props) {
  const { state } = usePresentationStore();
  const kit = state.brandKit;
  const [newName, setNewName] = useState('Accent');
  const [newHex, setNewHex] = useState('#22c55e');
  const [toast, setToast] = useState<string | null>(null);

  const applyAccent = (hex: string, themeId?: string) => {
    setAccentColor(hex, themeId);
    setToast(`Accent applied (${hex}). It updates live in Editor — stay here or switch tabs anytime.`);
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ backgroundImage: `linear-gradient(135deg, #2e1065 0%, #4c1d95 55%, ${kit.accentHex} 100%)` }}
      >
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-purple-200">Brand Kit</p>
          <h2 className="mt-2 text-xl sm:text-2xl font-black">Keep every deck consistently on-brand</h2>
          <p className="mt-1 text-sm text-purple-100/80">Active accent: {kit.accentHex}</p>
        </div>
        <button
          type="button"
          onClick={() => applyAccent(kit.accentHex)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-purple-800 hover:-translate-y-0.5 transition-transform"
        >
          <Wand2 size={15} /> Apply accent
        </button>
      </div>

      {toast && <p className="text-[12px] font-semibold text-purple-600 dark:text-purple-300">{toast}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <Palette size={16} className="text-purple-500" />
            <span className={label}>Brand Colors</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {kit.colors.map((c) => (
              <button key={c.hex + c.name} type="button" onClick={() => applyAccent(c.hex)} className="text-center group">
                <div
                  className="w-14 h-14 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ring-offset-2 group-hover:ring-2 ring-purple-400"
                  style={{ backgroundColor: c.hex }}
                />
                <p className="mt-1.5 text-[10.5px] font-semibold text-slate-500">{c.name}</p>
              </button>
            ))}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  addBrandColor(newName || 'Custom', newHex);
                  setToast(`Added ${newName}`);
                }}
                className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400"
              >
                <Plus size={18} />
              </button>
              <input value={newHex} onChange={(e) => setNewHex(e.target.value)} className="w-14 text-[9px] text-center bg-transparent" />
              <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-16 text-[9px] text-center bg-transparent" placeholder="Name" />
            </div>
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <Type size={16} className="text-purple-500" />
            <span className={label}>Fonts</span>
          </div>
          <div className="space-y-3">
            {kit.fonts.map((f) => (
              <div key={f.role} className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{f.role}</p>
                  <p className="text-lg font-bold" style={{ fontFamily: f.family }}>{f.family}</p>
                </div>
                <span className="text-[11px] text-slate-400">Aa Bb Cc</span>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon size={16} className="text-purple-500" />
            <span className={label}>Logos</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {kit.logos.map((l, i) => (
              <div key={i} className="aspect-video rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <img src={`/${l}`} alt="Logo" className="max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <LayoutTemplate size={16} className="text-purple-500" />
            <span className={label}>Company Templates</span>
          </div>
          <div className="space-y-2.5">
            {kit.templates.map((t) => (
              <div key={t} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
                <span className="text-[13px] font-bold">{t}</span>
                <button type="button" onClick={() => onUseTemplate?.(t)} className="text-[11px] font-bold text-purple-600 dark:text-purple-300">Use</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center gap-2 mb-4">
          <Wand2 size={16} className="text-purple-500" />
          <span className={label}>Custom Themes</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CUSTOM_THEMES.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => applyAccent(t.hex, t.name)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-left hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              <div className="aspect-video rounded-lg mb-2" style={{ backgroundImage: `linear-gradient(135deg, ${t.hex} 0%, #7C3AED 100%)` }} />
              <p className="text-[12px] font-bold">{t.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
