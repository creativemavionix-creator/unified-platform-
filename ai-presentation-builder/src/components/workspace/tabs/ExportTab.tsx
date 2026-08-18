import React, { useState } from 'react';
import { FileDown, Presentation, Monitor, StickyNote, Printer, Link2, Download, Loader2 } from 'lucide-react';
import { EXPORT_HISTORY, RECENT_PRESENTATIONS, ACTIVE_DECK_SLIDES, type Slide } from '../../../data/presentationMockData';
import { downloadPresentationPptx } from '../../../lib/export-pptx';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5 sm:p-6';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const FORMATS = [
  { id: 'pptx', name: 'PPTX', desc: 'Editable PowerPoint file' },
  { id: 'pdf', name: 'PDF', desc: 'Print-ready document' },
  { id: 'png', name: 'PNG', desc: 'Image per slide' },
  { id: 'jpg', name: 'JPG', desc: 'Compressed image per slide' },
  { id: 'html', name: 'HTML', desc: 'Interactive web version' },
  { id: 'link', name: 'Shareable Link', desc: 'View-only public link' },
];

const MODES = [
  { id: 'present', name: 'Presentation Mode', icon: Presentation, desc: 'Full-screen, click-through slides.' },
  { id: 'presenter', name: 'Presenter View', icon: Monitor, desc: 'See notes and next slide as you present.' },
  { id: 'notes', name: 'Speaker Notes', icon: StickyNote, desc: 'Printable notes alongside thumbnails.' },
  { id: 'print', name: 'Print Layout', icon: Printer, desc: 'Handout-ready grid layout.' },
];

export default function ExportTab({ slides }: { slides?: Slide[] | null }) {
  const [format, setFormat] = useState('pptx');
  const [deck, setDeck] = useState(RECENT_PRESENTATIONS[0].id);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const deckSlides = slides?.length ? slides : ACTIVE_DECK_SLIDES;

  const handleExport = async () => {
    setMessage(null);
    if (format !== 'pptx') {
      setMessage(`${format.toUpperCase()} export is coming soon — use PPTX for now.`);
      return;
    }
    setExporting(true);
    try {
      await downloadPresentationPptx(deckSlides, {
        title: deckSlides[0]?.title || 'MaVionix Presentation',
      });
      setMessage(`Downloaded ${deckSlides.length} slides as PPTX.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      <div className="space-y-6">
        <div className={card}>
          <span className={label}>Choose a presentation</span>
          {slides?.length ? (
            <div className="mt-3 rounded-xl border border-purple-500/40 bg-purple-500/5 px-4 py-3">
              <p className="text-[13px] font-bold">{slides[0]?.title || 'Current deck'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{slides.length} slides ready to export</p>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {RECENT_PRESENTATIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setDeck(p.id)}
                  className={`text-left rounded-xl overflow-hidden border-2 transition-colors ${deck === p.id ? 'border-purple-500' : 'border-transparent'}`}
                >
                  <div className="aspect-video">
                    <img src={p.cover} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="mt-1.5 text-[12px] font-bold truncate px-0.5">{p.title}</p>
                </button>
              ))}
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
            disabled={exporting}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-[11px] font-black uppercase tracking-wider text-white disabled:opacity-60"
            style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {exporting ? 'Preparing download…' : `Export as ${format.toUpperCase()}`}
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
                <button key={m.id} type="button" className="text-left rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
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
          <button type="button" className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <Link2 size={14} /> Copy Share Link
          </button>
        </div>

        <div className={card}>
          <span className={label}>Export History</span>
          <div className="mt-3 space-y-2.5">
            {EXPORT_HISTORY.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold truncate">{e.name}</p>
                  <p className="text-[11px] text-slate-400">{e.format} · {e.time}</p>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 shrink-0 ml-2">{e.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
