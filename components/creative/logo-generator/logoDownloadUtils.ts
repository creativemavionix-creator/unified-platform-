import type { LogoVariation } from "@/services/logoGenerator";

export function downloadSvg(variation: LogoVariation, filename?: string) {
  const blob = new Blob([variation.svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  triggerDownload(blob, filename ?? `${variation.id}.svg`);
}

export async function downloadPng(variation: LogoVariation, filename?: string) {
  const img = new Image();
  img.src = variation.imageUrl;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.85;
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);

  canvas.toBlob((blob) => {
    if (blob) triggerDownload(blob, filename ?? `${variation.id}.png`);
  }, "image/png");
}

export function downloadPdf(variation: LogoVariation, filename?: string) {
  const popup = window.open("", "_blank");
  if (!popup) return;

  popup.document.write(`
    <!DOCTYPE html>
    <html><head><title>Logo Export</title>
    <style>
      body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
      @media print { @page { margin: 1in; } }
    </style></head>
    <body>${variation.svgMarkup}</body></html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
  popup.document.title = filename ?? `${variation.id}.pdf`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
