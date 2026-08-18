"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Video,
  Diamond,
  Fingerprint,
  Presentation,
  Brush,
  Film,
  Volume2,
  FolderHeart,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  FileAudio,
  Sparkles,
  Download,
  BarChart3,
  Layers,
  Code2,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ImageGeneratorWorkspace from "@/components/creative/image-generator/ImageGeneratorWorkspace";
import VideoGeneratorWorkspace from "@/components/creative/video-generator/VideoGeneratorWorkspace";
import { AiGeneratePanel, PillGroup, SliderField } from "@/components/creative/AiGeneratePanel";
import PresentationWorkspace from "@/components/creative/presentation-builder/PresentationWorkspace";
import { LogoGeneratorView } from "@/components/creative/logo-generator/LogoGeneratorView";
import UiUxLayoutFrameWorkspace from "@/components/creative/uiux-layout-frame/UiUxLayoutFrameWorkspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GalleryGrid, GalleryItem } from "@/components/shared/GalleryGrid";
import { BuilderShell } from "@/components/shared/BuilderShell";
import { insertCreativeAsset, insertActivity } from "@/lib/supabase-actions";
import { supabase, isDemoMode } from "@/lib/supabase";

type CreativeTool =
  | "image"
  | "video"
  | "logo"
  | "brand"
  | "presentation"
  | "uiux"
  | "animation"
  | "voice"
  | "assets";

const VALID_TOOLS = new Set<CreativeTool>([
  "image", "video", "logo", "brand", "presentation", "uiux", "animation", "voice", "assets",
]);

function readToolFromUrl(): CreativeTool | null {
  if (typeof window === "undefined") return null;
  const tool = new URLSearchParams(window.location.search).get("tool");
  return tool && VALID_TOOLS.has(tool as CreativeTool) ? (tool as CreativeTool) : null;
}

