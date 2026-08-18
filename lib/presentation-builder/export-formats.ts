import type { Slide } from '@/components/creative/presentation-builder/presentationMockData';

function safeFileName(title: string): string {
  return (
    title
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60) || 'MaVionix-Presentation'
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Rasterize a slide to PNG/JPEG via canvas (no extra deps). */
export function renderSlideCanvas(
  slide: Slide,
  options?: { accentHex?: string; width?: number; height?: number },
): HTMLCanvasElement {
  const width = options?.width ?? 1920;
  const height = options?.height ?? 1080;
  const accent = options?.accentHex || '#C800FF';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, width, height);

  // Accent bar
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 12, height);

  const padX = 96;
  let y = 88;

  ctx.fillStyle = accent;
  ctx.font = '600 28px Inter, system-ui, sans-serif';
  ctx.fillText(String(slide.layout || 'SLIDE').toUpperCase(), padX, y);
  y += 72;

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 72px Inter, system-ui, sans-serif';
  for (const line of wrapText(ctx, slide.title || 'Untitled', width - padX * 2).slice(0, 3)) {
    ctx.fillText(line, padX, y);
    y += 84;
  }

  if (slide.subtitle) {
    y += 12;
    ctx.fillStyle = accent;
    ctx.font = '600 36px Inter, system-ui, sans-serif';
    for (const line of wrapText(ctx, slide.subtitle, width - padX * 2).slice(0, 2)) {
      ctx.fillText(line, padX, y);
      y += 48;
    }
  }

  if (slide.body) {
    y += 28;
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.font = '400 32px Inter, system-ui, sans-serif';
    for (const line of wrapText(ctx, slide.body, width - padX * 2).slice(0, 4)) {
      ctx.fillText(line, padX, y);
      y += 44;
    }
  }

  const bullets = (slide.bullets || []).filter(Boolean).slice(0, 5);
  if (bullets.length) {
    y += 36;
    ctx.font = '500 34px Inter, system-ui, sans-serif';
    for (const bullet of bullets) {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(padX + 10, y - 10, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      const lines = wrapText(ctx, bullet, width - padX * 2 - 48).slice(0, 2);
      lines.forEach((line, i) => {
        ctx.fillText(line, padX + 36, y + i * 42);
      });
      y += 42 * Math.max(1, lines.length) + 18;
    }
  }

  return canvas;
}

export async function downloadSlidesAsImages(
  slides: Slide[],
  format: 'png' | 'jpg',
  options?: { title?: string; accentHex?: string },
): Promise<void> {
  if (!slides.length) throw new Error('No slides to export');
  const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const ext = format === 'jpg' ? 'jpg' : 'png';
  const base = safeFileName(options?.title || slides[0]?.title || 'presentation');

  for (let i = 0; i < slides.length; i++) {
    const canvas = renderSlideCanvas(slides[i], { accentHex: options?.accentHex });
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), mime, format === 'jpg' ? 0.92 : undefined),
    );
    if (!blob) throw new Error('Failed to encode slide image');
    downloadBlob(blob, `${base}-slide-${String(i + 1).padStart(2, '0')}.${ext}`);
    // Brief pause so browsers don't coalesce downloads
    await new Promise((r) => setTimeout(r, 180));
  }
}

