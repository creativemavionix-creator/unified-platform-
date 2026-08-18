'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Type, Image as ImageIcon, PieChart, Shapes, Table2, Video, Smile as IconLucide,
  LayoutGrid, MessageSquare, History, StickyNote, Plus, ChevronLeft, ChevronRight,
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Download, Loader2, Play, X, Trash2, Wand2,
} from 'lucide-react';
import type { Slide } from '../presentationMockData';
import SlideCanvas from '../SlideCanvas';
import PresentOverlay, { type PresentMode } from '../PresentOverlay';
import { downloadPresentationPptx } from '@/lib/presentation-builder/export-pptx';
import { addComment, recordExport } from '@/lib/presentation-builder/store';
import { usePresentationStore } from '@/hooks/use-presentation-store';

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

const LAYOUT_OPTIONS = ['Title', 'Text + Image', 'Two Column', 'Chart', 'Quote', 'Agenda'];

type SidePanel = 'notes' | 'edit' | 'comments' | 'history';

function sanitizeNotes(notes: string | undefined): string {
  const text = (notes || '').trim();
  if (!text || /^(true|false|none|null)$/i.test(text)) return '';
  return text;
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

type Props = {
  initialSlides?: Slide[];
  deckId?: string | null;
  accentHex?: string;
  onSlidesChange?: (slides: Slide[]) => void;
  onActiveSlideChange?: (slideId: string) => void;
  onStartCreate?: () => void;
};

export default function EditorTab({
  initialSlides,
  deckId = null,
  accentHex = '#a78bfa',
  onSlidesChange,
  onActiveSlideChange,
  onStartCreate,
}: Props) {
  const { state } = usePresentationStore();
  const [slides, setSlides] = useState<Slide[]>(initialSlides?.length ? initialSlides : []);
  const [activeId, setActiveId] = useState(() => initialSlides?.[0]?.id || '');
  const [panel, setPanel] = useState<SidePanel>('edit');
  const [zoom, setZoom] = useState(100);
  const [focusMode, setFocusMode] = useState(false);
  const [presentMode, setPresentMode] = useState<PresentMode | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportOk, setExportOk] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [toolHint, setToolHint] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [undoStack, setUndoStack] = useState<Slide[][]>([]);
  const [redoStack, setRedoStack] = useState<Slide[][]>([]);
  const [imageUrlDraft, setImageUrlDraft] = useState('');

  const loadedDeckId = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSlides = useRef<Slide[] | null>(null);
  const slidesRef = useRef(slides);
  const activeIndexRef = useRef(0);
  const thumbRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onSlidesChangeRef = useRef(onSlidesChange);

  slidesRef.current = slides;
  onSlidesChangeRef.current = onSlidesChange;

  const flushSave = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (pendingSlides.current) {
      onSlidesChangeRef.current?.(pendingSlides.current);
      pendingSlides.current = null;
      setSaveState('saved');
    }
  }, []);

  useEffect(() => {
    if (!initialSlides?.length) {
      setSlides([]);
      setActiveId('');
      loadedDeckId.current = null;
      return;
    }
    const key = deckId ?? `session-${initialSlides[0]?.id ?? 'demo'}`;
    if (loadedDeckId.current === key) return;
    flushSave();
    loadedDeckId.current = key;
    setSlides(initialSlides);
    setActiveId(initialSlides[0].id);
    setFocusMode(false);
    setPanel('edit');
    setUndoStack([]);
    setRedoStack([]);
    setSaveState('idle');
  }, [deckId, initialSlides, flushSave]);

  useEffect(() => {
    if (activeId) onActiveSlideChange?.(activeId);
  }, [activeId, onActiveSlideChange]);

  useEffect(() => {
    const el = thumbRefs.current[activeId];
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeId]);

  useEffect(() => () => {
    flushSave();
    if (hintTimer.current) clearTimeout(hintTimer.current);
  }, [flushSave]);

  const showHint = (msg: string) => {
    setToolHint(msg);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setToolHint(null), 2800);
  };

  const commit = useCallback((next: Slide[], opts?: { recordHistory?: boolean }) => {
    const recordHistory = opts?.recordHistory !== false;
    if (recordHistory) {
      setUndoStack((u) => [...u.slice(-24), slidesRef.current]);
      setRedoStack([]);
    }
    setSlides(next);
    slidesRef.current = next;
    pendingSlides.current = next;
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onSlidesChangeRef.current?.(next);
      pendingSlides.current = null;
      setSaveState('saved');
      saveTimer.current = null;
    }, 320);
  }, []);

  const undo = useCallback(() => {
    setUndoStack((u) => {
      if (!u.length) return u;
      const prev = u[u.length - 1];
      setRedoStack((r) => [...r, slidesRef.current]);
      commit(prev, { recordHistory: false });
      return u.slice(0, -1);
    });
  }, [commit]);

  const redo = useCallback(() => {
    setRedoStack((r) => {
      if (!r.length) return r;
      const next = r[r.length - 1];
      setUndoStack((u) => [...u, slidesRef.current]);
      commit(next, { recordHistory: false });
      return r.slice(0, -1);
    });
  }, [commit]);

  const active = slides.find((s) => s.id === activeId) ?? slides[0];
  const activeIndex = slides.findIndex((s) => s.id === activeId);
  activeIndexRef.current = activeIndex >= 0 ? activeIndex : 0;
  const notesValue = sanitizeNotes(active?.notes);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= slidesRef.current.length) return;
    setActiveId(slidesRef.current[index].id);
  }, []);

  useEffect(() => {
    if (presentMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'ArrowRight') goTo(activeIndexRef.current + 1);
      if (e.key === 'ArrowLeft') goTo(activeIndexRef.current - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [presentMode, goTo, undo, redo]);

  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= slides.length || from === to) return;
    const next = [...slides];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commit(next);
  };

  const patchActive = (patch: Partial<Slide>) => {
    const id = activeId;
    commit(slidesRef.current.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const runTool = (toolId: string) => {
    if (!active) return;
    setPanel('edit');
    setFocusMode(false);
    switch (toolId) {
      case 'text':
        patchActive({ bullets: [...(active.bullets || []), 'New talking point'] });
        showHint('Added a text bullet');
        break;
      case 'image':
        setImageUrlDraft(active.thumb || '');
        showHint('Paste an image URL below and Apply');
        break;
      case 'icon':
        patchActive({
          bullets: [...(active.bullets || []), '✦ Highlight with an icon-led point'],
        });
        showHint('Added an icon-style bullet');
        break;
      case 'chart':
        patchActive({ layout: 'Chart', subtitle: active.subtitle || 'Key metrics at a glance' });
        showHint('Switched layout to Chart');
        break;
      case 'table':
        patchActive({
          layout: 'Two Column',
          bullets: [
            'Row A — value / owner / status',
            'Row B — value / owner / status',
            'Row C — value / owner / status',
          ],
        });
        showHint('Inserted table-style talking points');
        break;
      case 'video':
        patchActive({
          body: `${active.body ? `${active.body} ` : ''}[Video placeholder — add your clip URL in speaker notes]`.trim(),
          notes: `${notesValue ? `${notesValue}\n` : ''}Video cue: play demo clip here.`,
        });
        showHint('Added a video cue on this slide');
        break;
      case 'shape':
        patchActive({
          layers: [
            ...(active.layers || []),
            { id: `${active.id}-shape-${Date.now()}`, type: 'shape', label: 'Accent shape' },
          ],
        });
        showHint('Accent shape layer added');
        break;
      case 'layout': {
        const idx = LAYOUT_OPTIONS.indexOf(active.layout);
        const nextLayout = LAYOUT_OPTIONS[(idx + 1) % LAYOUT_OPTIONS.length];
        patchActive({ layout: nextLayout });
        showHint(`Layout → ${nextLayout}`);
        break;
      }
      default:
        showHint('Use the side panel to edit this slide');
    }
  };

  const addSlide = () => {
    const id = `s-new-${Date.now()}`;
    const slide: Slide = {
      id,
      title: 'New Slide',
      layout: 'Text + Image',
      thumb: active?.thumb || '/images/blog1.png',
      notes: '',
      subtitle: 'Add a supporting line',
      body: 'Write the narrative for this slide.',
      bullets: ['First talking point', 'Second talking point', 'Third talking point'],
      layers: [
        { id: `${id}-t`, type: 'text', label: 'Title' },
        { id: `${id}-b`, type: 'text', label: 'Body' },
      ],
    };
    const next = [...slidesRef.current, slide];
    commit(next);
    setActiveId(id);
    showHint('Slide added');
  };

  const deleteSlide = () => {
    if (slidesRef.current.length <= 1) return;
    const idx = slidesRef.current.findIndex((s) => s.id === activeId);
    const next = slidesRef.current.filter((s) => s.id !== activeId);
    commit(next);
    setActiveId(next[Math.max(0, idx - 1)].id);
    showHint('Slide deleted');
  };

  const handleDownloadPptx = async () => {
    setExportError(null);
    setExportOk(false);
    setExporting(true);
    flushSave();
    try {
      const title = slidesRef.current[0]?.title || 'MaVionix Presentation';
      await downloadPresentationPptx(slidesRef.current, { title });
      recordExport(title, 'PPTX', `${slidesRef.current.length} slides`);
      setExportOk(true);
      showHint('PPTX downloaded');
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to export PPTX');
    } finally {
      setExporting(false);
    }
  };

  if (!slides.length) {
    return (
      <div className={`${card} p-10 text-center max-w-xl mx-auto`}>
        <div className="mx-auto w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
          <Wand2 size={22} />
        </div>
        <h3 className="mt-4 text-lg font-black">No presentation open</h3>
        <p className="mt-2 text-sm text-slate-500">
          Generate a deck with AI Generator, or open one from Dashboard / History.
        </p>
        <button
          type="button"
          onClick={onStartCreate}
          className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white"
          style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
        >
          <Wand2 size={14} /> Start AI Generator
        </button>
      </div>
    );
  }

  if (presentMode) {
    return (
      <PresentOverlay
        slides={slides}
        startIndex={Math.max(0, activeIndex)}
        mode={presentMode}
        accentHex={accentHex}
        onClose={() => setPresentMode(null)}
      />
    );
  }

  const gridClass = focusMode
    ? 'grid grid-cols-1 lg:grid-cols-[112px_minmax(0,1fr)] gap-3'
    : 'grid grid-cols-1 xl:grid-cols-[128px_minmax(0,1fr)_280px] gap-3';

  return (
    <div className={`${gridClass} xl:h-[calc(100vh-132px)]`}>
      <div className={`${card} p-2 xl:overflow-y-auto min-h-0`}>
        <div className="flex items-center justify-between px-1 pb-2">
          <span className={label}>Slides</span>
          <button type="button" onClick={addSlide} className="text-purple-600 dark:text-purple-300" title="Add slide"><Plus size={15} /></button>
        </div>
        <div className="space-y-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              ref={(el) => { thumbRefs.current[s.id] = el; }}
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
                <SlideCanvas slide={s} compact accentHex={accentHex} />
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
                <button
                  key={t.id}
                  type="button"
                  title={t.label}
                  onClick={() => runTool(t.id)}
                  className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  <Icon size={15} />
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline text-[10px] font-semibold text-slate-400 w-14 text-right">
              {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : ''}
            </span>
            <button
              type="button"
              onClick={() => setPresentMode('presenter')}
              className="hidden md:inline-flex items-center gap-1.5 h-8 rounded-full border border-slate-200 dark:border-slate-700 px-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:border-purple-400"
              title="Presenter view with notes"
            >
              Notes view
            </button>
            <button
              type="button"
              onClick={() => setPresentMode('present')}
              className="inline-flex items-center gap-1.5 h-8 rounded-full border border-slate-200 dark:border-slate-700 px-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:border-purple-400"
            >
              <Play size={13} /> Present
            </button>
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
              title={focusMode ? 'Show panels' : 'Focus slide'}
              onClick={() => setFocusMode((v) => !v)}
              className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                focusMode ? 'bg-purple-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Maximize2 size={15} />
            </button>
            <button type="button" title="Undo" disabled={!undoStack.length} onClick={undo} className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"><Undo2 size={15} /></button>
            <button type="button" title="Redo" disabled={!redoStack.length} onClick={redo} className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"><Redo2 size={15} /></button>
            <div className="flex items-center gap-1 ml-0.5 rounded-lg border border-slate-200 dark:border-slate-800 px-1">
              <button type="button" onClick={() => setZoom((z) => Math.max(70, z - 10))} className="h-7 w-7 flex items-center justify-center text-slate-500"><ZoomOut size={13} /></button>
              <button type="button" onClick={() => setZoom(100)} className="text-[11px] font-bold w-9 text-center" title="Reset zoom">{zoom}%</button>
              <button type="button" onClick={() => setZoom((z) => Math.min(140, z + 10))} className="h-7 w-7 flex items-center justify-center text-slate-500"><ZoomIn size={13} /></button>
            </div>
          </div>
        </div>

        {(exportError || exportOk || toolHint) && (
          <p className={`text-[11px] font-semibold px-1 ${exportError ? 'text-red-500' : exportOk ? 'text-emerald-500' : 'text-slate-500'}`}>
            {exportError || (exportOk ? 'Download ready.' : toolHint)}
          </p>
        )}

        <div className={`${card} flex-1 min-h-[420px] xl:min-h-0 overflow-hidden flex items-center justify-center p-2 sm:p-3 bg-[#12121c]`}>
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
          >
            <div className="w-full" style={{ maxWidth: 'min(100%, calc((100vh - 210px) * 16 / 9))' }}>
              <SlideCanvas slide={active} accentHex={accentHex} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 shrink-0">
          <button type="button" onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0} className="inline-flex items-center gap-1 text-[12px] font-bold text-slate-500 disabled:opacity-30 hover:text-purple-600">
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-[11px] text-slate-400 font-semibold tabular-nums">{activeIndex + 1} / {slides.length}</span>
          <button type="button" onClick={() => goTo(activeIndex + 1)} disabled={activeIndex === slides.length - 1} className="inline-flex items-center gap-1 text-[12px] font-bold text-slate-500 disabled:opacity-30 hover:text-purple-600">
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {!focusMode && (
        <div className={`${card} p-3 min-h-0 xl:overflow-y-auto`}>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-900 p-1">
            {[
              { id: 'edit', icon: Type, tip: 'Edit' },
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

          <div className="mt-3 space-y-3">
            {panel === 'edit' && active && (
              <>
                <div>
                  <p className={label}>Layout</p>
                  <select
                    value={active.layout}
                    onChange={(e) => patchActive({ layout: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-[12.5px]"
                  >
                    {LAYOUT_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <p className={label}>Title</p>
                  <input
                    value={active.title}
                    onChange={(e) => patchActive({ title: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-[13px] font-bold"
                  />
                </div>
                <div>
                  <p className={label}>Subtitle</p>
                  <input
                    value={active.subtitle || ''}
                    onChange={(e) => patchActive({ subtitle: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-[12.5px]"
                  />
                </div>
                <div>
                  <p className={label}>Body</p>
                  <textarea
                    value={active.body || ''}
                    onChange={(e) => patchActive({ body: e.target.value })}
                    rows={3}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-[12.5px] resize-none"
                  />
                </div>
                <div>
                  <p className={label}>Slide image URL</p>
                  <div className="mt-1.5 flex gap-1.5">
                    <input
                      value={imageUrlDraft || active.thumb || ''}
                      onChange={(e) => setImageUrlDraft(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 text-[12px]"
                      placeholder="/images/… or https://…"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = (imageUrlDraft || active.thumb || '').trim();
                        if (!url) return;
                        patchActive({ thumb: url });
                        showHint('Slide image updated');
                      }}
                      className="rounded-lg px-3 text-[11px] font-bold text-white"
                      style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
                <div>
                  <p className={label}>Bullets</p>
                  <div className="mt-1.5 space-y-2">
                    {(active.bullets || []).map((b, i) => (
                      <div key={i} className="flex gap-1.5">
                        <input
                          value={b}
                          onChange={(e) => {
                            const bullets = [...(active.bullets || [])];
                            bullets[i] = e.target.value;
                            patchActive({ bullets });
                          }}
                          className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 text-[12px]"
                        />
                        <button
                          type="button"
                          title="Remove bullet"
                          onClick={() => patchActive({ bullets: (active.bullets || []).filter((_, bi) => bi !== i) })}
                          className="h-8 w-8 shrink-0 rounded-lg text-slate-400 hover:text-red-500"
                        >
                          <X size={14} className="mx-auto" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => patchActive({ bullets: [...(active.bullets || []), 'New point'] })}
                      className="text-[11px] font-bold text-purple-600"
                    >
                      + Add bullet
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={deleteSlide}
                  disabled={slides.length <= 1}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-500 disabled:opacity-40"
                >
                  <Trash2 size={13} /> Delete slide
                </button>
              </>
            )}

            {panel === 'notes' && (
              <textarea
                value={notesValue}
                onChange={(e) => patchActive({ notes: e.target.value })}
                rows={14}
                placeholder="Add speaker notes for this slide..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-[12.5px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/50 min-h-[220px]"
              />
            )}

            {panel === 'comments' && (
              <div className="space-y-3">
                {state.comments.slice(0, 8).map((c) => (
                  <div key={c.id} className="rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: c.avatarColor }}>
                        {c.author.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                      </span>
                      <span className="text-[12px] font-bold">{c.author}</span>
                      <span className="text-[10px] text-slate-400 ml-auto">{c.time}</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">on <span className="font-semibold">{c.slide}</span></p>
                    <p className="mt-1 text-[12.5px] text-slate-600 dark:text-slate-300">{c.text}</p>
                  </div>
                ))}
                {!state.comments.length && (
                  <p className="text-[12px] text-slate-400">No comments yet — add the first one below.</p>
                )}
                <div className="flex gap-2">
                  <input
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && commentDraft.trim()) {
                        addComment(commentDraft.trim(), active.title);
                        setCommentDraft('');
                      }
                    }}
                    placeholder="Add a comment… (Enter)"
                    className="flex-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 text-[12px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!commentDraft.trim()) return;
                      addComment(commentDraft.trim(), active.title);
                      setCommentDraft('');
                    }}
                    className="rounded-full px-3 text-[11px] font-bold text-white"
                    style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

            {panel === 'history' && (
              <div className="space-y-1">
                {(state.activity.length
                  ? state.activity.slice(0, 8).map((a) => ({ id: a.id, label: a.text, author: 'You', time: a.time }))
                  : [{ id: 'empty', label: 'Edits and exports will show up here.', author: 'System', time: '—' }]
                ).map((v, i, arr) => (
                  <div key={v.id} className="flex gap-3 pb-4 relative">
                    {i !== arr.length - 1 && <span className="absolute left-[5px] top-3 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />}
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-purple-500 shrink-0 relative z-10" />
                    <div>
                      <p className="text-[12.5px] font-bold line-clamp-2">{v.label}</p>
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