export default function CreativeSuitePage() {
  const [activeTool, setActiveTool] = useState<CreativeTool>(() => readToolFromUrl() ?? "image");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  React.useEffect(() => {
    const toolFromUrl = readToolFromUrl();
    if (toolFromUrl) setActiveTool(toolFromUrl);
  }, []);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tool", activeTool);
    window.history.replaceState({}, "", url.toString());
    window.dispatchEvent(new Event("url-change"));
  }, [activeTool]);

  // Full-screen modes bypass the outer creative suite shell
  const isFullscreen = activeTool === "image" || activeTool === "video" || activeTool === "presentation";

  // Grouped Tools Metadata
  const creativeToolGroups = [
    {
      title: "Generative AI",
      items: [
        { id: "image", label: "Image Generation", icon: ImageIcon },
        { id: "video", label: "Video Generation", icon: Video },
        { id: "voice", label: "Voice Generator", icon: Volume2 },
      ],
    },
    {
      title: "Branding & Design",
      items: [
        { id: "logo", label: "Logo Generator", icon: Diamond },
        { id: "brand", label: "Brand Identity Sheet", icon: Fingerprint },
        { id: "uiux", label: "UI/UX Layout Frame", icon: Brush },
      ],
    },
    {
      title: "Production & Library",
      items: [
        { id: "presentation", label: "Presentation Builder", icon: Presentation },
        { id: "animation", label: "Animation Studio", icon: Film },
        { id: "assets", label: "Creative Asset Library", icon: FolderHeart },
      ],
    },
  ];

  // Full-screen workspace views (image + video have their own complete UI)
  if (activeTool === "image") {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-y-auto w-full bg-surface border-l border-border/20">
        <ImageGeneratorWorkspace
          onBack={() => setActiveTool("logo")}
          onViewChange={() => {}}
        />
      </div>
    );
  }

  if (activeTool === "video") {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-y-auto w-full bg-surface border-l border-border/20">
        <VideoGeneratorWorkspace
          onBack={() => setActiveTool("logo")}
          onViewChange={() => {}}
        />
      </div>
    );
  }

  if (activeTool === "presentation") {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-y-auto w-full bg-surface border-l border-border/20">
        <PresentationWorkspace onBack={() => setActiveTool("logo")} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden w-full bg-surface border-l border-border/20">
      <aside
        className={cn(
          "bg-surface border-r border-border/20 flex flex-col shrink-0 transition-all duration-300",
          isSidebarOpen ? "w-60" : "w-14"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-12 px-4 border-b border-border/20 flex items-center justify-between bg-void/35 shrink-0">
          {isSidebarOpen && (
            <span className="font-display font-bold text-scale-sm text-pulse">Creative Workstation</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-7 h-7 hover:bg-void/40 text-muted-foreground hover:text-bone mx-auto"
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", isSidebarOpen && "rotate-180")} />
          </Button>
        </div>

        {/* Tools Navigator */}
        <nav className="flex-grow p-2 space-y-3.5 overflow-y-auto">
          {creativeToolGroups.map((group, groupIdx) => (
            <div key={group.title} className="space-y-1">
              {isSidebarOpen ? (
                <span className="text-[9px] font-bold text-muted-foreground/45 tracking-widest px-3 block uppercase select-none">
                  {group.title}
                </span>
              ) : (
                groupIdx > 0 && <div className="h-px bg-border/20 my-2 mx-1" />
              )}
              {group.items.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id as CreativeTool)}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-scale-xs font-medium transition-all border border-transparent text-left",
                      isActive
                        ? "bg-pulse/10 border-pulse/30 text-pulse"
                        : "text-muted-foreground hover:bg-void/40 hover:text-bone"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-pulse")} />
                    {isSidebarOpen && <span className="truncate">{tool.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 bg-void/40 relative overflow-hidden flex flex-col">
        {activeTool === "logo" && (
          <LogoGeneratorView onSendToBrandKit={() => setActiveTool("brand")} />
        )}
        {activeTool === "brand" && <BrandIdentityView />}
        {activeTool === "uiux" && <UiUxLayoutFrameWorkspace />}
        {activeTool === "animation" && <AnimationStudioView />}
        {activeTool === "voice" && <VoiceGeneratorView />}
        {activeTool === "assets" && <AssetLibraryView />}
      </main>
    </div>
  );
}

/* ==========================================
   SUB-MODULE VIEWS
   ========================================== */

// 4. Brand Identity View
function BrandIdentityView() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasResults, setHasResults] = useState(true);
  const [brandNameInput, setBrandNameInput] = useState("MaVionix");
  const [tone, setTone] = useState("Professional");
  const [paletteSize, setPaletteSize] = useState("5 colors");
  const [creativity, setCreativity] = useState(65);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setHasResults(false);
    await new Promise(r => setTimeout(r, 1400));
    setIsGenerating(false);
    setHasResults(true);
  };

  const COLORS = [
    { name: "Void (Base)", hex: "#0B0B10", bg: "bg-[#0B0B10]", border: "border-white/10" },
    { name: "Surface (Elevated)", hex: "#15141C", bg: "bg-[#15141C]", border: "border-white/10" },
    { name: "Signal (Accent)", hex: "#8B5CF6", bg: "bg-[#8B5CF6]", border: "border-[#8B5CF6]/30" },
    { name: "Pulse (Creative)", hex: "#EC4899", bg: "bg-[#EC4899]", border: "border-[#EC4899]/30" },
    { name: "Circuit (Auto)", hex: "#22D3EE", bg: "bg-[#22D3EE]", border: "border-[#22D3EE]/30" },
  ];

  const brandSheet = (
    <div className="rounded-2xl border border-slate-800 bg-[#0c0c14] p-6 space-y-6">
      {/* Brand Identity Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">Brand Profile</span>
          <h3 className="text-2xl font-bold font-display text-white mt-1">{brandNameInput || "MaVionix"}</h3>
          <p className="text-slate-400 text-xs mt-1">Generated via {tone} Brand Engine</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/25">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[11px] font-medium text-purple-300">Cohesive System</span>
        </div>
      </div>

      {/* Color Palette section */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">1. Color Palette ({paletteSize})</span>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {COLORS.slice(0, paletteSize === "3 colors" ? 3 : paletteSize === "7 colors" ? 5 : 5).map((color, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/40 p-2.5 flex flex-col gap-2">
              <div className={cn("h-12 w-full rounded-lg border", color.bg, color.border)} />
              <div>
                <p className="text-[11px] font-semibold text-slate-200 truncate">{color.name}</p>
                <p className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">{color.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">2. Primary Typography</span>
          <div>
            <h4 className="font-display font-bold text-white text-lg">Outfit</h4>
            <p className="text-slate-500 text-[10px] font-mono mt-0.5">HEADINGS & HERO ELEMENTS</p>
          </div>
          <div className="h-[1px] bg-slate-800/60" />
          <p className="font-display text-2xl font-bold text-white tracking-tight">AbCdEfG 123</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">3. Secondary Typography</span>
          <div>
            <h4 className="font-sans font-bold text-white text-lg">Inter</h4>
            <p className="text-slate-500 text-[10px] font-mono mt-0.5">BODY & DATA INTERFACES</p>
          </div>
          <div className="h-[1px] bg-slate-800/60" />
          <p className="font-sans text-lg text-slate-300">The quick brown fox jumps...</p>
        </div>
      </div>

      {/* Brand Attributes */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">4. Brand Voice & Tone ({tone})</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tone === "Professional" && (
            <>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Authoritative</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Clear</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Trustworthy</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Precise</span>
              </div>
            </>
          )}
          {tone === "Playful" && (
            <>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Humorous</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Approachable</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Energetic</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Friendly</span>
              </div>
            </>
          )}
          {tone === "Bold" && (
            <>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Confident</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Direct</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Impactful</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Daring</span>
              </div>
            </>
          )}
          {tone === "Elegant" && (
            <>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Refined</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Subtle</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Sophisticated</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-300 font-medium block">Polished</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <BuilderShell title="Brand Identity Sheet" accent="pulse" isEmpty={false}>
      <AiGeneratePanel
        promptPlaceholder="Describe your brand's personality and style in detail..."
        secondaryLabel="Brand Name"
        secondaryInput={
          <input value={brandNameInput} onChange={e => setBrandNameInput(e.target.value)}
            placeholder="e.g. MaVionix, Acme Corp..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50" />
        }
        chips={["Bold Tech Startup","Warm Approachable SaaS","Minimalist Enterprise","Playful Consumer Brand","Luxury Premium","Eco Sustainable"]}
        generateLabel="GENERATE BRAND SHEET"
        enhanceSuffix="with cohesive visual language, distinctive color palette, and clear typographic hierarchy"
        modelOptions={["MaVionix Brand Engine v2","MaVionix Brand Engine v1 Turbo","MaVionix Style Distiller v1"]}
        settings={
          <>
            <PillGroup label="Tone" options={["Professional","Playful","Bold","Elegant"]} value={tone} onChange={setTone} />
            <PillGroup label="Palette Size" options={["3 colors","5 colors","7 colors"]} value={paletteSize} onChange={setPaletteSize} />
            <SliderField label="Creativity Level" value={creativity} onChange={setCreativity} />
          </>
        }
        resultsLabel="RESULTS"
        emptyResultsText="Your generated brand sheet will appear here."
        resultTiles={brandSheet}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        hasResults={hasResults}
      />
    </BuilderShell>
  );
}


// 7. Animation Studio View
function AnimationStudioView() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [animStyle, setAnimStyle] = useState("Smooth");
  const [fps, setFps] = useState("30");
  const [loop, setLoop] = useState("Loop");
  const [speed, setSpeed] = useState(60);
  const [complexity, setComplexity] = useState(50);
  const [currentFrame, setCurrentFrame] = useState(30);

  interface AnimLayer { id: string; name: string; icon: "background"|"shape"|"image"; color: string; duration: number; keyframes: number[]; }
  const [layers, setLayers] = useState<AnimLayer[]>([
    { id:"l1", name:"Dark Void Base",    icon:"background", color:"#0B0B10", duration:120, keyframes:[0,60,120] },
    { id:"l2", name:"Signal Pulse Ring", icon:"shape",      color:"#8B5CF6", duration:90,  keyframes:[0,30,75,90] },
    { id:"l3", name:"Glow Core Particle",icon:"shape",      color:"#EC4899", duration:80,  keyframes:[5,45,80] },
  ]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setHasResults(false);
    await new Promise(r => setTimeout(r, 1200));
    setLayers([
      { id:"l1", name:"Dark Void Base",    icon:"background", color:"#0B0B10", duration:120, keyframes:[0,60,120] },
      { id:"l2", name:"Signal Pulse Ring", icon:"shape",      color:"#8B5CF6", duration:90,  keyframes:[0,30,75,90] },
      { id:"l3", name:"Glow Core Particle",icon:"shape",      color:"#EC4899", duration:80,  keyframes:[5,45,80] },
      { id:"l4", name:"Brand Mark Fade",   icon:"image",      color:"#22D3EE", duration:60,  keyframes:[20,60] },
    ]);
    setCurrentFrame(0);
    setIsGenerating(false);
    setHasResults(true);
  };

  const LAYER_ICONS = { background: <div className="w-3 h-3 rounded bg-slate-600 border border-slate-500" />, shape: <div className="w-3 h-3 rounded-full border-2 border-purple-500/60" />, image: <div className="w-3 h-3 rounded border border-blue-400/60 bg-blue-400/10" /> };

  const animationStudio = (
    <div className="rounded-2xl border border-slate-800 bg-[#0c0c14] overflow-hidden">
      {/* Preview */}
      <div className="h-48 bg-[#07070f] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
        <div className="absolute w-24 h-24 rounded-full border-4 border-purple-500/30 blur-sm" style={{ background:"radial-gradient(circle,rgba(139,92,246,.3) 0%,rgba(236,72,153,.1) 60%,transparent 100%)", transform:`translate(${(currentFrame-60)*1.2}px,${Math.sin(currentFrame/12)*15}px)` }} />
        <div className="absolute w-16 h-16 rounded-full border-2 border-purple-400/40" style={{ opacity:Math.min(1,currentFrame/30), transform:`scale(${0.5+currentFrame/240}) rotate(${currentFrame*3}deg)` }} />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center" style={{ opacity:Math.min(1,currentFrame/20), transform:`scale(${Math.min(1,0.3+currentFrame/40)})` }}>
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <span className="font-mono text-[9px] text-slate-500 uppercase">Frame {currentFrame}/120</span>
        </div>
      </div>
      {/* Layers */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Layers</span>
          <button onClick={() => setLayers(ls => [...ls, {id:`l${Date.now()}`,name:`Layer ${ls.length+1}`,icon:"shape",color:"#8B5CF6",duration:60,keyframes:[0,30,60]}])} className="text-slate-500 hover:text-slate-300"><Plus className="w-3.5 h-3.5" /></button>
        </div>
        {layers.map(l => (
          <div key={l.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50 border border-slate-800">
            <span className="w-4 flex items-center justify-center">{LAYER_ICONS[l.icon]}</span>
            <span className="flex-1 text-[11px] text-slate-300 truncate">{l.name}</span>
            <span className="text-[8px] font-mono" style={{color:l.color}}>{l.duration}f</span>
          </div>
        ))}
      </div>
      {/* Timeline */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>Timeline</span><span className="text-purple-400">30fps · 4.0s</span>
        </div>
        {layers.map(l => (
          <div key={l.id} className="flex items-center gap-2 h-4">
            <span className="w-20 text-[8px] text-slate-600 truncate">{l.name}</span>
            <div className="flex-1 relative h-3">
              <div className="absolute top-1 h-1 rounded-full opacity-30" style={{left:0, width:`${(l.duration/120)*100}%`, backgroundColor:l.color}} />
              {l.keyframes.map(kf => (<div key={kf} className="absolute top-0 w-2.5 h-2.5 -translate-x-1.5 rotate-45 border" style={{left:`${(kf/120)*100}%`, backgroundColor:l.color, borderColor:l.color}} />))}
              <div className="absolute top-0 w-0.5 h-3 bg-purple-400/60 z-10" style={{left:`${(currentFrame/120)*100}%`}} />
            </div>
          </div>
        ))}
        <input type="range" min="0" max="120" value={currentFrame} onChange={e=>setCurrentFrame(Number(e.target.value))} className="w-full accent-purple-500 cursor-pointer" />
      </div>
    </div>
  );

  return (
    <BuilderShell title="Animation Studio" accent="pulse" isEmpty={false}>
      <AiGeneratePanel
        promptPlaceholder="Describe the animation you want to create in detail..."
        secondaryLabel="Duration (seconds)"
        secondaryInput={
          <select className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50">
            {["2s","3s","5s","8s","10s","15s"].map(d=><option key={d}>{d}</option>)}
          </select>
        }
        chips={["Logo Reveal","Loading Spinner","Page Transition","Hover Micro-interaction","Text Animation","Icon Morph"]}
        generateLabel="GENERATE ANIMATION"
        enhanceSuffix="with smooth keyframe transitions, layered motion, and professional easing curves"
        modelOptions={["MaVionix Motion v2","MaVionix Motion v1 Turbo","MaVionix Micro-animation v1"]}
        settings={
          <>
            <PillGroup label="Animation Style" options={["Smooth","Bouncy","Sharp","Elastic"]} value={animStyle} onChange={setAnimStyle} />
            <PillGroup label="Frame Rate" options={["24fps","30fps","60fps"]} value={fps} onChange={setFps} />
            <PillGroup label="Loop" options={["Once","Loop","Ping-pong"]} value={loop} onChange={setLoop} />
            <SliderField label="Speed" value={speed} onChange={setSpeed} />
            <SliderField label="Complexity" value={complexity} onChange={setComplexity} />
            <div className="space-y-1.5">
              <span className="text-[12px] font-semibold text-slate-400">Easing</span>
              <select className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50">
                {["Ease In-Out","Linear","Ease In","Ease Out","Bounce","Spring"].map(e=><option key={e}>{e}</option>)}
              </select>
            </div>
          </>
        }
        resultsLabel="ANIMATION PREVIEW"
        emptyResultsText="Your generated animation layers will appear here."
        resultTiles={animationStudio}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        hasResults={hasResults}
      />
    </BuilderShell>
  );
}


// 8. Voice Generator View
function VoiceGeneratorView() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("sarah");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsGenerating(true);
    setHasVoice(false);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsGenerating(false);
    setHasVoice(true);
    insertCreativeAsset({ name: `Voice: ${text.slice(0, 40)}`, type: "voice", prompt: text, preset: voice, tags: ["voice", voice] });
    insertActivity({ title: "Voice audio generated", description: `Generated voice clip with "${voice}" voice`, type: "creative" });
  };

  return (
    <BuilderShell title="AI Audio Voice Generator" accent="pulse" isEmpty={false}>
      <div className="flex-grow p-6 overflow-y-auto space-y-6 max-w-xl mx-auto w-full flex flex-col justify-center">
        
        {/* Playback card */}
        {hasVoice && (
          <div className="bg-surface border border-pulse rounded-xl p-5 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pulse/15 border border-pulse/25 text-pulse flex items-center justify-center shrink-0">
                <FileAudio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-bone text-scale-sm">Generated Voice Capture</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-mono mt-0.5">Voice profile: {voice}</p>
              </div>
            </div>

            {/* Audio Waveform mock */}
            <div className="h-10 flex items-center justify-center gap-1 bg-void/50 border border-border/40 rounded-lg p-2 overflow-hidden">
              {[2, 4, 8, 3, 7, 5, 2, 8, 4, 6, 8, 3, 5, 2, 7, 4, 8, 3, 6, 2].map((val, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-1 rounded-full bg-pulse shrink-0 transition-all",
                    isPlaying ? "animate-pulse" : "opacity-60"
                  )}
                  style={{ height: `${val * 4}px` }}
                />
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-border/10">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-pulse hover:bg-pulse/90 text-void font-semibold text-scale-xs h-8 px-4 rounded-lg flex items-center gap-1.5"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause Telemetry
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-void" /> Play Capture
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-scale-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-pulse" />
              <span>Generating vocal waveform frequencies...</span>
            </div>
          </div>
        )}

        {/* Inputs Form */}
        <form onSubmit={handleGenerate} className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Voice Selector</label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="flex w-full rounded border border-border/40 bg-void/50 text-bone px-2 py-1.5 h-9 text-scale-xs focus:outline-none focus:ring-1 focus:ring-pulse"
            >
              <option value="sarah">Sarah (AI Soprano Voice)</option>
              <option value="jack">Jack (AI Baritone Voice)</option>
              <option value="synthesizer">Telemetry AI Synth</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Text Buffer Input</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Welcome back. Visual assets compiling is fully online."
              className="flex w-full rounded border border-border/40 bg-void/50 text-bone px-3 py-2 text-scale-xs focus:outline-none focus:ring-1 focus:ring-pulse h-20"
            />
          </div>

          <Button type="submit" className="w-full bg-pulse hover:bg-pulse/90 text-void font-semibold text-scale-xs h-9">
            Generate Vocal Synthesis
          </Button>
        </form>
      </div>
    </BuilderShell>
  );
}

// 9. Asset Library View
const initialAssetItems: GalleryItem[] = [
  { id: "ast-1", title: "Cyberpunk Glow Logo", type: "image", category: "Images", tags: ["cyberpunk", "logo"] },
  { id: "ast-2", title: "SaaS Grid Wireframe", type: "vector", category: "Vectors", tags: ["dashboard", "saas"] },
  { id: "ast-3", title: "Vocal Dispatch Track", type: "audio", category: "Audio", tags: ["voice", "alert"] },
  { id: "ast-4", title: "Type Pairing Config", type: "font", category: "Fonts", tags: ["font", "branding"] },
];

function AssetLibraryView() {
  const [items, setItems] = useState<GalleryItem[]>(initialAssetItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Images" | "Vectors" | "Audio" | "Fonts">("All");
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Load real creative_assets from Supabase
  useEffect(() => {
    if (isDemoMode || assetsLoaded) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
      if (!profile?.org_id) return;
      const { data } = await supabase
        .from("creative_assets")
        .select("id, name, type, tags")
        .eq("org_id", profile.org_id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (data && data.length > 0) {
        const typeToCategory: Record<string, string> = { image: "Images", video: "Images", logo: "Images", voice: "Audio", animation: "Images", brand_identity: "Vectors", presentation: "Vectors", ui_ux: "Vectors", asset_library: "Images" };
        const typeToGallery: Record<string, GalleryItem["type"]> = { image: "image", video: "video", logo: "logo", voice: "audio", animation: "video", brand_identity: "vector", presentation: "vector", ui_ux: "vector" };
        setItems(data.map((row: { id: string; name: string; type: string; tags: string[] | null }) => ({
          id: row.id,
          title: row.name,
          type: typeToGallery[row.type] ?? "image",
          category: typeToCategory[row.type] ?? "Images",
          tags: row.tags ?? [],
        })));
      }
      setAssetsLoaded(true);
    })();
  }, [assetsLoaded]);

  const filteredItems = items.filter((item) => {
    // Search filter
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    let matchesCat = true;
    if (activeFilter !== "All") {
      matchesCat = item.category === activeFilter;
    }
    
    return matchesSearch && matchesCat;
  });

  return (
    <BuilderShell title="Asset Library Catalogue" accent="pulse" isEmpty={false}>
      <div className="flex-grow p-6 overflow-y-auto space-y-6 flex flex-col">
        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-border/20 pb-4">
          <div className="flex items-center gap-2 bg-void/50 border border-border/40 p-1.5 rounded-lg w-full sm:max-w-xs relative z-10">
            <Search className="w-4 h-4 text-muted-foreground pl-1 shrink-0" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="bg-transparent border-0 h-6 p-0 text-scale-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["All", "Images", "Vectors", "Audio", "Fonts"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider border transition-colors",
                  activeFilter === filter
                    ? "bg-pulse/10 border-pulse text-pulse"
                    : "border-border/30 text-muted-foreground hover:text-bone hover:border-border/80"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        {filteredItems.length === 0 ? (
          /* Empty state for search filters */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/40 rounded-xl py-12 space-y-4">
            <AlertCircle className="w-8 h-8 text-pulse bg-pulse/10 border border-pulse/25 rounded-full p-1.5" />
            <div className="space-y-1">
              <h4 className="font-display font-bold text-bone text-scale-base">No Assets Found</h4>
              <p className="text-scale-xs text-muted-foreground max-w-xs font-sans">
                We couldn&apos;t find any assets matching &quot;{searchQuery}&quot; with the current filters.
              </p>
            </div>
            <Button
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("All");
              }}
              className="bg-pulse hover:bg-pulse/90 text-void font-semibold text-scale-xs h-8 px-4 rounded-lg"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <GalleryGrid items={filteredItems} mode="asset" accent="pulse" />
        )}
      </div>
    </BuilderShell>
  );
}
