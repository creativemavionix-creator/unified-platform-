"use client";

import React, { useState } from "react";
import { Sparkles, Star, Copy, Save, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────
// Shared sub-components
// ────────────────────────────────────────────────────────────

function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[12px] font-bold border transition-all",
              value === opt
                ? "border-purple-500 bg-purple-500/15 text-purple-300"
                : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:text-slate-200"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[12px] font-semibold text-slate-400">{label}</span>
        <span className="text-[12px] font-bold text-purple-400">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full cursor-pointer accent-purple-500"
        style={{
          background: `linear-gradient(to right, #a855f7 ${((value - min) / (max - min)) * 100}%, #1e293b ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main AiGeneratePanel
// ────────────────────────────────────────────────────────────

export interface AiGeneratePanelProps {
  // Left panel
  promptPlaceholder: string;
  secondaryLabel: string;
  secondaryInput: React.ReactNode;
  chips: string[];
  generateLabel: string;
  enhanceSuffix?: string;
  // Right panel
  modelOptions: string[];
  settings: React.ReactNode;
  // Results
  resultsLabel: string;
  emptyResultsText: string;
  resultTiles: React.ReactNode;
  // Handlers
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  hasResults: boolean;
}

export function AiGeneratePanel({
  promptPlaceholder,
  secondaryLabel,
  secondaryInput,
  chips,
  generateLabel,
  enhanceSuffix = "with enhanced detail and artistic direction",
  modelOptions,
  settings,
  resultsLabel,
  emptyResultsText,
  resultTiles,
  onGenerate,
  isGenerating,
  hasResults,
}: AiGeneratePanelProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);
  const [starred, setStarred] = useState(false);

  const handleEnhance = () => {
    if (!prompt.trim()) return;
    setPrompt(
      `${prompt.trim()}, ${enhanceSuffix}, high quality, professional result, award-winning design`
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-200">
      <div className="flex gap-5 items-start">
        {/* ── LEFT PANEL ── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Prompt card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c0c14] p-5 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Prompt</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStarred(v => !v)}
                  className={cn("transition-colors", starred ? "text-yellow-400" : "text-slate-600 hover:text-slate-300")}
                >
                  <Star size={14} fill={starred ? "currentColor" : "none"} />
                </button>
                <button type="button" className="text-slate-600 hover:text-slate-300 transition-colors"><Copy size={14} /></button>
                <button type="button" className="text-slate-600 hover:text-slate-300 transition-colors"><Save size={14} /></button>
              </div>
            </div>

            {/* Main textarea */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={promptPlaceholder}
              rows={4}
              className="w-full bg-transparent resize-none text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none leading-relaxed"
            />

            {/* Enhance prompt */}
            <button
              type="button"
              onClick={handleEnhance}
              className="flex items-center gap-1.5 text-[12px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Sparkles size={13} />
              ENHANCE PROMPT
            </button>
          </div>

          {/* Secondary field */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c0c14] p-5 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{secondaryLabel}</span>
            {secondaryInput}
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setPrompt(chip)}
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold border border-slate-700 bg-slate-800/50 text-slate-300 hover:border-purple-500/50 hover:text-purple-300 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={() => onGenerate(prompt)}
            disabled={isGenerating}
            className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 text-[13px] font-black uppercase tracking-wider text-white disabled:opacity-60 transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{
              backgroundImage: "linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)",
              boxShadow: "0 8px 24px -4px rgba(200,0,255,0.40)",
            }}
          >
            {isGenerating ? (
              <><Loader2 size={15} className="animate-spin" />Generating…</>
            ) : (
              <><Sparkles size={15} />{generateLabel}</>
            )}
          </button>

          {/* Results */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c0c14] p-5 space-y-4 min-h-[120px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{resultsLabel}</span>
              {hasResults && (
                <button type="button" className="text-slate-500 hover:text-slate-300 transition-colors"><RefreshCw size={13} /></button>
              )}
            </div>
            {hasResults ? resultTiles : (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-slate-600 text-center">{emptyResultsText}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-64 shrink-0 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-[#0c0c14] p-5 space-y-5">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 block">Generation Settings</span>

            {/* Model */}
            <div className="space-y-2">
              <span className="text-[12px] font-semibold text-slate-400">Model</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              >
                {modelOptions.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>

            {/* Module-specific settings */}
            {settings}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Re-export helpers for use in module files
// ────────────────────────────────────────────────────────────
export { PillGroup, SliderField };
