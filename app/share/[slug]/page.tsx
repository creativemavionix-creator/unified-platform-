'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Presentation } from 'lucide-react';
import SlideCanvas from '@/components/creative/presentation-builder/SlideCanvas';
import { findDeckByShareSlug, type SavedDeck } from '@/lib/presentation-builder/store';

export default function SharePresentationPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const [deck, setDeck] = useState<SavedDeck | null>(null);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const accent = '#C800FF';

  useEffect(() => {
    setDeck(findDeckByShareSlug(slug));
    setReady(true);
  }, [slug]);

  const slides = deck?.slides || [];
  const slide = slides[index] || null;
  const title = useMemo(() => deck?.title || 'Shared presentation', [deck]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center text-sm text-slate-400">
        Opening shared deck…
      </div>
    );
  }

  if (!deck || slides.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-[#12121c] p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/15 flex items-center justify-center text-purple-300">
            <Presentation size={22} />
          </div>
          <h1 className="text-xl font-black">Share link ready — deck not on this browser</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Preview links open the deck saved in this browser&apos;s Presentation Builder workspace.
            Generate or open the deck here first, then copy the link again.
          </p>
          <Link
            href="/creative?tool=presentation"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white"
            style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
          >
            Open Presentation Builder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white flex flex-col">
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-slate-800">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">Shared preview</p>
          <h1 className="text-base sm:text-lg font-black">{title}</h1>
        </div>
        <p className="text-[12px] text-slate-400 shrink-0">
          {index + 1} / {slides.length}
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl">
          {slide && <SlideCanvas slide={slide} accentHex={accent} />}
        </div>
      </main>

      <footer className="flex items-center justify-center gap-3 px-4 py-5 border-t border-slate-800">
        <button
          type="button"
          disabled={index <= 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-4 py-2 text-xs font-bold disabled:opacity-40"
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <button
          type="button"
          disabled={index >= slides.length - 1}
          onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
          className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
          style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
        >
          Next <ChevronRight size={14} />
        </button>
      </footer>
    </div>
  );
}
