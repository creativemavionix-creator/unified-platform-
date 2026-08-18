import { useState } from 'react';
import {
  Sparkles, LayoutTemplate, PenLine, Palette, Search, ImagePlus, Wand2, ArrowRight,
} from 'lucide-react';
import { AI_TOOLS, AI_ACTIVITIES } from '../../../../data/siteBuilderMockData';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const ICONS: Record<string, React.ElementType> = {
  Sparkles, LayoutTemplate, PenLine, Palette, Search, ImagePlus, Wand2,
};

export default function AiToolsTab() {
  const [active, setActive] = useState(AI_TOOLS[0].id);
  const tool = AI_TOOLS.find((t) => t.id === active)!;
  const Icon = ICONS[tool.icon] ?? Sparkles;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black">AI Website Features</h2>
        <p className="text-sm text-slate-400 mt-1">Every AI tool built into the Site Builder module, in one place.</p>
      </div>

      <div className="reveal-up rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14]">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-purple-600 dark:text-purple-300">
          <Sparkles size={13} /> Prompt-to-Website
        </p>
        <h3 className="mt-3 text-lg sm:text-xl font-black max-w-2xl">Describe a business, and AI drafts a complete multi-page site — layout, copy, and imagery included.</h3>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. A subscription meal-kit service targeting busy parents"
            className="flex-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-5 py-3 text-sm outline-none focus:border-purple-400 dark:focus:border-purple-600"
          />
          <button className="btn-primary shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-black uppercase tracking-wider hover:-translate-y-0.5 transition-transform">
            Generate Site <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
          {AI_TOOLS.map((t) => {
            const TIcon = ICONS[t.icon] ?? Sparkles;
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`text-left rounded-2xl border p-4 transition-colors ${
                  isActive
                    ? 'border-purple-300 dark:border-purple-700 bg-purple-50/60 dark:bg-purple-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] hover:border-purple-200 dark:hover:border-purple-800'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-300 mb-3">
                  <TIcon size={16} />
                </div>
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-[11.5px] text-slate-400 mt-1 leading-relaxed">{t.description}</p>
              </button>
            );
          })}
        </div>

        <div className={`${card} reveal-up h-fit`}>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-300 mb-3">
            <Icon size={18} />
          </div>
          <p className="text-sm font-black">{tool.name}</p>
          <p className="text-[12px] text-slate-400 mt-1.5 leading-relaxed">{tool.description}</p>

          <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-3">
            <p className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Sample Output</p>
            <p className="text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {tool.id === 't1' && '"MealBox — home page, about, pricing, and contact pages generated with warm, family-first copy."'}
              {tool.id === 't2' && '"3-tier pricing table for a gym: Starter, Pro, and Elite, with a highlighted Pro plan."'}
              {tool.id === 't3' && '"Rewrote: \'We help you grow\' → \'Turn more visitors into paying customers.\'"'}
              {tool.id === 't4' && '"Warm neutral palette: #F5EFE6, #C9A87C, #6B4F3B, #2B2118."'}
              {tool.id === 't5' && '"Title: Anchor Legal — Trusted Business Attorneys in Denver, CO"'}
              {tool.id === 't6' && '"Alt text: \'Team collaborating around a laptop in a bright office.\'"'}
              {tool.id === 't7' && '"Suggested order: Hero → Social Proof → Features → Pricing → FAQ → CTA."'}
            </p>
          </div>

          <button className="btn-primary w-full mt-4 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-[11px] font-black uppercase tracking-wider hover:-translate-y-0.5 transition-transform">
            Run {tool.name} <ArrowRight size={13} />
          </button>
        </div>
      </div>

      <div className={`${card} reveal-up`}>
        <p className={`${label} mb-4`}>Recent AI Activity</p>
        <div className="space-y-3">
          {AI_ACTIVITIES.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <div className="mt-0.5 w-7 h-7 shrink-0 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-300">
                <Sparkles size={13} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">{a.action}</p>
                <p className="text-[11.5px] text-slate-400 truncate">{a.detail}</p>
              </div>
              <span className="ml-auto shrink-0 text-[10.5px] text-slate-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
