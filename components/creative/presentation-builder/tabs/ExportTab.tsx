'use client';

import React, { useMemo, useState } from 'react';
import { FileDown, Presentation, Monitor, StickyNote, Printer, Link2, Download, Loader2 } from 'lucide-react';
import type { Slide } from '../presentationMockData';
import PresentOverlay, { type PresentMode } from '../PresentOverlay';
import { downloadPresentationPptx } from '@/lib/presentation-builder/export-pptx';
import {
  downloadPresentationHtml,
  downloadSlidesAsImages,
  openPrintablePresentation,
} from '@/lib/presentation-builder/export-formats';
import {
  getShareUrl,
  recordExport,
  type SavedDeck,
} from '@/lib/presentation-builder/store';
import { usePresentationStore } from '@/hooks/use-presentation-store';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5 sm:p-6';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const FORMATS = [
  { id: 'pptx', name: 'PPTX', desc: 'Editable PowerPoint file' },
  { id: 'pdf', name: 'PDF', desc: 'Print dialog → Save as PDF' },
  { id: 'png', name: 'PNG', desc: 'Image per slide' },
  { id: 'jpg', name: 'JPG', desc: 'Compressed image per slide' },
  { id: 'html', name: 'HTML', desc: 'Interactive web version' },
  { id: 'link', name: 'Shareable Link', desc: 'Copy preview link' },
] as const;

type FormatId = (typeof FORMATS)[number]['id'];

const MODES = [
  { id: 'present', name: 'Presentation Mode', icon: Presentation, desc: 'Full-screen, click-through slides.' },
  { id: 'presenter', name: 'Presenter View', icon: Monitor, desc: 'See notes and next slide as you present.' },
  { id: 'notes', name: 'Speaker Notes', icon: StickyNote, desc: 'Printable notes alongside thumbnails.' },
  { id: 'print', name: 'Print Layout', icon: Printer, desc: 'Handout-ready grid layout.' },
] as const;

type Props = {
  slides?: Slide[] | null;
  deck?: SavedDeck | null;
  accentHex?: string;
  onStartCreate?: () => void;
};

