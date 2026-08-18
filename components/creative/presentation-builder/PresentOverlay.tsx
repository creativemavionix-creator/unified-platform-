'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import SlideCanvas from './SlideCanvas';
import type { Slide } from './presentationMockData';

export type PresentMode = 'present' | 'presenter';

type Props = {
  slides: Slide[];
  startIndex?: number;
  mode?: PresentMode;
  accentHex?: string;
  onClose: () => void;
};

export default function PresentOverlay({
  slides,
  startIndex = 0,
  mode = 'present',
  accentHex = '#a78bfa',
  onClose,
}: Props) {
  const [index, setIndex] = React.useState(() =>
    Math.min(Math.max(0, startIndex), Math.max(0, slides.length - 1)),
  );
  const indexRef = useRef(index);
  indexRef.current = index;

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= slides.length) return;
      setIndex(next);
    },
    [slides.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        const i = indexRef.current;
        if (i < slides.length - 1) goTo(i + 1);
        else onClose();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(indexRef.current - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, onClose, slides.length]);

  if (!slides.length) return null;

  const slide = slides[index];
  const nextSlide = slides[index + 1];
  const notes = (slide.notes || '').trim();
  const isPresenter = mode === 'presenter';

  return (
    <div className="fixed inset-0 z-[90] bg-black flex flex-col text-white">
      <div className="flex items-center justify-between px-4 py-2 text-white/80 text-xs shrink-0">
        <span className="tabular-nums font-semibold">
          {index + 1} / {slides.length}
          {isPresenter ? ' · Presenter view' : ''}
        </span>
        <p className="hidden sm:block text-white/50">← → or Space · Esc to exit</p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20"
        >
          <X size={14} /> Exit
        </button>
      </div>

      {isPresenter ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] gap-4 p-4 min-h-0">
          <div
            className="flex items-center justify-center min-h-0 cursor-pointer"
            onClick={() => {
              if (index < slides.length - 1) goTo(index + 1);
              else onClose();
            }}
          >
            <div className="w-full max-w-5xl pointer-events-none">
              <SlideCanvas slide={slide} accentHex={accentHex} />
            </div>
          </div>
          <div className="flex flex-col gap-3 min-h-0 overflow-y-auto">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">Speaker notes</p>
              <p className="mt-3 text-sm leading-relaxed text-white/85 whitespace-pre-wrap">
                {notes || 'No notes on this slide.'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Up next</p>
              {nextSlide ? (
                <div className="opacity-90">
                  <SlideCanvas slide={nextSlide} compact accentHex={accentHex} />
                  <p className="mt-2 text-xs font-semibold text-white/70 truncate">{nextSlide.title}</p>
                </div>
              ) : (
                <p className="text-xs text-white/50">End of deck</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="flex-1 flex items-center justify-center p-4 cursor-pointer min-h-0"
          onClick={() => {
            if (index < slides.length - 1) goTo(index + 1);
            else onClose();
          }}
        >
          <div className="w-full max-w-6xl pointer-events-none">
            <SlideCanvas slide={slide} accentHex={accentHex} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-6 pb-4 text-white/70 text-sm shrink-0">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="inline-flex items-center gap-1 disabled:opacity-30 hover:text-white"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={index === slides.length - 1}
          className="inline-flex items-center gap-1 disabled:opacity-30 hover:text-white"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
