import { useState } from 'react';
import {
  Monitor, Laptop, Tablet, Smartphone, Undo2, Redo2, Eye, Code2, Sparkles,
  Search, ChevronDown, ChevronRight, Save, UploadCloud, Plus, Layers as LayersIcon,
  Type, Image as ImageIcon, Square, MousePointer2, LayoutGrid,
} from 'lucide-react';
import { DOM_TREE, EDITOR_COMPONENT_PALETTE, HISTORY_STACK, CODE_VIEW_SNIPPET } from '../data/siteBuilderMockData';
import type { LayerNode } from '../data/siteBuilderMockData';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14]';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

type Device = 'desktop' | 'laptop' | 'tablet' | 'mobile';

const DEVICES: { id: Device; icon: React.ElementType; width: string }[] = [
  { id: 'desktop', icon: Monitor, width: '100%' },
  { id: 'laptop', icon: Laptop, width: '980px' },
  { id: 'tablet', icon: Tablet, width: '720px' },
  { id: 'mobile', icon: Smartphone, width: '380px' },
];

const iconFor: Record<string, React.ElementType> = {
  section: LayoutGrid, element: MousePointer2, text: Type, image: ImageIcon, card: Square,
};

function LayerRow({ node, depth = 0 }: { node: LayerNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = !!node.children?.length;
  const Icon = iconFor[node.type] ?? Square;
  return (
    <div>
      <button
        onClick={() => hasChildren && setOpen((v) => !v)}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className="w-full flex items-center gap-1.5 rounded-lg py-1.5 pr-2 text-left text-[12.5px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/70"
      >
        {hasChildren ? (
          open ? <ChevronDown size={12} className="shrink-0 text-slate-400" /> : <ChevronRight size={12} className="shrink-0 text-slate-400" />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <Icon size={13} className="shrink-0 text-purple-500" />
        <span className="truncate">{node.name}</span>
      </button>
      {hasChildren && open && node.children!.map((c) => <LayerRow key={c.id} node={c} depth={depth + 1} />)}
    </div>
  );
}

export default function EditorTab() {
  const [device, setDevice] = useState<Device>('desktop');
  const [previewMode, setPreviewMode] = useState(false);
  const [codeView, setCodeView] = useState(false);
  const [rightPanel, setRightPanel] = useState<'ai' | 'history'>('ai');
  const [paletteQuery, setPaletteQuery] = useState('');
  const [selected, setSelected] = useState('Hero Section');

  const filteredPalette = EDITOR_COMPONENT_PALETTE.filter((c) =>
    c.name.toLowerCase().includes(paletteQuery.toLowerCase())
  );
  const groupedPalette = filteredPalette.reduce<Record<string, typeof EDITOR_COMPONENT_PALETTE>>((acc, c) => {
    acc[c.category] = acc[c.category] || [];
    acc[c.category].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className={`${card} reveal-up flex flex-wrap items-center gap-3 px-4 py-3`}>
        <div className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 p-1">
          <button className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Undo">
            <Undo2 size={15} />
          </button>
          <button className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Redo">
            <Redo2 size={15} />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 p-1 mx-auto">
          {DEVICES.map((d) => {
            const Icon = d.icon;
            const active = device === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDevice(d.id)}
                className={`p-1.5 rounded-full transition-colors ${active ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title={d.id}
              >
                <Icon size={15} />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setCodeView((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border transition-colors ${
              codeView ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Code2 size={13} /> Code
          </button>
          <button
            onClick={() => setPreviewMode((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border transition-colors ${
              previewMode ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Eye size={13} /> Preview
          </button>
          <button className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Save size={13} /> Save
          </button>
          <button className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-wider hover:-translate-y-0.5 transition-transform">
            <UploadCloud size={13} /> Publish
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${previewMode ? '' : 'lg:grid-cols-[220px_1fr_300px]'}`}>
        {/* Left: component palette + layers */}
        {!previewMode && (
          <div className="hidden lg:flex flex-col gap-4">
            <div className={`${card} reveal-up p-3.5`}>
              <p className={`${label} mb-2.5 px-1`}>Add Component</p>
              <div className="relative mb-2.5">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={paletteQuery}
                  onChange={(e) => setPaletteQuery(e.target.value)}
                  placeholder="Search blocks..."
                  className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-3 py-1.5 text-[12px] outline-none focus:border-purple-400"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                {Object.entries(groupedPalette).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="px-1 mb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">{cat}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {items.map((c) => (
                        <button
                          key={c.id}
                          draggable
                          className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 px-2 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-300 cursor-grab active:cursor-grabbing text-center truncate"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${card} reveal-up p-3.5 flex-1 min-h-0`}>
              <p className={`${label} mb-2 px-1 flex items-center gap-1.5`}><LayersIcon size={12} /> Layers</p>
              <div className="max-h-72 overflow-y-auto">
                {DOM_TREE.map((n) => <LayerRow key={n.id} node={n} />)}
              </div>
            </div>
          </div>
        )}

        {/* Center: canvas */}
        <div className={`${card} reveal-up p-4 sm:p-6 flex flex-col items-center ${previewMode ? '' : 'min-h-[560px]'}`}>
          {!previewMode && (
            <div className="w-full flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-slate-400">Editing: <span className="text-slate-700 dark:text-slate-200">Home</span></p>
              <p className="text-[11px] text-slate-400 capitalize">{device} view</p>
            </div>
          )}
          {codeView ? (
            <pre className="w-full max-w-2xl rounded-2xl bg-slate-950 text-emerald-300 text-[12px] leading-relaxed p-5 overflow-x-auto">
              <code>{CODE_VIEW_SNIPPET}</code>
            </pre>
          ) : (
            <div
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#07070f] overflow-hidden transition-all duration-300 mx-auto"
              style={{ maxWidth: DEVICES.find((d) => d.id === device)?.width }}
            >
              {/* Fake navbar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14]">
                <div className="w-20 h-4 rounded bg-purple-200 dark:bg-purple-900" />
                <div className="hidden sm:flex gap-3">
                  <div className="w-10 h-2.5 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="w-10 h-2.5 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="w-10 h-2.5 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="w-16 h-6 rounded-full" style={{ backgroundImage: 'linear-gradient(135deg, #C800FF, #7C3AED)' }} />
              </div>
              {/* Fake hero */}
              <button
                onClick={() => setSelected('Hero Section')}
                className={`w-full text-left px-4 sm:px-10 py-10 sm:py-16 relative ${selected === 'Hero Section' && !previewMode ? 'ring-2 ring-inset ring-purple-500' : ''}`}
              >
                {selected === 'Hero Section' && !previewMode && (
                  <span className="absolute top-2 left-2 rounded-full bg-purple-600 text-white text-[9px] font-black uppercase px-2 py-0.5">Hero Section</span>
                )}
                <div className="max-w-md space-y-3">
                  <div className="h-8 w-4/5 rounded bg-slate-300 dark:bg-slate-700" />
                  <div className="h-4 w-3/5 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 w-24 rounded-full" style={{ backgroundImage: 'linear-gradient(135deg, #C800FF, #7C3AED)' }} />
                    <div className="h-8 w-24 rounded-full border border-slate-300 dark:border-slate-700" />
                  </div>
                </div>
              </button>
              {/* Fake features grid */}
              <button
                onClick={() => setSelected('Features Grid')}
                className={`w-full text-left px-4 sm:px-10 py-8 sm:py-12 border-t border-slate-200 dark:border-slate-800 ${selected === 'Features Grid' && !previewMode ? 'ring-2 ring-inset ring-purple-500' : ''}`}
              >
                {selected === 'Features Grid' && !previewMode && (
                  <span className="inline-block rounded-full bg-purple-600 text-white text-[9px] font-black uppercase px-2 py-0.5 mb-3">Features Grid</span>
                )}
                <div className={`grid gap-3 ${device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/15" />
                      <div className="h-3 w-3/4 rounded bg-slate-300 dark:bg-slate-700" />
                      <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="h-2 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  ))}
                </div>
              </button>
              {/* Fake footer */}
              <div className="px-4 sm:px-10 py-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="w-24 h-2.5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: AI assistant / history */}
        {!previewMode && (
          <div className={`${card} reveal-up p-4 hidden lg:flex flex-col`}>
            <div className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 p-1 mb-4 self-start">
              <button
                onClick={() => setRightPanel('ai')}
                className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition-colors ${rightPanel === 'ai' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}
              >
                AI
              </button>
              <button
                onClick={() => setRightPanel('history')}
                className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition-colors ${rightPanel === 'history' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}
              >
                History
              </button>
            </div>

            {rightPanel === 'ai' ? (
              <div className="space-y-3">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-300">
                  <Sparkles size={13} /> Layout Assistant
                </p>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
                  Selected: <span className="font-bold text-slate-700 dark:text-slate-200">{selected}</span>
                </p>
                <textarea
                  rows={3}
                  placeholder="e.g. Make this hero more minimal and center-aligned"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-[12.5px] outline-none focus:border-purple-400 resize-none"
                />
                <button className="btn-primary w-full rounded-full py-2 text-[11px] font-black uppercase tracking-wider hover:-translate-y-0.5 transition-transform">
                  Apply Suggestion
                </button>
                <div className="pt-2 space-y-2">
                  {['Suggest a stronger headline', 'Add a testimonial section here', 'Improve mobile spacing'].map((s) => (
                    <button key={s} className="w-full text-left rounded-xl border border-slate-100 dark:border-slate-800 px-3 py-2 text-[12px] text-slate-500 dark:text-slate-400 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {HISTORY_STACK.map((h, i) => (
                  <div key={h.id} className={`flex items-start gap-2.5 rounded-xl px-2 py-2 ${i === 0 ? 'bg-purple-50 dark:bg-purple-500/10' : ''}`}>
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-200 truncate">{h.label}</p>
                      <p className="text-[10.5px] text-slate-400">{h.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!previewMode && (
        <button className="lg:hidden w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-500">
          <Plus size={13} /> Open component & layers panel on a larger screen
        </button>
      )}
    </div>
  );
}
