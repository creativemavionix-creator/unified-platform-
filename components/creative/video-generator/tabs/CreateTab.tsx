import { useState } from 'react';
import {
  Wand2, Sparkles, Copy, Star, Save, ChevronDown, Info, Dices, RefreshCcw,
} from 'lucide-react';
import {
  STYLE_CATEGORIES, STYLE_LIBRARY, QUICK_TEMPLATES, PROMPT_HISTORY, COLOR_GRADES,
  MODEL_OPTIONS, ASPECT_RATIOS, RESOLUTIONS, FRAME_RATES, CAMERA_MOVEMENTS,
  LIGHTING_OPTIONS, BACKGROUND_OPTIONS, ANIMATION_STYLES,
} from '../videoGeneratorMockData';

function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0b14] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[12px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h3>
        {hint && (
          <span title={hint} className="text-slate-300 dark:text-slate-600">
            <Info size={13} />
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function PillGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
            value === opt
              ? 'bg-purple-600 text-white'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-[12px] font-black text-purple-600 dark:text-purple-300">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-purple-600"
      />
    </div>
  );
}

export default function CreateTab() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState(STYLE_LIBRARY[0].id);
  const [selectedGrade, setSelectedGrade] = useState(COLOR_GRADES[1].id); // Cinematic by default
  const [duration, setDuration] = useState('0:15');
  const [resolution, setResolution] = useState('1080p');
  const [ratio, setRatio] = useState('16:9');
  const [frameRate, setFrameRate] = useState('30 fps');
  const [camera, setCamera] = useState(CAMERA_MOVEMENTS[0]);
  const [animation, setAnimation] = useState(ANIMATION_STYLES[0]);
  const [lighting, setLighting] = useState(LIGHTING_OPTIONS[0]);
  const [background, setBackground] = useState(BACKGROUND_OPTIONS[0]);
  const [model, setModel] = useState(MODEL_OPTIONS[0]);
  const [motionStrength, setMotionStrength] = useState(55);
  const [creativity, setCreativity] = useState(60);
  const [characterConsistency, setCharacterConsistency] = useState(true);
  const [seed, setSeed] = useState('482913');

  const activeGrade = COLOR_GRADES.find((g) => g.id === selectedGrade)!;
  const filteredStyles = category === 'All' ? STYLE_LIBRARY : STYLE_LIBRARY.filter((s) => s.category === category);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left: Prompt workspace */}
      <div className="xl:col-span-2 space-y-6">
        <Section title="Prompt Workspace" hint="Describe the scene, subject, camera move and mood you want.">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300">Text Prompt</label>
                <button
                  onClick={() => setPrompt((p) => (p ? `${p}, cinematic lighting, ultra detailed, 4K` : p))}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-300"
                >
                  <Sparkles size={12} /> Enhance with AI
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="A sleek 15-second product advertisement, studio lighting, slow orbit camera, premium commercial feel…"
                className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-3 text-[13px] outline-none focus:border-purple-400 dark:focus:border-purple-600"
              />
            </div>
            <div>
              <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">Negative Prompt</label>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                rows={2}
                placeholder="flicker, warping, extra limbs, watermark, low quality…"
                className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-3 text-[13px] outline-none focus:border-purple-400 dark:focus:border-purple-600"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-[12px] font-bold text-slate-600 dark:text-slate-300">
                <Copy size={12} /> Copy Prompt
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-[12px] font-bold text-slate-600 dark:text-slate-300">
                <Save size={12} /> Save Prompt
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-[12px] font-bold text-slate-600 dark:text-slate-300">
                <Star size={12} /> Favorite
              </button>
              <button
                onClick={() => { setPrompt(''); setNegativePrompt(''); }}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-[12px] font-bold text-slate-600 dark:text-slate-300"
              >
                <RefreshCcw size={12} /> Clear
              </button>
            </div>
          </div>
        </Section>

        <Section title="Prompt Templates">
          <div className="grid sm:grid-cols-2 gap-2.5">
            {QUICK_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setPrompt(t.prompt)}
                className="text-left rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
              >
                <p className="text-[12.5px] font-bold">{t.label}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{t.prompt}</p>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Style Library">
          <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
            {STYLE_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-bold ${
                  category === c ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {filteredStyles.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id)}
                className={`rounded-xl overflow-hidden border-2 transition-colors ${
                  selectedStyle === s.id ? 'border-purple-500' : 'border-transparent'
                }`}
              >
                <img src={s.thumb} alt={s.name} className="w-full h-16 object-cover" />
                <p className="px-1.5 py-1 text-[10.5px] font-bold truncate bg-white dark:bg-[#0b0b14]">{s.name}</p>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Color Grade" hint="The color grade is a look applied on top of the AI generation - like a colorist's final pass.">
          <div className="grid sm:grid-cols-2 gap-2.5">
            {COLOR_GRADES.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id)}
                className={`text-left flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                  selectedGrade === g.id
                    ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800'
                }`}
              >
                <span
                  className="w-9 h-9 rounded-lg shrink-0"
                  style={{ backgroundImage: `linear-gradient(135deg, ${g.swatch[0]}, ${g.swatch[1]})` }}
                />
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-bold">{g.name}</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{g.description}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-purple-50/70 dark:bg-purple-500/8 border border-purple-100 dark:border-purple-900/30 p-3 flex items-start gap-2.5">
            <span
              className="w-7 h-7 rounded-md shrink-0 mt-0.5"
              style={{ backgroundImage: `linear-gradient(135deg, ${activeGrade.swatch[0]}, ${activeGrade.swatch[1]})` }}
            />
            <p className="text-[12px] text-purple-800 dark:text-purple-200 leading-snug">
              <span className="font-black">{activeGrade.name}</span> - {activeGrade.description}. This grade will be baked into
              the final render; you can always switch it later from the Editor's Color Correction panel.
            </p>
          </div>
        </Section>
      </div>

      {/* Right: Generation settings */}
      <div className="space-y-6">
        <Section title="Generation Settings">
          <div className="space-y-4">
            <div>
              <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">AI Model</label>
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2.5 text-[12.5px] font-semibold outline-none"
                >
                  {MODEL_OPTIONS.map((m) => <option key={m}>{m}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">Duration</label>
              <PillGroup options={['0:08', '0:12', '0:15', '0:24', '0:30']} value={duration} onChange={setDuration} />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">Resolution</label>
              <PillGroup options={RESOLUTIONS} value={resolution} onChange={setResolution} />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">Aspect Ratio</label>
              <PillGroup options={ASPECT_RATIOS} value={ratio} onChange={setRatio} />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">Frame Rate</label>
              <PillGroup options={FRAME_RATES} value={frameRate} onChange={setFrameRate} />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">Camera Movement</label>
              <PillGroup options={CAMERA_MOVEMENTS} value={camera} onChange={setCamera} />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">Animation Style</label>
              <PillGroup options={ANIMATION_STYLES} value={animation} onChange={setAnimation} />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">Lighting</label>
              <PillGroup options={LIGHTING_OPTIONS} value={lighting} onChange={setLighting} />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">Background</label>
              <PillGroup options={BACKGROUND_OPTIONS} value={background} onChange={setBackground} />
            </div>

            <Slider label="Motion Strength" value={motionStrength} onChange={setMotionStrength} />
            <Slider label="Creativity Level" value={creativity} onChange={setCreativity} />

            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5">
              <span className="text-[12.5px] font-bold text-slate-600 dark:text-slate-300">Character Consistency</span>
              <button
                onClick={() => setCharacterConsistency((v) => !v)}
                className={`relative h-6 w-11 rounded-full transition-colors ${characterConsistency ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${characterConsistency ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">Seed Value</label>
              <div className="flex gap-2">
                <input
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2.5 text-[12.5px] font-semibold outline-none"
                />
                <button
                  onClick={() => setSeed(String(Math.floor(Math.random() * 999999)))}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-slate-500 dark:text-slate-400"
                >
                  <Dices size={15} />
                </button>
              </div>
            </div>

            <button className="btn-primary w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition-transform hover:-translate-y-0.5">
              <Wand2 size={16} /> Generate Video
            </button>
          </div>
        </Section>

        <Section title="Prompt History">
          <div className="space-y-2.5">
            {PROMPT_HISTORY.map((p) => (
              <button
                key={p.id}
                onClick={() => setPrompt(p.prompt)}
                className="w-full text-left rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:border-purple-300 dark:hover:border-purple-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-purple-600 dark:text-purple-300">{p.style}</span>
                  <span className="text-[10px] text-slate-400">{p.createdAt}</span>
                </div>
                <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-300 line-clamp-2">{p.prompt}</p>
              </button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
