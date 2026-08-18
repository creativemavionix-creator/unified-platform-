import type { Slide } from '@/components/creative/presentation-builder/presentationMockData';

export type ExportableSlide = Pick<
  Slide,
  'title' | 'layout' | 'thumb' | 'notes' | 'bullets' | 'subtitle' | 'body'
>;

function safeFileName(title: string): string {
  return (
    title
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60) || 'MaVionix-Presentation'
  );
}

async function imageToDataUrl(src: string | undefined): Promise<string | null> {
  if (!src || typeof window === 'undefined') return null;
  try {
    if (src.startsWith('data:')) return src;
    const absolute = src.startsWith('http')
      ? src
      : `${window.location.origin}${src.startsWith('/') ? '' : '/'}${src}`;
    const res = await fetch(absolute);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Build and download a .pptx via the Next.js API route (server-side pptxgenjs).
 * Keeps Node-only modules out of the client webpack bundle.
 */
export async function downloadPresentationPptx(
  slides: ExportableSlide[],
  options?: { title?: string },
): Promise<void> {
  if (!slides.length) throw new Error('No slides to export');
  if (typeof window === 'undefined') throw new Error('Export is only available in the browser');

  const deckTitle = options?.title || slides[0]?.title || 'MaVionix Presentation';

  const payloadSlides = [];
  for (const slide of slides) {
    payloadSlides.push({
      title: slide.title,
      layout: slide.layout,
      subtitle: slide.subtitle,
      body: slide.body,
      bullets: slide.bullets,
      notes: slide.notes,
      thumbData: await imageToDataUrl(slide.thumb),
    });
  }

  const res = await fetch('/api/creative/presentation/export-pptx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: deckTitle, slides: payloadSlides }),
  });

  if (!res.ok) {
    let detail = 'Failed to export PPTX';
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) detail = data.error;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFileName(deckTitle)}.pptx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
