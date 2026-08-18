import React from 'react';
import type { Slide } from '../data/presentationMockData';

function isCoverSlide(slide: Slide): boolean {
  return /title|cover/i.test(slide.layout || '') || /cover/i.test(slide.title || '');
}

type Props = {
  slide: Slide;
  compact?: boolean;
  className?: string;
};

export default function SlideCanvas({ slide, compact = false, className = '' }: Props) {
  const cover = isCoverSlide(slide);
  const bullets = (slide.bullets || []).filter(Boolean).slice(0, compact ? 3 : 5);

  const pad = compact ? 'p-2.5' : 'p-7 sm:p-9 lg:p-11';
  const layoutCls = compact
    ? 'text-[7px] tracking-[0.18em]'
    : 'text-[10px] sm:text-[11px] tracking-[0.22em]';
  const titleCls = compact
    ? 'text-[11px] leading-tight mt-1'
    : cover
      ? 'text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mt-3'
      : 'text-2xl sm:text-3xl lg:text-[2.15rem] leading-[1.15] mt-2.5';
  const subCls = compact ? 'text-[8px] mt-0.5 line-clamp-1' : 'text-sm sm:text-base mt-2.5';
  const bodyCls = compact ? 'text-[7px] mt-1 line-clamp-2' : 'text-[13px] sm:text-[14px] mt-3 leading-relaxed';
  const bulletCls = compact ? 'text-[7px] leading-snug' : 'text-[13px] sm:text-[14.5px] leading-snug';

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden bg-[#0a0a12] text-white ${className}`}
      style={{ boxShadow: compact ? undefined : '0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.12)' }}
    >
      {cover ? (
        <>
          <img src={slide.thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/35" />
          <div className={`absolute inset-0 flex flex-col justify-end ${pad}`}>
            <p className={`${layoutCls} font-black uppercase text-violet-300/90`}>{slide.layout}</p>
            <h2 className={`${titleCls} font-black tracking-tight`}>{slide.title}</h2>
            {slide.subtitle ? <p className={`${subCls} text-violet-100/90 font-medium`}>{slide.subtitle}</p> : null}
            {!compact && slide.body ? <p className={`${bodyCls} max-w-3xl text-white/80`}>{slide.body}</p> : null}
            {bullets.length > 0 && (
              <ul className={`mt-3 space-y-1.5 ${compact ? 'mt-1.5 space-y-0.5' : 'mt-4 space-y-2.5'} max-w-2xl`}>
                {bullets.map((b, i) => (
                  <li key={i} className={`flex gap-2 ${bulletCls} text-white/95`}>
                    <span className={`mt-[0.4em] shrink-0 rounded-full bg-violet-400 ${compact ? 'h-1 w-1' : 'h-1.5 w-1.5'}`} />
                    <span className={compact ? 'line-clamp-1' : ''}>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-y-0 right-0 w-[48%]">
            <img src={slide.thumb} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0a0a12]" />
          </div>
          <div className="absolute inset-0 bg-[#0a0a12]" style={{ clipPath: 'polygon(0 0, 58% 0, 52% 100%, 0 100%)' }} />
          <div className={`absolute inset-y-0 left-0 w-[54%] flex flex-col justify-center ${pad}`}>
            <p className={`${layoutCls} font-black uppercase text-violet-300/90`}>{slide.layout}</p>
            <h2 className={`${titleCls} font-black tracking-tight`}>{slide.title}</h2>
            {slide.subtitle ? <p className={`${subCls} text-violet-100/85 font-medium`}>{slide.subtitle}</p> : null}
            {!compact && slide.body ? <p className={`${bodyCls} text-slate-200/90`}>{slide.body}</p> : null}
            {bullets.length > 0 && (
              <ul className={`${compact ? 'mt-1.5 space-y-0.5' : 'mt-4 space-y-2.5'}`}>
                {bullets.map((b, i) => (
                  <li key={i} className={`flex gap-2 ${bulletCls} text-white/95`}>
                    <span className={`mt-[0.4em] shrink-0 rounded-full bg-violet-400 ${compact ? 'h-1 w-1' : 'h-1.5 w-1.5'}`} />
                    <span className={compact ? 'line-clamp-1' : ''}>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
