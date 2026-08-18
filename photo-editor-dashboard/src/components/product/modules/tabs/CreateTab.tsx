import React, { useState } from 'react';
import {
  Wand2, Sparkles, Copy, Heart, Save, Search, Loader2, Download, RefreshCw, Star,
  AlertCircle,
} from 'lucide-react';
import {
  STYLE_LIBRARY, STYLE_CATEGORIES, QUICK_TEMPLATES, PROMPT_HISTORY,
  MODEL_OPTIONS, ASPECT_RATIOS,
} from '../../../../data/imageGeneratorMockData';
import { generateImage } from '../../../../lib/api';
import { getOperationCost, checkDemoTokens, deductDemoTokens } from '../../../../lib/tokens';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';
const inputClass = 'w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50';

function SliderField({ name, value, onChange, min = 0, max = 100 }: { name: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{name}</span>
        <span className="text-[12px] font-bold text-purple-600 dark:text-purple-300">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-purple-600"
      />
    </div>
  );
}

export default function CreateTab() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [styleCategory, setStyleCategory] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [model, setModel] = useState(MODEL_OPTIONS[0]);
  const [ratio, setRatio] = useState('1:1');
  const [numImages, setNumImages] = useState(1);
  const [creativity, setCreativity] = useState(60);
  const [guidance, setGuidance] = useState(7);
  const [styleStrength, setStyleStrength] = useState(75);
  const [seed, setSeed] = useState('Random');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<Array<{ id: string; url: string; prompt: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [favPrompt, setFavPrompt] = useState(false);
  const [styleSearch, setStyleSearch] = useState('');

  const filteredStyles = STYLE_LIBRARY.filter(
    (s) => (styleCategory === 'All' || s.category === styleCategory) &&
      s.name.toLowerCase().includes(styleSearch.toLowerCase())
  );

  const ratioToDimensions = (value: string) => {
    switch (value) {
      case '16:9': return { width: 1024, height: 576 };
      case '9:16': return { width: 576, height: 1024 };
      case '4:5': return { width: 896, height: 1120 };
      case '3:2': return { width: 1024, height: 683 };
      case '2:3': return { width: 683, height: 1024 };
      case '1:1':
      default:
        return { width: 768, height: 768 };
    }
  };

  const handleGenerate = async () => {
    const promptText = prompt.trim();
    if (!promptText) {
      setError('Enter a prompt before generating.');
      return;
    }

    const cost = getOperationCost('generate') * numImages;
    const tokenCheck = checkDemoTokens(cost);
    if (!tokenCheck.ok) {
      setError(tokenCheck.error || 'Not enough credits');
      return;
    }

    setIsGenerating(true);
    setResults([]);
    setError(null);

    const { width, height } = ratioToDimensions(ratio);
    const numericSeed = seed.trim() === 'Random' ? undefined : Number(seed);
    const validSeed = Number.isFinite(numericSeed) ? numericSeed : undefined;
    const steps = Math.max(15, Math.round(20 + creativity * 0.2));

    try {
      const generated = await Promise.all(
        Array.from({ length: numImages }, (_, index) =>
          generateImage({
            prompt: promptText,
            negativePrompt: negativePrompt.trim() || undefined,
            width,
            height,
            steps,
            seed: validSeed === undefined ? undefined : validSeed + index,
          })
        )
      );

      deductDemoTokens(cost);

      setResults(
        generated.map((item) => ({
          id: item.filename,
          url: item.url,
          prompt: promptText,
        }))
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) return;
    setPrompt((value) => `${value.trim()}, detailed composition, professional lighting, high quality`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
      {/* Left: prompt + results */}
      <div className="space-y-6 min-w-0">
        <div className={`${card} reveal-up`}>
          <div className="flex items-center justify-between">
            <span className={label}>Prompt</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setFavPrompt((v) => !v)} title="Favorite prompt" className="text-slate-400 hover:text-yellow-500">
                <Star size={15} className={favPrompt ? 'fill-yellow-400 text-yellow-400' : ''} />
              </button>
              <button title="Copy prompt" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <Copy size={15} />
              </button>
              <button title="Save prompt" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <Save size={15} />
              </button>
            </div>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Describe the image you want to create in detail..."
            className={`${inputClass} mt-3 resize-none`}
          />
          <button
            onClick={() => void handleEnhancePrompt()}
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300"
          >
            <Sparkles size={13} /> Enhance prompt
          </button>

          <div className="mt-4">
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Negative prompt</span>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              rows={2}
              placeholder="Blurry, low quality, watermark, distorted..."
              className={`${inputClass} mt-1.5 resize-none`}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setPrompt(t.prompt)}
                className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-[11.5px] font-semibold text-slate-600 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>Cost:</span>
            <span className="font-bold text-purple-600 dark:text-purple-300">{getOperationCost('generate') * numImages} credits</span>
            <span className="text-slate-400">({getOperationCost('generate')} × {numImages})</span>
          </p>

          <button
            onClick={() => void handleGenerate()}
            disabled={isGenerating || !prompt.trim()}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-xs font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5 disabled:opacity-70"
            style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)', boxShadow: '0 8px 20px -4px rgba(200,0,255,0.45)' }}
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {isGenerating ? 'Generating…' : `Generate ${numImages} Images`}
          </button>
          {error && <p className="mt-3 text-sm text-red-500 flex items-center gap-1.5"><AlertCircle size={14} />{error}</p>}
        </div>

        {/* Results */}
        <div className={`${card} reveal-up`}>
          <span className={label}>Results</span>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {isGenerating &&
              Array.from({ length: numImages }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
              ))}
            {!isGenerating && results.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-slate-400">
                Your generated images will appear here.
              </div>
            )}
            {!isGenerating &&
              results.map((img) => (
                <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-end p-2 gap-1.5 opacity-0 group-hover:opacity-100">
                    <button className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-slate-700"><Heart size={13} /></button>
                    <button className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-slate-700"><Download size={13} /></button>
                    <button className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-slate-700"><RefreshCw size={13} /></button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Prompt history */}
        <div className={`${card} reveal-up`}>
          <span className={label}>Prompt History</span>
          <div className="mt-3 space-y-2">
            {PROMPT_HISTORY.map((p) => (
              <button
                key={p.id}
                onClick={() => setPrompt(p.prompt)}
                className="w-full text-left flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold truncate">{p.prompt}</p>
                  <p className="text-[11px] text-slate-400">{p.style} · {p.createdAt}</p>
                </div>
                {p.favorite && <Star size={13} className="fill-yellow-400 text-yellow-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: settings + style library */}
      <div className="space-y-6">
        <div className={`${card} reveal-up`}>
          <span className={label}>Generation Settings</span>
          <div className="mt-4 space-y-4">
            <div>
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Model</span>
              <select value={model} onChange={(e) => setModel(e.target.value)} className={`${inputClass} mt-1.5`}>
                {MODEL_OPTIONS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Aspect Ratio</span>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatio(r)}
                    className={`rounded-lg border px-2 py-1.5 text-[11.5px] font-semibold transition-colors ${
                      ratio === r ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Number of Images</span>
              <div className="mt-1.5 flex gap-2">
                {[1, 2, 4, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNumImages(n)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-[12px] font-bold transition-colors ${
                      numImages === n ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <SliderField name="Creativity Level" value={creativity} onChange={setCreativity} />
            <SliderField name="Guidance Scale" value={guidance} onChange={setGuidance} min={1} max={20} />
            <SliderField name="Style Strength" value={styleStrength} onChange={setStyleStrength} />
            <div>
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Seed Value</span>
              <input value={seed} onChange={(e) => setSeed(e.target.value)} className={`${inputClass} mt-1.5`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Lighting</span>
                <select className={`${inputClass} mt-1.5`}>
                  <option>Natural</option><option>Studio</option><option>Golden Hour</option><option>Dramatic</option>
                </select>
              </div>
              <div>
                <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Camera Angle</span>
                <select className={`${inputClass} mt-1.5`}>
                  <option>Eye-level</option><option>Top-down</option><option>Low angle</option><option>Close-up</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Style library */}
        <div className={`${card} reveal-up`}>
          <div className="flex items-center justify-between">
            <span className={label}>Style Library</span>
          </div>
          <div className="mt-3 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={styleSearch}
              onChange={(e) => setStyleSearch(e.target.value)}
              placeholder="Search styles..."
              className={`${inputClass} pl-9`}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {STYLE_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setStyleCategory(c)}
                className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide transition-colors ${
                  styleCategory === c ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
            {filteredStyles.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id)}
                className={`relative rounded-xl border p-2 text-left transition-all ${
                  selectedStyle === s.id ? 'ring-purple-500' : 'ring-transparent'
                }`}
              >
                <p className="text-[10px] font-bold">{s.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
