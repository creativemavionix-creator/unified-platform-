import type { Slide } from '../data/presentationMockData';

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
    const absolute = src.startsWith('http') || src.startsWith('data:')
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

export async function downloadPresentationPptx(
  slides: ExportableSlide[],
  options?: { title?: string },
): Promise<void> {
  if (!slides.length) throw new Error('No slides to export');

  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();
  const deckTitle = options?.title || slides[0]?.title || 'MaVionix Presentation';

  pptx.defineLayout({ name: 'WIDESCREEN_16x9', width: 13.333, height: 7.5 });
  pptx.layout = 'WIDESCREEN_16x9';
  pptx.author = 'MaVionix';
  pptx.title = deckTitle;
  pptx.subject = 'Generated with MaVionix AI Presentation Builder';

  for (const slide of slides) {
    const s = pptx.addSlide();
    s.background = { color: '0B0B14' };

    const imageData = await imageToDataUrl(slide.thumb);
    const isCover =
      /title|cover/i.test(slide.layout || '') || /cover/i.test(slide.title || '');

    if (imageData) {
      if (isCover) {
        s.addImage({ data: imageData, x: 0, y: 0, w: 13.333, h: 7.5 });
        s.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 13.333,
          h: 7.5,
          fill: { color: '000000', transparency: 45 },
        });
      } else {
        s.addImage({ data: imageData, x: 6.4, y: 0, w: 6.933, h: 7.5 });
        s.addShape(pptx.ShapeType.rect, {
          x: 5.8,
          y: 0,
          w: 1.2,
          h: 7.5,
          fill: { color: '0B0B14', transparency: 20 },
        });
      }
    }

    const textX = isCover ? 1.1 : 0.55;
    const textW = isCover ? 11 : 5.6;
    let y = isCover ? 2.1 : 1.0;

    s.addText((slide.layout || 'SLIDE').toUpperCase(), {
      x: textX,
      y,
      w: textW,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: 'C4B5FD',
      bold: true,
      charSpacing: 4,
    });
    y += 0.4;

    s.addText(slide.title || 'Untitled', {
      x: textX,
      y,
      w: textW,
      h: 1.1,
      fontSize: isCover ? 40 : 28,
      fontFace: 'Arial',
      color: 'FFFFFF',
      bold: true,
      valign: 'top',
    });
    y += isCover ? 1.15 : 1.0;

    if (slide.subtitle) {
      s.addText(slide.subtitle, {
        x: textX,
        y,
        w: textW,
        h: 0.45,
        fontSize: 16,
        fontFace: 'Arial',
        color: 'DDD6FE',
      });
      y += 0.5;
    }

    if (slide.body) {
      s.addText(slide.body, {
        x: textX,
        y,
        w: textW,
        h: 0.9,
        fontSize: 14,
        fontFace: 'Arial',
        color: 'E2E8F0',
      });
      y += 1.0;
    }

    const bullets = (slide.bullets || []).filter(Boolean).slice(0, 5);
    if (bullets.length) {
      s.addText(
        bullets.map((b) => ({
          text: b,
          options: { bullet: true, breakLine: true },
        })),
        {
          x: textX,
          y,
          w: textW,
          h: Math.min(3.2, bullets.length * 0.55),
          fontSize: 15,
          fontFace: 'Arial',
          color: 'F8FAFC',
          paraSpaceAfter: 8,
        },
      );
    }

    const notes = (slide.notes || '').trim();
    if (notes && !/^(true|false|none|null)$/i.test(notes)) {
      s.addNotes(notes);
    }
  }

  await pptx.writeFile({ fileName: `${safeFileName(deckTitle)}.pptx` });
}
