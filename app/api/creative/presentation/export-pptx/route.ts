import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ExportSlide = {
  title?: string;
  layout?: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  notes?: string;
  thumbData?: string | null;
};

function safeFileName(title: string): string {
  return (
    title
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60) || 'MaVionix-Presentation'
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slides = (body?.slides || []) as ExportSlide[];
    const deckTitle = String(body?.title || slides[0]?.title || 'MaVionix Presentation');

    if (!Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: 'No slides to export' }, { status: 400 });
    }

    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: 'WIDESCREEN_16x9', width: 13.333, height: 7.5 });
    pptx.layout = 'WIDESCREEN_16x9';
    pptx.author = 'MaVionix';
    pptx.title = deckTitle;
    pptx.subject = 'Generated with MaVionix AI Presentation Builder';

    for (const slide of slides.slice(0, 60)) {
      const s = pptx.addSlide();
      s.background = { color: '0B0B14' };

      const imageData = typeof slide.thumbData === 'string' && slide.thumbData.startsWith('data:')
        ? slide.thumbData
        : null;
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

      s.addText(String(slide.layout || 'SLIDE').toUpperCase(), {
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

      const notes = String(slide.notes || '').trim();
      if (notes && !/^(true|false|none|null)$/i.test(notes)) {
        s.addNotes(notes);
      }
    }

    const buffer = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;
    const filename = `${safeFileName(deckTitle)}.pptx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('PPTX export failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to export PPTX' },
      { status: 500 },
    );
  }
}
