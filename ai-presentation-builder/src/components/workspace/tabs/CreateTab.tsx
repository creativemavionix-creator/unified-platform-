import React, { useState } from 'react';
import {
  FileText, Link2, FileUp, StickyNote, BookOpen, ClipboardList, Presentation,
  Sparkles, Wand2, ArrowRight, Loader2, GripVertical, Plus, X, Mic,
} from 'lucide-react';
import { generateOutline, generateSlides, generateImage, type OutlineSlide } from '../../../lib/api';
import { TOKEN_COSTS, checkDemoTokens, deductDemoTokens, getTokenBalance } from '../../../lib/tokens';
import type { Slide } from '../../../data/presentationMockData';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5 sm:p-6';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

type SourceId = 'prompt' | 'topic' | 'pdf' | 'doc' | 'url' | 'existing' | 'notes' | 'research' | 'plan' | 'meeting';

const SOURCES: { id: SourceId; label: string; icon: React.ElementType }[] = [
  { id: 'prompt', label: 'Text Prompt', icon: Sparkles },
  { id: 'topic', label: 'Topic', icon: BookOpen },
  { id: 'pdf', label: 'PDF Upload', icon: FileUp },
  { id: 'doc', label: 'Word Document', icon: FileText },
  { id: 'url', label: 'Website URL', icon: Link2 },
  { id: 'existing', label: 'Existing Presentation', icon: Presentation },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'research', label: 'Research Content', icon: ClipboardList },
  { id: 'plan', label: 'Business Plan', icon: ClipboardList },
  { id: 'meeting', label: 'Meeting Notes', icon: Mic },
];

const PLACEHOLDER_THUMBS = [
  '/images/blog1.png', '/images/blog2.png', '/images/blog3.png', '/images/blog4.jpg',
  '/images/blog5.jpg', '/images/blog6.jpg', '/images/blog7.jpg', '/images/blog8.jpg',
];

const FILE_SOURCES: SourceId[] = ['pdf', 'doc', 'existing'];

type Props = {
  onDeckReady?: (slides: Slide[]) => void;
};

