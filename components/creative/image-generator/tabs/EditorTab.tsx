import React, { useEffect, useRef, useState } from 'react';
import {
  Scissors, Wand2, Eraser, Sparkles, Maximize2, Palette, Layers, Crop,
  RotateCw, Sun, Contrast, Droplet, ImagePlus, Mic,
} from 'lucide-react';
import {
  applyStyle,
  enhanceFace,
  generateImageVariations,
  inpaintImage,
  magicErase,
  outpaintImage,
  removeBackground,
  replaceBackground,
  upscaleImage,
} from '@/lib/image-generator/api';
import { type GeneratedImage, useGeneratedImages } from '@/lib/image-generator/generated-images';
import { parseVoiceCommand, type VoiceTool } from '@/lib/image-generator/voice-commands';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';
const inputClass = 'w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50';

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const AI_TOOLS = [
  { id: 'bg-remove', name: 'Background Removal', icon: Scissors, available: true },
  { id: 'bg-replace', name: 'Background Replacement', icon: ImagePlus, available: true },
  { id: 'inpaint', name: 'Inpainting', icon: Wand2, available: true },
  { id: 'outpaint', name: 'Outpainting', icon: Maximize2, available: true },
  { id: 'obj-remove', name: 'Object Removal', icon: Eraser, available: true },
  { id: 'face-enhance', name: 'Face Enhancement', icon: Sparkles, available: true },
  { id: 'upscale', name: 'Upscaling', icon: Layers, available: true },
  { id: 'magic-eraser', name: 'Magic Eraser', icon: Eraser, available: true },
  { id: 'style-transfer', name: 'Style Transfer', icon: Palette, available: true },
  { id: 'variations', name: 'Image Variations', icon: Wand2, available: true },
];

const ADJUST_TOOLS = [
  { id: 'crop', name: 'Crop', icon: Crop },
  { id: 'resize', name: 'Resize', icon: Maximize2 },
  { id: 'rotate', name: 'Rotate', icon: RotateCw },
  { id: 'blur', name: 'Blur', icon: Droplet },
];

const VOICE_SAFE_APPLY_TOOLS = new Set<VoiceTool>(['bg-remove', 'face-enhance', 'upscale', 'style-transfer', 'variations']);

