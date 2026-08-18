import React, { useState, useEffect } from 'react';
import {
  Type, Image as ImageIcon, PieChart, Shapes, Table2, Video, Smile as IconLucide,
  LayoutGrid, MessageSquare, History, StickyNote, Plus, ChevronLeft, ChevronRight,
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Download, Loader2,
} from 'lucide-react';
import { ACTIVE_DECK_SLIDES, COMMENTS, VERSION_HISTORY, type Slide } from '../../../data/presentationMockData';
import SlideCanvas from '../SlideCanvas';
import { downloadPresentationPptx } from '../../../lib/export-pptx';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14]';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const TOOLS = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'icon', label: 'Icons', icon: IconLucide },
  { id: 'chart', label: 'Charts', icon: PieChart },
  { id: 'table', label: 'Tables', icon: Table2 },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'shape', label: 'Shapes', icon: Shapes },
  { id: 'layout', label: 'Layouts', icon: LayoutGrid },
];

type SidePanel = 'notes' | 'comments' | 'history';

function sanitizeNotes(notes: string | undefined): string {
  const text = (notes || '').trim();
  if (!text || /^(true|false|none|null)$/i.test(text)) return '';
  return text;
}

export default function EditorTab({ initialSlides }: { initialSlides?: Slide[] }) {
  const [slides, setSlides] = useState(initialSlides?.length ? initialSlides : ACTIVE_DECK_SLIDES);
  const [activeId, setActiveId] = useState(() => (initialSlides?.length ? initialSlides[0].id : ACTIVE_DECK_SLIDES[0].id));
  const [panel, setPanel] = useState<SidePanel>('notes');
  const [zoom, setZoom] = useState(100);
  const [focusMode, setFocusMode] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialSlides?.length) return;
    setSlides(initialSlides);
    setActiveId(initialSlides[0].id);
    setFocusMode(true);
  }, [initialSlides]);

  const active = slides.find((s) => s.id === activeId) ?? slides[0];
  const activeIndex = slides.findIndex((s) => s.id === activeId);
  const notesValue = sanitizeNotes(active?.notes);

  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= slides.length) return;
    setActiveId(slides[index].id);
  };

  const updateNotes = (value: string) =>
    setSlides((prev) => prev.map((s) => (s.id === activeId ? { ...s, notes: value } : s)));

  const handleDownloadPptx = async () => {
    setExportError(null);
    setExporting(true);
    try {
      await downloadPresentationPptx(slides, { title: slides[0]?.title || 'MaVionix Presentation' });
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to export PPTX');
    } finally {
      setExporting(false);
    }
  };

  const gridClass = focusMode
    ? 'grid grid-cols-1 lg:grid-cols-[112px_minmax(0,1fr)] gap-3'
    : 'grid grid-cols-1 xl:grid-cols-[128px_minmax(0,1fr)_220px] gap-3';

  return (
    <div className={`${gridClass} xl:h-[calc(100vh-132px)]`}>
      <div className={`${card} p-2 xl:overflow-y-auto min-h-0`}>
        <div className="flex items-center justify-between px-1 pb-2">
          <span className={label}>Slides</span>
          <button type="button" className="text-purple-600 dark:text-purple-300"><Plus size={15} /></button>
        </div>
        <div className="space-y-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => moveSlide(Number(e.dataTransfer.getData('text/plain')), i)}
              className={`w-full text-left rounded-md overflow-hidden border-2 transition-all ${
                s.id === activeId ? 'border-purple-500' : 'border-transparent hover:border-purple-300/50 dark:hover:border-purple-800'
              }`}
            >
              <div className="relative">
                <SlideCanvas slide={s} compact />
                <span className="absolute top-1 left-1 h-5 min-w-5 px-1 rounded bg-black/75 text-white text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 min-h-0 min-w-0">
        <div className={`${card} flex items-center justify-between px-2.5 py-1.5 flex-wrap gap-2 shrink-0`}>
          <div className="flex items-center gap-0.5">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} type="button" title={t.label} className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
                  <Icon size={15} />
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void handleDownloadPptx()}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 h-8 rounded-full px-3.5 text-[11px] font-black uppercase tracking-wider text-white disabled:opacity-60"
              style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
            >
              {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {exporting ? 'Exporting…' : 'Download PPTX'}
            </button>
            <button
              type="button"
              title={focusMode ? 'Show notes panel' : 'Focus slide'}
              onClick={() => setFocusMode((v) => !v)}
              className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                focusMode ? 'bg-purple-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Maximize2 size={15} />
            </button>
            <button type="button" className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><Undo2 size={15} /></button>
            <button type="button" className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><Redo2 size={15} /></button>
            <div className="flex items-center gap-1 ml-0.5 rounded-lg border border-slate-200 dark:border-slate-800 px-1">
              <button type="button" onClick={() => setZoom((z) => Math.max(70, z - 10))} className="h-7 w-7 flex items-center justify-center text-slate-500"><ZoomOut size={13} /></button>
              <span className="text-[11px] font-bold w-9 text-center">{zoom}%</span>
              <button type="button" onClick={() => setZoom((z) => Math.min(140, z + 10))} className="h-7 w-7 flex items-center justify-center text-slate-500"><ZoomIn size={13} /></button>
            </div>
          </div>
        </div>

        {exportError && (
          <p className="text-[11px] font-semibold text-red-500 px-1">{exportError}</p>
        )}

        <div className={`${card} flex-1 min-h-[420px] xl:min-h-0 overflow-hidden flex items-center justify-center p-2 sm:p-3 bg-[#12121c]`}>
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
          >
            <div
              className="w-full"
              style={{
                maxWidth: 'min(100%, calc((100vh - 210px) * 16 / 9))',
              }}
            >
              <SlideCanvas slide={active} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 shrink-0">
          <button type="button" onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0} className="inline-flex items-center gap-1 text-[12px] font-bold text-slate-500 disabled:opacity-30">
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-[11px] text-slate-400 font-semibold tabular-nums">{activeIndex + 1} / {slides.length}</span>
          <button type="button" onClick={() => goTo(activeIndex + 1)} disabled={activeIndex === slides.length - 1} className="inline-flex items-center gap-1 text-[12px] font-bold text-slate-500 disabled:opacity-30">
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {!focusMode && (
        <div className={`${card} p-3 min-h-0 xl:overflow-y-auto`}>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-900 p-1">
            {[
              { id: 'notes', icon: StickyNote, tip: 'Notes' },
              { id: 'comments', icon: MessageSquare, tip: 'Comments' },
              { id: 'history', icon: History, tip: 'History' },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPanel(p.id as SidePanel)}
                  className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold transition-colors ${
                    panel === p.id ? 'bg-white dark:bg-[#0c0c14] text-purple-600 dark:text-purple-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon size={12} /> {p.tip}
                </button>
              );
            })}
          </div>

          <div className="mt-3">
            {panel === 'notes' && (
              <textarea
                value={notesValue}
                onChange={(e) => updateNotes(e.target.value)}
                rows={14}
                placeholder="Add speaker notes for this slide..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-[12.5px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/50 min-h-[220px]"
              />
            )}
            {panel === 'comments' && (
              <div className="space-y-3">
                {COMMENTS.map((c) => (
                  <div key={c.id} className="rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: c.avatarColor }}>
                        {c.author.split(' ').map((w) => w[0]).join('')}
                      </span>
                      <span className="text-[12px] font-bold">{c.author}</span>
                      <span className="text-[10px] text-slate-400 ml-auto">{c.time}</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">on <span className="font-semibold">{c.slide}</span></p>
                    <p className="mt-1 text-[12.5px] text-slate-600 dark:text-slate-300">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
            {panel === 'history' && (
              <div className="space-y-1">
                {VERSION_HISTORY.map((v, i) => (
                  <div key={v.id} className="flex gap-3 pb-4 relative">
                    {i !== VERSION_HISTORY.length - 1 && <span className="absolute left-[5px] top-3 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />}
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-purple-500 shrink-0 relative z-10" />
                    <div>
                      <p className="text-[12.5px] font-bold">{v.label}</p>
                      <p className="text-[11px] text-slate-400">{v.author} · {v.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
