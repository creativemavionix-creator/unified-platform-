import { useState } from 'react';
import { Copy, Moon, Sun, UploadCloud, Wand2, Image as ImageIcon } from 'lucide-react';
import {
  TYPOGRAPHY_SCALE, SPACING_SCALE, RADIUS_SCALE, BUTTON_STYLES,
  BRAND_COLORS, BRAND_LOGOS, BRAND_FONTS, BRAND_ASSETS,
} from '../data/siteBuilderMockData';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const SUB_TABS = ['Global Styles', 'Brand Kit'] as const;

export default function ThemeTab() {
  const [sub, setSub] = useState<typeof SUB_TABS[number]>('Global Styles');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">Style & Theme Editor</h2>
          <p className="text-sm text-slate-400 mt-1">Global design tokens applied across every page on this site.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-300 text-[11px] font-black uppercase tracking-wider px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors">
          <Wand2 size={13} /> Generate Palette with AI
        </button>
      </div>

      <div className="flex gap-2">
        {SUB_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setSub(t)}
            className={`rounded-full px-4 py-2 text-[12px] font-bold transition-colors ${
              sub === t ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {sub === 'Global Styles' ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className={`${card} reveal-up`}>
            <p className={`${label} mb-4`}>Typography Scale</p>
            <div className="space-y-3">
              {TYPOGRAPHY_SCALE.map((t) => (
                <div key={t.tag} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900 pb-2.5 last:border-0 last:pb-0">
                  <span style={{ fontSize: `min(${t.size}, 22px)`, fontWeight: t.weight as any }} className="truncate">{t.tag}</span>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">{t.size} / {t.weight} / {t.lineHeight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} reveal-up`}>
            <p className={`${label} mb-4`}>Color Variables</p>
            <div className="grid grid-cols-2 gap-3">
              {BRAND_COLORS.map((c) => (
                <div key={c.id} className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 p-2.5">
                  <div className="w-9 h-9 rounded-lg shrink-0 border border-black/5" style={{ backgroundColor: c.hex }} />
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold truncate">{c.label}</p>
                    <p className="text-[10.5px] text-slate-400 font-mono">{c.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} reveal-up`}>
            <p className={`${label} mb-4`}>Spacing System</p>
            <div className="space-y-2.5">
              {SPACING_SCALE.map((s) => (
                <div key={s.token} className="flex items-center gap-3">
                  <span className="text-[11.5px] font-bold w-10 shrink-0">{s.token}</span>
                  <div className="h-2 rounded-full bg-purple-500/70" style={{ width: s.value }} />
                  <span className="text-[11px] text-slate-400 font-mono ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} reveal-up`}>
            <p className={`${label} mb-4`}>Border Radius & Buttons</p>
            <div className="flex flex-wrap gap-2.5 mb-5">
              {RADIUS_SCALE.map((r) => (
                <div key={r.token} className="flex flex-col items-center gap-1.5">
                  <div className="w-11 h-11 bg-purple-100 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-800" style={{ borderRadius: r.value }} />
                  <span className="text-[10px] text-slate-400 font-mono">{r.token}</span>
                </div>
              ))}
            </div>
            <p className={`${label} mb-3`}>Button Styles</p>
            <div className="flex flex-wrap gap-2">
              {BUTTON_STYLES.map((b, i) => (
                <button
                  key={b}
                  className={`px-4 py-2 rounded-full text-[12px] font-bold ${
                    i === 0
                      ? 'btn-primary'
                      : i === 1
                      ? 'bg-slate-800 text-white dark:bg-slate-700'
                      : i === 2
                      ? 'border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                      : 'text-purple-600 dark:text-purple-300'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className={`${card} reveal-up lg:col-span-2 flex items-center justify-between flex-wrap gap-4`}>
            <div>
              <p className={label}>Appearance Mode</p>
              <p className="mt-1 text-sm font-bold">Preview global styles in light or dark mode</p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 p-1">
              <button onClick={() => setPreviewMode('light')} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11.5px] font-bold ${previewMode === 'light' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>
                <Sun size={13} /> Light
              </button>
              <button onClick={() => setPreviewMode('dark')} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11.5px] font-bold ${previewMode === 'dark' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>
                <Moon size={13} /> Dark
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className={`${card} reveal-up`}>
            <div className="flex items-center justify-between mb-4">
              <p className={label}>Brand Colors</p>
            </div>
            <div className="space-y-2">
              {BRAND_COLORS.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-2.5">
                  <div className="w-8 h-8 rounded-lg shrink-0 border border-black/5" style={{ backgroundColor: c.hex }} />
                  <p className="text-[12.5px] font-bold flex-1">{c.label}</p>
                  <button className="flex items-center gap-1 text-[11px] text-slate-400 font-mono hover:text-purple-500">
                    {c.hex} <Copy size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} reveal-up`}>
            <p className={`${label} mb-4`}>Logos</p>
            <div className="space-y-2.5">
              {BRAND_LOGOS.map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                  <div className="w-11 h-11 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0">
                    <ImageIcon size={16} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-bold truncate">{l.label}</p>
                    <p className="text-[10.5px] text-slate-400">{l.kind}</p>
                  </div>
                  <button className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-300">Replace</button>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-3 text-[12px] font-bold text-slate-400 hover:border-purple-300 hover:text-purple-500 transition-colors">
                <UploadCloud size={14} /> Upload New Logo
              </button>
            </div>
          </div>

          <div className={`${card} reveal-up`}>
            <p className={`${label} mb-4`}>Brand Typography</p>
            <div className="space-y-3">
              {BRAND_FONTS.map((f) => (
                <div key={f.id} className="rounded-xl border border-slate-100 dark:border-slate-800 p-3.5">
                  <p className="text-[10.5px] font-black uppercase tracking-wider text-purple-500">{f.label}</p>
                  <p className="text-lg font-black mt-1">{f.name}</p>
                  <p className="text-[11px] text-slate-400">Weights {f.weight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} reveal-up`}>
            <p className={`${label} mb-4`}>Brand Assets</p>
            <div className="grid grid-cols-3 gap-2.5">
              {BRAND_ASSETS.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 text-center">
                  <div className="w-full h-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-500/15 dark:to-purple-500/5 mb-2" />
                  <p className="text-[10.5px] font-bold truncate">{a.name}</p>
                  <p className="text-[9.5px] text-slate-400">{a.type}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} reveal-up lg:col-span-2 flex items-center justify-between flex-wrap gap-4`}>
            <div>
              <p className={label}>Auto-Brand Application</p>
              <p className="mt-1 text-sm font-bold">Apply this brand kit instantly to any new template</p>
            </div>
            <button className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider hover:-translate-y-0.5 transition-transform">
              <Wand2 size={14} /> Apply Brand Kit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