export default function EditorTab() {
  const { images, loading: imagesLoading, error: imagesError } = useGeneratedImages();
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null);
  const [activeTool, setActiveTool] = useState('bg-remove');
  const [prompt, setPrompt] = useState('seamless continuation of the scene, natural extension');
  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [saturation, setSaturation] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(48);
  const [hasMask, setHasMask] = useState(false);
  const [backgroundMode, setBackgroundMode] = useState<'color' | 'image'>('color');
  const [backgroundColor, setBackgroundColor] = useState('#3498db');
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [style, setStyle] = useState('oil_painting');
  const [variationUrls, setVariationUrls] = useState<string[]>([]);
  const [voiceMode, setVoiceMode] = useState<'prompt' | 'command' | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskOverlayRef = useRef<HTMLCanvasElement>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const voiceRecognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (!activeImage && images[0]) setActiveImage(images[0]);
  }, [activeImage, images]);

  if (!activeImage) return <div className={`${card} py-16 text-center text-sm text-slate-400`}>{imagesError ?? (imagesLoading ? 'Loading generated images…' : 'Generate an image before opening the editor.')}</div>;

  const urlToFile = async (url: string, fileName: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Could not load source image: ${response.status}`);
    }
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type || 'image/png' });
  };

  const createMaskFile = async () => {
    const canvas = maskCanvasRef.current;
    if (!canvas || !hasMask) {
      throw new Error('Paint the area you want to edit before applying inpainting.');
    }
    return await new Promise<File>((resolve, reject) => {
      canvas.toBlob((maskBlob) => {
        if (!maskBlob) {
          reject(new Error('Could not build an edit mask.'));
          return;
        }
        resolve(new File([maskBlob], 'mask.png', { type: 'image/png' }));
      }, 'image/png');
    });
  };

  const initializeMask = (width: number, height: number) => {
    const maskCanvas = maskCanvasRef.current;
    const overlayCanvas = maskOverlayRef.current;
    if (!maskCanvas || !overlayCanvas) return;

    [maskCanvas, overlayCanvas].forEach((canvas) => {
      canvas.width = width;
      canvas.height = height;
    });
    const maskContext = maskCanvas.getContext('2d');
    if (!maskContext) return;
    maskContext.fillStyle = 'black';
    maskContext.fillRect(0, 0, width, height);
    setHasMask(false);
  };

  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    const overlayCanvas = maskOverlayRef.current;
    if (!maskCanvas || !overlayCanvas) return;
    const maskContext = maskCanvas.getContext('2d');
    const overlayContext = overlayCanvas.getContext('2d');
    if (!maskContext || !overlayContext) return;
    maskContext.fillStyle = 'black';
    maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    setHasMask(false);
  };

  const getMaskPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
    };
  };

  const paintMask = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const maskContext = maskCanvasRef.current?.getContext('2d');
    const overlayContext = maskOverlayRef.current?.getContext('2d');
    if (!maskContext || !overlayContext) return;
    [maskContext, overlayContext].forEach((context, index) => {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = brushSize;
      context.strokeStyle = index === 0 ? 'white' : 'rgba(196, 70, 255, 0.45)';
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    });
    setHasMask(true);
  };

  const startPainting = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = getMaskPoint(event);
    lastPointRef.current = point;
    paintMask(point, point);
  };

  const continuePainting = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!lastPointRef.current) return;
    const point = getMaskPoint(event);
    paintMask(lastPointRef.current, point);
    lastPointRef.current = point;
  };

  const stopPainting = () => {
    lastPointRef.current = null;
  };

  const runTool = async (toolToRun = activeTool, styleToUse = style) => {
    if (processing) return;
    if ((toolToRun === 'inpaint' || toolToRun === 'obj-remove' || toolToRun === 'magic-eraser') && !hasMask) {
      setError('Paint the area you want to edit before applying this tool.');
      return;
    }
    if (toolToRun === 'bg-replace' && backgroundMode === 'image' && !backgroundImage) {
      setError('Choose a background image before applying background replacement.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const sourceFile = await urlToFile(activeImage.url, 'source.png');

      if (toolToRun === 'bg-remove') {
        const result = await removeBackground({ image: sourceFile });
        setActiveImage((current) => current ? { ...current, url: result.url } : current);
      } else if (toolToRun === 'bg-replace') {
        const result = await replaceBackground({
          image: sourceFile,
          mode: backgroundMode,
          backgroundColor: backgroundMode === 'color' ? backgroundColor : undefined,
          backgroundImage: backgroundMode === 'image' ? backgroundImage ?? undefined : undefined,
        });
        setActiveImage((current) => current ? { ...current, url: result.url } : current);
      } else if (toolToRun === 'inpaint' || toolToRun === 'obj-remove') {
        const maskFile = await createMaskFile();
        const result = await inpaintImage({
          image: sourceFile,
          mask: maskFile,
          prompt: prompt.trim() || (toolToRun === 'obj-remove' ? 'seamless background, naturally filled' : 'refined image edit'),
        });
        setActiveImage((current) => current ? { ...current, url: result.url } : current);
      } else if (toolToRun === 'magic-eraser') {
        const result = await magicErase({ image: sourceFile, mask: await createMaskFile() });
        setActiveImage((current) => current ? { ...current, url: result.url } : current);
      } else if (toolToRun === 'outpaint') {
        const result = await outpaintImage({
          image: sourceFile,
          expandPx: 128,
          prompt: prompt.trim() || undefined,
        });
        setActiveImage((current) => current ? { ...current, url: result.url } : current);
      } else if (toolToRun === 'face-enhance') {
        const result = await enhanceFace({ image: sourceFile });
        setActiveImage((current) => current ? { ...current, url: result.url } : current);
      } else if (toolToRun === 'upscale') {
        const result = await upscaleImage({ image: sourceFile });
        setActiveImage((current) => current ? { ...current, url: result.url } : current);
      } else if (toolToRun === 'style-transfer') {
        const result = await applyStyle({ image: sourceFile, style: styleToUse });
        setActiveImage((current) => current ? { ...current, url: result.url } : current);
      } else if (toolToRun === 'variations') {
        const results = await generateImageVariations({ image: sourceFile, count: 4 });
        if (!results.length) throw new Error('The variation service returned no images.');
        setVariationUrls(results.map((result) => result.url));
        setActiveImage((current) => current ? { ...current, url: results[0].url } : current);
      } else {
        setError('This tool is not wired yet.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Tool execution failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleVoiceCommand = (transcript: string) => {
    const command = parseVoiceCommand(transcript);
    if (!command) {
      setError('I could not match that voice command. Try “remove background”, “enhance face”, or “apply watercolor”.');
      return;
    }

    if (!command.tool) {
      void runTool();
      return;
    }

    setActiveTool(command.tool);
    if (command.style) setStyle(command.style);

    if (command.apply && VOICE_SAFE_APPLY_TOOLS.has(command.tool)) {
      void runTool(command.tool, command.style ?? style);
      return;
    }

    const toolName = AI_TOOLS.find((tool) => tool.id === command.tool)?.name ?? 'tool';
    const requirement = command.tool === 'bg-replace'
      ? 'Choose a background color or image before applying it.'
      : command.tool === 'inpaint' || command.tool === 'obj-remove' || command.tool === 'magic-eraser'
        ? 'Paint the area to edit before applying it.'
        : command.tool === 'outpaint'
          ? 'Describe the extension in the edit prompt before applying it.'
          : 'Use Apply Tool when you are ready.';
    setVoiceTranscript(`${toolName} selected. ${requirement}`);
  };

  const startListening = (mode: 'prompt' | 'command') => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setError('Voice input is not available in this browser. Use a Chromium-based browser or type your edit.');
      return;
    }

    voiceRecognitionRef.current?.stop();
    const recognition = new Recognition();
    voiceRecognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = '';
      let finalTranscript = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        transcript += result[0].transcript;
        if (result.isFinal) finalTranscript += result[0].transcript;
      }
      setVoiceTranscript(transcript.trim());
      if (finalTranscript.trim()) {
        if (mode === 'prompt') setPrompt(finalTranscript.trim());
        else handleVoiceCommand(finalTranscript.trim());
      }
    };
    recognition.onerror = (event) => {
      setError(event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Microphone permission was denied. Allow microphone access and try again.'
        : `Voice input failed: ${event.error}.`);
    };
    recognition.onend = () => {
      if (voiceRecognitionRef.current === recognition) voiceRecognitionRef.current = null;
      setVoiceMode(null);
    };

    try {
      setError(null);
      setVoiceTranscript('');
      setVoiceMode(mode);
      recognition.start();
    } catch (error) {
      setVoiceMode(null);
      setError(error instanceof Error ? error.message : 'Could not start voice input.');
    }
  };

  const speechSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_300px] gap-6">
      {/* AI tools */}
      <div className={`${card} reveal-up`}>
        <span className={label}>AI Editing Tools</span>
        <div className="mt-3 space-y-1.5">
          {AI_TOOLS.map((t) => {
            const Icon = t.icon;
            const active = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => t.available && setActiveTool(t.id)} disabled={!t.available}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold transition-colors ${
                  active ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300' : t.available ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60' : 'cursor-not-allowed text-slate-400 opacity-60'
                }`}
              >
                <Icon size={16} />
                {t.name}{!t.available && <span className="ml-auto text-[9px] uppercase tracking-wide">Coming soon</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas */}
      <div className={`${card} reveal-up`}>
        <div className="flex items-center justify-between">
          <span className={label}>Canvas</span>
          <button
            type="button"
            onClick={() => startListening('command')}
            disabled={processing || voiceMode !== null}
            aria-label="Start voice command"
            title={speechSupported ? 'Say a voice command' : 'Voice input is unavailable in this browser'}
            className="ml-auto mr-2 inline-flex items-center gap-1.5 rounded-full border border-purple-200 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-purple-700 disabled:opacity-50 dark:border-purple-800 dark:text-purple-300"
          >
            <Mic size={13} /> {voiceMode === 'command' ? 'Listening...' : 'Voice'}
          </button>
          <button
            onClick={() => void runTool()}
            disabled={processing}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white disabled:opacity-70"
            style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
          >
            <Wand2 size={13} /> {processing ? 'Applying…' : 'Apply Tool'}
          </button>
        </div>
        {(activeTool === 'inpaint' || activeTool === 'obj-remove' || activeTool === 'outpaint') && <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Edit Prompt</span>
            <button
              type="button"
              onClick={() => startListening('prompt')}
              disabled={processing || voiceMode !== null}
              aria-label="Dictate edit prompt"
              title={speechSupported ? 'Dictate an edit prompt' : 'Voice input is unavailable in this browser'}
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 disabled:opacity-50 dark:text-purple-300"
            >
              <Mic size={13} /> {voiceMode === 'prompt' ? 'Listening...' : 'Dictate'}
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className={`${inputClass} mt-1.5 resize-none`}
            placeholder="Describe the edit you want to apply..."
          />
        </div>}
        {activeTool === 'bg-replace' && (
          <div className="mt-3 grid gap-2 text-sm">
            <select value={backgroundMode} onChange={(event) => setBackgroundMode(event.target.value as 'color' | 'image')} className={inputClass}>
              <option value="color">Solid color</option>
              <option value="image">Background image</option>
            </select>
            {backgroundMode === 'color' ? (
              <input type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} className="h-10 w-full rounded-xl" aria-label="Background color" />
            ) : (
              <input type="file" accept="image/*" onChange={(event) => setBackgroundImage(event.target.files?.[0] ?? null)} className={inputClass} />
            )}
          </div>
        )}
        {activeTool === 'style-transfer' && (
          <div className="mt-3">
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Style</span>
            <select value={style} onChange={(event) => setStyle(event.target.value)} className={`${inputClass} mt-1.5`}>
              <option value="oil_painting">Oil painting</option>
              <option value="watercolor">Watercolor</option>
              <option value="pencil_sketch">Pencil sketch</option>
              <option value="cartoon">Cartoon</option>
              <option value="anime">Anime</option>
            </select>
          </div>
        )}
        {(activeTool === 'inpaint' || activeTool === 'obj-remove' || activeTool === 'magic-eraser') && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>{activeTool === 'magic-eraser' ? 'Paint the object to remove' : 'Paint the area to regenerate'}</span>
            <label className="flex items-center gap-2">Brush
              <input type="range" min={12} max={120} value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} className="w-24 accent-purple-600" />
            </label>
            <button type="button" onClick={clearMask} className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-300">Clear mask</button>
          </div>
        )}
        <div className="mt-4 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center min-h-[380px] relative">
          <div className="relative max-h-[420px]">
            <img
              key={`${activeImage.url}-${activeTool}`}
              src={activeImage.url}
              alt={activeImage.prompt}
              onLoad={(event) => initializeMask(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)}
              className={`block max-h-[420px] object-contain transition-all ${processing ? 'opacity-40 blur-sm' : ''}`}
              style={{ filter: `brightness(${0.6 + brightness / 100}) contrast(${0.6 + contrast / 100}) saturate(${0.4 + saturation / 60})` }}
            />
            <canvas ref={maskCanvasRef} className="hidden" />
            {(activeTool === 'inpaint' || activeTool === 'obj-remove' || activeTool === 'magic-eraser') && (
              <canvas
                ref={maskOverlayRef}
                onPointerDown={startPainting}
                onPointerMove={continuePainting}
                onPointerUp={stopPainting}
                onPointerCancel={stopPainting}
                className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
                aria-label="Inpainting mask canvas"
              />
            )}
          </div>
          {processing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            </div>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        {voiceTranscript && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Voice: {voiceTranscript}</p>}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {ADJUST_TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-[10.5px] font-bold text-slate-500 hover:border-purple-300 dark:hover:border-purple-700">
                <Icon size={15} />
                {t.name}
              </button>
            );
          })}
        </div>
        {variationUrls.length > 0 && (
          <div className="mt-4">
            <span className={label}>Variations</span>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {variationUrls.map((url) => (
                <button key={url} onClick={() => setActiveImage((current) => current ? { ...current, url } : current)} className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden ring-2 ${activeImage.url === url ? 'ring-purple-500' : 'ring-transparent'}`}>
                  <img src={url} className="w-full h-full object-cover" alt="Generated variation" />
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {images.slice(0, 8).map((img) => (
            <button key={img.id} onClick={() => setActiveImage(img)} className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden ring-2 ${activeImage.id === img.id ? 'ring-purple-500' : 'ring-transparent'}`}>
              <img src={img.url} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      </div>

      {/* Adjustments */}
      <div className={`${card} reveal-up`}>
        <span className={label}>Color & Adjustments</span>
        <div className="mt-4 space-y-4">
          {[
            { name: 'Brightness', value: brightness, setter: setBrightness, icon: Sun },
            { name: 'Contrast', value: contrast, setter: setContrast, icon: Contrast },
            { name: 'Saturation', value: saturation, setter: setSaturation, icon: Droplet },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.name}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300"><Icon size={13} /> {s.name}</span>
                  <span className="text-[12px] font-bold text-purple-600 dark:text-purple-300">{s.value}</span>
                </div>
                <input type="range" min={0} max={100} value={s.value} onChange={(e) => s.setter(Number(e.target.value))} className="mt-1.5 w-full accent-purple-600" />
              </div>
            );
          })}
        </div>
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className={label}>Color Correction</span>
          <div className="mt-2.5 flex gap-2">
            {['#C800FF', '#7C3AED', '#0F172A', '#F97316', '#22C55E'].map((c) => (
              <button key={c} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 shadow" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