export function buildPresentationHtml(
  slides: Slide[],
  options?: { title?: string; accentHex?: string },
): string {
  const title = options?.title || slides[0]?.title || 'MaVionix Presentation';
  const accent = options?.accentHex || '#C800FF';
  const slidesHtml = slides
    .map((s, i) => {
      const bullets = (s.bullets || [])
        .filter(Boolean)
        .map((b) => `<li>${escapeHtml(b)}</li>`)
        .join('');
      return `
<section class="slide" id="s${i + 1}">
  <p class="layout">${escapeHtml((s.layout || 'Slide').toUpperCase())}</p>
  <h1>${escapeHtml(s.title || '')}</h1>
  ${s.subtitle ? `<h2>${escapeHtml(s.subtitle)}</h2>` : ''}
  ${s.body ? `<p class="body">${escapeHtml(s.body)}</p>` : ''}
  ${bullets ? `<ul>${bullets}</ul>` : ''}
  ${s.notes ? `<aside class="notes"><strong>Notes:</strong> ${escapeHtml(s.notes)}</aside>` : ''}
</section>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(title)}</title>
<style>
  :root { --accent: ${accent}; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #07070f; color: #fff; }
  .slide { min-height: 100vh; padding: 8vh 10vw; border-bottom: 1px solid #1f1f2e; page-break-after: always; }
  .layout { color: var(--accent); letter-spacing: .2em; font-size: 12px; font-weight: 800; text-transform: uppercase; }
  h1 { font-size: clamp(2rem, 4vw, 3.2rem); margin: .6rem 0 0; line-height: 1.15; }
  h2 { color: var(--accent); font-size: 1.25rem; font-weight: 600; margin: .75rem 0 0; }
  .body { color: rgba(255,255,255,.8); max-width: 42rem; line-height: 1.55; margin-top: 1rem; }
  ul { margin: 1.25rem 0 0; padding: 0; list-style: none; max-width: 42rem; }
  li { position: relative; padding-left: 1.25rem; margin: .65rem 0; color: rgba(255,255,255,.9); line-height: 1.45; }
  li::before { content: ''; position: absolute; left: 0; top: .55em; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
  .notes { margin-top: 2rem; color: #94a3b8; font-size: .9rem; border-top: 1px dashed #334155; padding-top: 1rem; }
  @media print {
    body { background: #fff; color: #0f172a; }
    .slide { min-height: auto; padding: 1.5cm; }
    h2, .layout { color: #7c3aed; }
    li::before { background: #7c3aed; }
    .body, li { color: #1e293b; }
  }
</style>
</head>
<body>
${slidesHtml}
<script>
  document.addEventListener('keydown', (e) => {
    const slides = [...document.querySelectorAll('.slide')];
    const idx = slides.findIndex(s => s.getBoundingClientRect().top >= -20);
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      slides[Math.min(slides.length - 1, Math.max(0, idx) + 1)]?.scrollIntoView({ behavior: 'smooth' });
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      slides[Math.max(0, Math.max(0, idx) - 1)]?.scrollIntoView({ behavior: 'smooth' });
    }
  });
</script>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function downloadPresentationHtml(
  slides: Slide[],
  options?: { title?: string; accentHex?: string },
): void {
  if (!slides.length) throw new Error('No slides to export');
  const html = buildPresentationHtml(slides, options);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, `${safeFileName(options?.title || slides[0]?.title || 'presentation')}.html`);
}

/** Open a print-ready window (use browser Print → Save as PDF). */
export function openPrintablePresentation(
  slides: Slide[],
  options?: { title?: string; accentHex?: string; mode?: 'slides' | 'notes' | 'handout' },
): void {
  if (!slides.length) throw new Error('No slides to export');
  const mode = options?.mode || 'slides';
  const title = options?.title || slides[0]?.title || 'MaVionix Presentation';
  const accent = options?.accentHex || '#C800FF';

  let body = '';
  if (mode === 'notes') {
    body = slides
      .map(
        (s, i) => `
      <div class="row">
        <div class="thumb"><strong>${i + 1}. ${escapeHtml(s.title || '')}</strong>
          <ul>${(s.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
        </div>
        <div class="note">${escapeHtml(s.notes || '—')}</div>
      </div>`,
      )
      .join('');
  } else if (mode === 'handout') {
    body = `<div class="grid">${slides
      .map(
        (s, i) => `
      <div class="card">
        <p class="n">${i + 1}</p>
        <h3>${escapeHtml(s.title || '')}</h3>
        <p>${escapeHtml(s.subtitle || s.body || '')}</p>
      </div>`,
      )
      .join('')}</div>`;
  } else {
    body = buildPresentationHtml(slides, options).replace(/^[\s\S]*<body>/, '').replace(/<\/body>[\s\S]*$/, '');
  }

  const win = window.open('', '_blank');
  if (!win) throw new Error('Pop-up blocked — allow pop-ups to print or save PDF');
  win.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(title)}</title>
    <style>
      body{font-family:Inter,system-ui,sans-serif;padding:24px;color:#0f172a}
      h1{margin-top:0}
      .row{display:grid;grid-template-columns:1fr 1fr;gap:16px;border-bottom:1px solid #e2e8f0;padding:16px 0;page-break-inside:avoid}
      .note{background:#f8fafc;padding:12px;border-radius:8px;white-space:pre-wrap}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      .card{border:1px solid #e2e8f0;border-radius:12px;padding:16px;page-break-inside:avoid}
      .n{color:${accent};font-weight:800;margin:0}
      @media print { body{padding:0} }
    </style></head><body>
    <h1>${escapeHtml(title)}</h1>
    ${body}
    <script>setTimeout(() => { window.print(); }, 350);</script>
    </body></html>`);
  win.document.close();
}