export default function ExportTab({ slides, deck, accentHex = '#C800FF', onStartCreate }: Props) {
  const { state } = usePresentationStore();
  const [format, setFormat] = useState<FormatId>('pptx');
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [present, setPresent] = useState<PresentMode | null>(null);
  const [copied, setCopied] = useState(false);

  const deckSlides = useMemo(() => {
    if (slides?.length) return slides;
    if (deck?.slides?.length) return deck.slides;
    return [];
  }, [slides, deck]);

  const title = deck?.title || deckSlides[0]?.title || 'MaVionix Presentation';
  const shareUrl = getShareUrl(deck);
  const exportHistory = state.exports;

  const handleExport = async () => {
    setMessage(null);
    if (!deckSlides.length) {
      setMessage('Generate or open a presentation first.');
      return;
    }

    if (format === 'link') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setMessage('Share link copied. Opens this deck in the same browser.');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setMessage(`Copy manually: ${shareUrl}`);
      }
      return;
    }

    setExporting(true);
    try {
      if (format === 'pptx') {
        await downloadPresentationPptx(deckSlides, { title });
        recordExport(title, 'PPTX', `${deckSlides.length} slides`);
        setMessage(`Downloaded ${deckSlides.length} slides as PPTX.`);
      } else if (format === 'html') {
        downloadPresentationHtml(deckSlides, { title, accentHex });
        recordExport(title, 'HTML', `${deckSlides.length} slides`);
        setMessage('HTML deck downloaded.');
      } else if (format === 'pdf') {
        openPrintablePresentation(deckSlides, { title, accentHex, mode: 'slides' });
        recordExport(title, 'PDF', `${deckSlides.length} slides`);
        setMessage('Print dialog opened — choose “Save as PDF”.');
      } else if (format === 'png' || format === 'jpg') {
        await downloadSlidesAsImages(deckSlides, format, { title, accentHex });
        recordExport(title, format.toUpperCase(), `${deckSlides.length} images`);
        setMessage(`Downloaded ${deckSlides.length} ${format.toUpperCase()} images.`);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const runMode = (id: (typeof MODES)[number]['id']) => {
    setMessage(null);
    if (!deckSlides.length) {
      setMessage('Generate or open a presentation first.');
      return;
    }
    if (id === 'present' || id === 'presenter') {
      setPresent(id);
      return;
    }
    if (id === 'notes') {
      openPrintablePresentation(deckSlides, { title, accentHex, mode: 'notes' });
      setMessage('Speaker notes print view opened.');
      return;
    }
    openPrintablePresentation(deckSlides, { title, accentHex, mode: 'handout' });
    setMessage('Print handout layout opened.');
  };

  if (present) {
    return (
      <PresentOverlay
        slides={deckSlides}
        mode={present}
        accentHex={accentHex}
        onClose={() => setPresent(null)}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      <div className="space-y-6">
        <div className={card}>
          <span className={label}>Choose a presentation</span>
          {deckSlides.length ? (
            <div className="mt-3 rounded-xl border border-purple-500/40 bg-purple-500/5 px-4 py-3">
              <p className="text-[13px] font-bold">{title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{deckSlides.length} slides ready to export</p>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-4 py-6 text-center">
              <p className="text-[13px] font-semibold text-slate-500">No active deck yet</p>
              <button
                type="button"
                onClick={onStartCreate}
                className="mt-3 text-[12px] font-bold text-purple-600 dark:text-purple-300"
              >
                Generate a presentation →
              </button>
            </div>
          )}
        </div>

        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <FileDown size={16} className="text-purple-500" />
            <span className={label}>Export Format</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id)}
                className={`text-left rounded-xl border px-3.5 py-2.5 transition-colors ${
                  format === f.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <p className="text-[13px] font-bold">{f.name}</p>
                <p className="text-[11px] text-slate-400">{f.desc}</p>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={exporting || !deckSlides.length}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-[11px] font-black uppercase tracking-wider text-white disabled:opacity-60"
            style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {exporting
              ? 'Preparing…'
              : format === 'link'
                ? copied
                  ? 'Copied!'
                  : 'Copy Share Link'
                : `Export as ${format.toUpperCase()}`}
          </button>
          {message && <p className="mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{message}</p>}
        </div>

        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <Presentation size={16} className="text-purple-500" />
            <span className={label}>Presentation Mode</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODES.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => runMode(m.id)}
                  className="text-left rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-2">
                    <Icon size={16} />
                  </div>
                  <p className="text-[13px] font-bold">{m.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className={card}>
          <div className="flex items-center gap-2 mb-3">
            <Link2 size={16} className="text-purple-500" />
            <span className={label}>Quick Share</span>
          </div>
          <input
            readOnly
            value={deck ? shareUrl : 'Generate a deck to get a share link'}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-[11px] text-slate-500 mb-2"
          />
          <button
            type="button"
            disabled={!deck}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setMessage('Share link copied. Opens this deck in the same browser.');
                setTimeout(() => setCopied(false), 2000);
              } catch {
                setMessage(`Copy manually: ${shareUrl}`);
              }
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
          >
            <Link2 size={14} /> {copied ? 'Copied!' : 'Copy Share Link'}
          </button>
        </div>

        <div className={card}>
          <span className={label}>Export History</span>
          <div className="mt-3 space-y-2.5">
            {(exportHistory.length
              ? exportHistory
              : [{ id: 'empty', name: 'No exports yet', format: '—', time: 'Export to begin', size: '' }]
            ).slice(0, 10).map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold truncate">{e.name}</p>
                  <p className="text-[11px] text-slate-400">{e.format} · {e.time}</p>
                </div>
                {'size' in e && e.size ? (
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0 ml-2">{e.size}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