export default function CreateTab({ onDeckReady }: Props) {
  const [source, setSource] = useState<SourceId>('prompt');
  const [prompt, setPrompt] = useState('');
  const [stage, setStage] = useState<'input' | 'generating' | 'outline' | 'building'>('input');
  const [outline, setOutline] = useState<OutlineSlide[]>([]);
  const [designSuggestions, setDesignSuggestions] = useState<string[]>([]);
  const [speakerNotes, setSpeakerNotes] = useState(true);
  const [slideCount, setSlideCount] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [buildProgress, setBuildProgress] = useState('');

  const refreshTokens = () => {
    window.dispatchEvent(new CustomEvent('mvx-tokens-changed'));
    return getTokenBalance();
  };

  const sourcePlaceholder: Record<SourceId, string> = {
    prompt: 'Describe the presentation you want — audience, goal, tone...',
    topic: 'Enter a topic, e.g. "The future of renewable energy in India"',
    pdf: 'Paste key excerpts from your PDF (file upload parsing comes next).',
    doc: 'Paste content from your Word document.',
    url: 'Paste a website URL to summarize into slides.',
    existing: 'Describe the existing deck you want to remix.',
    notes: 'Paste your raw notes — AI will structure them into slides.',
    research: 'Paste research content, abstracts, or citations.',
    plan: 'Paste your business plan or key sections.',
    meeting: 'Paste meeting notes or a transcript.',
  };

  const handleGenerateOutline = async () => {
    const content = prompt.trim();
    if (!content) {
      setError('Add your input before generating an outline.');
      return;
    }
    if (FILE_SOURCES.includes(source) && content.length < 20) {
      setError('For file sources, paste extracted text for now (min ~20 characters).');
      return;
    }

    setError(null);
    setStage('generating');
    const outlineCost = TOKEN_COSTS['presentation/outline'];
    const check = checkDemoTokens(outlineCost);
    if (!check.ok) {
      setError(check.error || 'Not enough credits');
      setStage('input');
      return;
    }
    try {
      const result = await generateOutline({
        source,
        content,
        slideCount,
        speakerNotes,
      });
      deductDemoTokens(outlineCost);
      setOutline(result.slides);
      setDesignSuggestions(result.design_suggestions ?? []);
      setStage('outline');
      refreshTokens();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate outline.');
      setStage('input');
    }
  };

  const updateBullet = (outlineId: string, idx: number, value: string) => {
    setOutline((prev) =>
      prev.map((o) => (o.id === outlineId ? { ...o, bullets: o.bullets.map((b, i) => (i === idx ? value : b)) } : o)),
    );
  };

  const removeSlide = (id: string) => setOutline((prev) => prev.filter((o) => o.id !== id));
  const addSlide = () =>
    setOutline((prev) => [
      ...prev,
      { id: `o${prev.length + 1}-${Date.now()}`, title: 'New Slide', bullets: ['Add a talking point'] },
    ]);

  const handleGenerateSlides = async () => {
    if (outline.length === 0) {
      setError('Outline is empty.');
      return;
    }
    setError(null);
    setStage('building');
    setBuildProgress('Writing slide copy with Llama 3…');

    const slidesCost = TOKEN_COSTS['presentation/generate-slides'];
    const check = checkDemoTokens(slidesCost);
    if (!check.ok) {
      setError(check.error || 'Not enough credits');
      setStage('outline');
      return;
    }

    try {
      const result = await generateSlides({
        source,
        content: prompt.trim(),
        speakerNotes,
        outline,
      });
      deductDemoTokens(slidesCost);
      refreshTokens();

      const built: Slide[] = [];
      for (let i = 0; i < result.slides.length; i++) {
        const s = result.slides[i];
        setBuildProgress(`Generating visual ${i + 1} / ${result.slides.length}…`);
        let thumb = PLACEHOLDER_THUMBS[i % PLACEHOLDER_THUMBS.length];
        const imageCost = TOKEN_COSTS.generate;
        const imageCheck = checkDemoTokens(imageCost);
        if (imageCheck.ok) {
          try {
            const image = await generateImage({
              prompt: s.image_prompt || `presentation slide visual for ${s.title}, cinematic, no text`,
              width: 768,
              height: 432,
              steps: 20,
            });
            thumb = image.url;
            deductDemoTokens(imageCost);
            refreshTokens();
          } catch {
            // Keep placeholder if image API is unavailable
          }
        }
        built.push({
          id: s.id,
          title: s.title,
          layout: s.layout,
          thumb,
          notes: s.notes || '',
          subtitle: s.subtitle || '',
          body: s.body || '',
          bullets: s.bullets,
          layers: [
            { id: `${s.id}-t`, type: 'text', label: 'Title' },
            { id: `${s.id}-sub`, type: 'text', label: 'Subtitle' },
            { id: `${s.id}-b`, type: 'text', label: 'Body' },
            { id: `${s.id}-i`, type: 'image', label: 'Hero' },
            ...s.bullets.map((b, bi) => ({ id: `${s.id}-bul${bi}`, type: 'text' as const, label: b.slice(0, 40) })),
          ],
        });
      }

      onDeckReady?.(built);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate slides.');
      setStage('outline');
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {(stage === 'input' || stage === 'generating') && (
        <>
          <div>
            <p className={label}>Choose a Source</p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {SOURCES.map((s) => {
                const Icon = s.icon;
                const active = source === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSource(s.id)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all duration-200 ${
                      active
                        ? 'border-purple-400 bg-purple-50 dark:bg-purple-500/10 dark:border-purple-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-purple-600 dark:text-purple-300' : 'text-slate-400'} />
                    <span className="text-[11.5px] font-bold">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={card}>
            <p className={label}>Your Input</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={sourcePlaceholder[source]}
              rows={5}
              className="mt-4 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            />

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Slide count</span>
                <input
                  type="number"
                  min={4}
                  max={40}
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="w-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                />
              </div>
              <label className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" checked={speakerNotes} onChange={(e) => setSpeakerNotes(e.target.checked)} className="accent-purple-600" />
                Generate AI speaker notes
              </label>
            </div>

            <p className="mt-4 text-[11px] text-slate-500">
              Outline costs {TOKEN_COSTS['presentation/outline']} credits · building slides costs{' '}
              {TOKEN_COSTS['presentation/generate-slides']} + {TOKEN_COSTS.generate} per image
            </p>

            <button
              type="button"
              onClick={() => void handleGenerateOutline()}
              disabled={stage === 'generating'}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:-translate-y-0.5 transition-transform disabled:opacity-70 disabled:translate-y-0"
              style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)', boxShadow: '0 8px 20px -4px rgba(200,0,255,0.45)' }}
            >
              {stage === 'generating' ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Generating outline...
                </>
              ) : (
                <>
                  <Wand2 size={15} /> Generate Outline
                </>
              )}
            </button>
          </div>
        </>
      )}

      {stage === 'building' && (
        <div className={`${card} flex flex-col items-center justify-center py-16 text-center`}>
          <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
          <p className="mt-4 text-sm font-bold">Building your presentation…</p>
          <p className="mt-1 text-xs text-slate-500">{buildProgress}</p>
        </div>
      )}

      {stage === 'outline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${card} lg:col-span-2`}>
            <div className="flex items-center justify-between mb-4">
              <span className={label}>AI-Generated Outline</span>
              <button type="button" onClick={addSlide} className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-300">
                <Plus size={13} /> Add slide
              </button>
            </div>
            <div className="space-y-3">
              {outline.map((o, idx) => (
                <div key={o.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} className="text-slate-300 dark:text-slate-700 shrink-0" />
                    <span className="text-[11px] font-black text-purple-500 shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                    <input
                      value={o.title}
                      onChange={(e) => setOutline((prev) => prev.map((p) => (p.id === o.id ? { ...p, title: e.target.value } : p)))}
                      className="flex-1 min-w-0 bg-transparent text-sm font-bold focus:outline-none"
                    />
                    <button type="button" onClick={() => removeSlide(o.id)} className="shrink-0 text-slate-300 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="mt-2 ml-6 space-y-1.5">
                    {o.bullets.map((b, i) => (
                      <input
                        key={i}
                        value={b}
                        onChange={(e) => updateBullet(o.id, i, e.target.value)}
                        className="w-full bg-transparent text-[12.5px] text-slate-500 dark:text-slate-400 focus:outline-none"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => void handleGenerateSlides()}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:-translate-y-0.5 transition-transform"
              style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)', boxShadow: '0 8px 20px -4px rgba(200,0,255,0.45)' }}
            >
              <Sparkles size={15} /> Generate {outline.length} Slides <ArrowRight size={15} />
            </button>
          </div>

          <div className="space-y-6">
            <div className={card}>
              <span className={label}>AI Design Suggestions</span>
              <div className="mt-4 space-y-3">
                {(designSuggestions.length ? designSuggestions : ['Keep one idea per slide', 'Lead with outcomes', 'Use strong visuals']).map((d, i) => (
                  <div key={i} className="flex gap-2 text-[12.5px] text-slate-600 dark:text-slate-300">
                    <Sparkles size={14} className="text-purple-500 mt-0.5 shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={card}>
              <span className={label}>Options</span>
              <div className="mt-4 space-y-2.5">
                <label className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={speakerNotes} onChange={(e) => setSpeakerNotes(e.target.checked)} className="accent-purple-600" /> AI speaker notes per slide
                </label>
              </div>
            </div>
            <button type="button" onClick={() => setStage('input')} className="text-[12px] font-bold text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
              ← Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
