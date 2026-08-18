"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { BuilderShell } from "@/components/shared/BuilderShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { StepperInput } from "@/components/ui/stepper-input";
import { cn } from "@/lib/utils";
import { insertActivity, insertCreativeAsset } from "@/lib/supabase-actions";
import {
  generateLogos,
  refineLogo,
  regenerateSingleLogo,
  type LogoGenerationParams,
  type LogoVariation,
} from "@/services/logoGenerator";
import { GenerationHistoryPanel } from "./GenerationHistoryPanel";
import { LogoCard } from "./LogoCard";
import { LogoDetailModal } from "./LogoDetailModal";
import { downloadPng } from "./logoDownloadUtils";
import { parseBrandPrompt } from "./parseBrandPrompt";
import {
  COLOR_MOOD_OPTIONS,
  LOADING_STATUS_LINES,
  LOGO_STYLE_OPTIONS,
  VARIATION_COUNTS,
  type LogoFormat,
  type LogoGenerationBatch,
} from "./types";

const MIN_BRAND_LEN = 2;
const MAX_BRAND_LEN = 40;

type GridFilter = "all" | "favorites";

export interface LogoGeneratorViewProps {
  onSendToBrandKit?: (logoId: string) => void;
}

export function LogoGeneratorView({ onSendToBrandKit }: LogoGeneratorViewProps) {
  const [brandName, setBrandName] = useState("");
  const [style, setStyle] = useState<string>(LOGO_STYLE_OPTIONS[0]);
  const [industry, setIndustry] = useState("");
  const [colorMood, setColorMood] = useState<string>("Let AI choose");
  const [format, setFormat] = useState<LogoFormat>("combination");
  const [variationCount, setVariationCount] = useState<(4 | 6 | 9)>(6);

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [variations, setVariations] = useState<LogoVariation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const [gridFilter, setGridFilter] = useState<GridFilter>("all");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [selectedVariation, setSelectedVariation] = useState<LogoVariation | null>(null);
  const [historyOpen, setHistoryOpen] = useState(true);
  // TODO: persist to backend/localStorage in a future pass
  const [historyBatches, setHistoryBatches] = useState<LogoGenerationBatch[]>([]);
  const [lastParams, setLastParams] = useState<LogoGenerationParams | null>(null);

  const [aiAssistOpen, setAiAssistOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const trimmedBrand = brandName.trim();
  const brandTooShort = trimmedBrand.length > 0 && trimmedBrand.length < MIN_BRAND_LEN;
  const brandTooLong = trimmedBrand.length > MAX_BRAND_LEN;
  const brandInvalid = brandTooShort || brandTooLong;
  const canGenerate = trimmedBrand.length >= MIN_BRAND_LEN && !brandTooLong && !isLoading;

  useEffect(() => {
    if (!isLoading) return;
    const id = window.setInterval(() => {
      setLoadingLineIndex((i) => (i + 1) % LOADING_STATUS_LINES.length);
    }, 1500);
    return () => window.clearInterval(id);
  }, [isLoading]);

  const buildParams = useCallback((): LogoGenerationParams => {
    return {
      brandName: trimmedBrand,
      style,
      industry: industry.trim() || undefined,
      colorMood,
      format,
      variationCount,
    };
  }, [trimmedBrand, style, industry, colorMood, format, variationCount]);

  const runGeneration = useCallback(
    async (params: LogoGenerationParams, { appendHistory }: { appendHistory: boolean }) => {
      setIsLoading(true);
      setError(null);
      setLastParams(params);

      try {
        const results = await generateLogos(params);
        setVariations(results);
        setGridFilter("all");

        if (appendHistory) {
          const batch: LogoGenerationBatch = {
            id: `batch-${Date.now()}`,
            brandName: params.brandName,
            style: params.style,
            createdAt: new Date(),
            variations: results,
            params,
          };
          setHistoryBatches((prev) => [batch, ...prev]);
        }

        insertCreativeAsset({
          name: `Logo: ${params.brandName}`,
          type: "logo",
          prompt: `Brand: ${params.brandName}, Style: ${params.style}`,
          preset: params.style,
          tags: ["logo", params.style],
        });
        insertActivity({
          title: "Logo variations generated",
          description: `Generated ${results.length} logo variations for "${params.brandName}"`,
          type: "creative",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Logo generation failed. Please retry.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitAttempted(true);
    if (!canGenerate) return;
    await runGeneration(buildParams(), { appendHistory: true });
  };

  const handleRetry = () => {
    if (lastParams) void runGeneration(lastParams, { appendHistory: false });
    else void handleGenerate();
  };

  const handleRegenerateAll = () => {
    if (!lastParams || isLoading) return;
    void runGeneration(lastParams, { appendHistory: true });
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const displayedVariations = useMemo(() => {
    if (gridFilter === "favorites") return variations.filter((v) => favoriteIds.has(v.id));
    return variations;
  }, [variations, gridFilter, favoriteIds]);

  const handleRegenerateOne = async (variation: LogoVariation) => {
    if (!lastParams || isLoading) return;
    setIsLoading(true);
    try {
      const updated = await regenerateSingleLogo(lastParams, variation.id);
      setVariations((prev) => prev.map((v) => (v.id === variation.id ? updated : v)));
      if (selectedVariation?.id === variation.id) setSelectedVariation(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not regenerate this variation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineFromModal = async (instruction: string) => {
    if (!selectedVariation || !lastParams) return;
    setIsRefining(true);
    try {
      const refined = await refineLogo(selectedVariation, instruction, lastParams);
      setVariations((prev) => prev.map((v) => (v.id === selectedVariation.id ? refined : v)));
      setSelectedVariation(refined);
      toast.success("Concept refined");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Refinement failed");
    } finally {
      setIsRefining(false);
    }
  };

  const handleAiAssistApply = () => {
    if (!aiPrompt.trim()) return;
    const parsed = parseBrandPrompt(aiPrompt);
    setBrandName(parsed.brandName);
    setStyle(parsed.style);
    if (parsed.industry) setIndustry(parsed.industry);
    if (parsed.colorMood) setColorMood(parsed.colorMood);
    if (parsed.format) setFormat(parsed.format);
    setAiAssistOpen(false);
    setAiPrompt("");
    toast.message("Brand brief applied to controls");
  };

  const loadHistoryBatch = (batchId: string) => {
    const batch = historyBatches.find((b) => b.id === batchId);
    if (!batch) return;
    setVariations(batch.variations);
    setLastParams(batch.params);
    setBrandName(batch.params.brandName);
    setStyle(batch.params.style);
    setIndustry(batch.params.industry ?? "");
    setColorMood(batch.params.colorMood ?? "Let AI choose");
    setFormat(batch.params.format);
    setVariationCount(batch.params.variationCount);
    setError(null);
    setGridFilter("all");
  };

  const gridColsClass =
    variationCount === 9
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : variationCount === 6
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2";

  return (
    <BuilderShell title="AI Logo Variation Vector Synth" accent="pulse" isEmpty={false}>
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden min-h-0 relative">
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4">
            {variations.length > 0 && !isLoading && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  {(["all", "favorites"] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setGridFilter(key)}
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-colors",
                        gridFilter === key
                          ? "bg-pulse/10 border-pulse text-pulse"
                          : "border-border/30 text-muted-foreground hover:text-bone"
                      )}
                    >
                      {key === "all" ? "All" : "Favorites"}
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerateAll}
                  disabled={isLoading || !lastParams}
                  className="text-scale-xs text-pulse hover:bg-pulse/10"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Regenerate all
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="space-y-4">
                <div className={cn("grid gap-4 sm:gap-6", gridColsClass)}>
                  {Array.from({ length: variationCount }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl border border-pulse/20 bg-surface/40 animate-pulse"
                    />
                  ))}
                </div>
                <p className="text-center text-scale-xs text-muted-foreground font-mono animate-pulse">
                  {LOADING_STATUS_LINES[loadingLineIndex]}
                </p>
              </div>
            )}

            {!isLoading && variations.length === 0 && (
              <div className="space-y-4">
                {/* AI Prompt Hero */}
                <div className="rounded-xl border border-pulse/30 bg-pulse/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pulse" />
                    <span className="text-scale-xs font-semibold text-bone">Describe your brand</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAiAssistApply()}
                      placeholder="e.g. A cozy bakery with a modern twist, warm tones..."
                      className="flex-1 rounded-lg border border-border/40 bg-void/50 text-bone px-3 py-2 text-scale-xs focus:outline-none focus:ring-1 focus:ring-pulse"
                    />
                    <Button
                      type="button"
                      onClick={handleAiAssistApply}
                      disabled={!aiPrompt.trim()}
                      className="bg-pulse hover:bg-pulse/90 text-void font-semibold text-scale-xs h-9 px-4 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Generate
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Minimalist tech logo", "Bold gradient wordmark", "Geometric icon mark", "Luxury monogram"].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => { setAiPrompt(chip); }}
                        className="px-2.5 py-1 rounded-full text-[10px] border border-pulse/25 text-pulse hover:bg-pulse/10 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-center text-scale-xs text-muted-foreground">
                  Or fill in the brand name and style below to generate manually.
                </p>
              </div>
            )}

            {!isLoading && displayedVariations.length > 0 && (
              <div className={cn("grid gap-4 sm:gap-6", gridColsClass)}>
                {displayedVariations.map((variation, index) => (
                  <LogoCard
                    key={variation.id}
                    variation={variation}
                    index={index}
                    isFavorite={favoriteIds.has(variation.id)}
                    onOpen={() => setSelectedVariation(variation)}
                    onDownload={() => downloadPng(variation)}
                    onToggleFavorite={() => toggleFavorite(variation.id)}
                    onRegenerateOne={() => void handleRegenerateOne(variation)}
                    onRefine={() => setSelectedVariation(variation)}
                  />
                ))}
              </div>
            )}

            {!isLoading && gridFilter === "favorites" && displayedVariations.length === 0 && variations.length > 0 && (
              <p className="text-center text-scale-xs text-muted-foreground">No favorites yet — heart a logo to shortlist it.</p>
            )}
          </div>

          {error && (
            <div className="mx-4 sm:mx-6 mb-2 flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-scale-xs text-bone">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                {error}
              </span>
              <Button type="button" size="xs" variant="outline" onClick={handleRetry} disabled={isLoading}>
                Retry
              </Button>
            </div>
          )}

          <div className="shrink-0 border-t border-border/40 bg-surface">
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-bone border-b border-border/20"
              aria-expanded={advancedOpen}
            >
              Advanced parameters
              {advancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {advancedOpen && (
              <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-b border-border/20 text-scale-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">Industry / niche</label>
                  <Input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="fintech, coffee shop…"
                    className="bg-void/50 border-border/40 h-9 text-scale-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">Color mood</label>
                  <select
                    value={colorMood}
                    onChange={(e) => setColorMood(e.target.value)}
                    className="flex w-full rounded border border-border/40 bg-void/50 text-bone px-2 h-9 text-scale-xs focus:outline-none focus:ring-1 focus:ring-pulse"
                  >
                    {COLOR_MOOD_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">Format</label>
                  <SegmentedControl
                    aria-label="Logo format"
                    value={format}
                    onChange={setFormat}
                    options={[
                      { value: "icon", label: "Icon" },
                      { value: "wordmark", label: "Word" },
                      { value: "combination", label: "Combo" },
                    ]}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">Variations</label>
                  <StepperInput
                    aria-label="Number of variations"
                    value={variationCount}
                    onChange={setVariationCount}
                    options={VARIATION_COUNTS}
                  />
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => void handleGenerate(e)}
              className="p-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 text-scale-xs"
            >
              <div className="space-y-1">
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value.slice(0, MAX_BRAND_LEN + 5))}
                  placeholder="Brand name (e.g. MaVionix)…"
                  aria-invalid={brandInvalid}
                  className="bg-void/50 border-border/40 text-scale-xs focus-visible:ring-1 focus-visible:ring-pulse"
                />
                {submitAttempted && trimmedBrand.length === 0 && (
                  <p className="text-[10px] text-muted-foreground">Brand name is required to generate.</p>
                )}
                {brandTooShort && (
                  <p className="text-[10px] text-destructive">Use at least {MIN_BRAND_LEN} characters.</p>
                )}
                {brandTooLong && (
                  <p className="text-[10px] text-destructive">Maximum {MAX_BRAND_LEN} characters.</p>
                )}
              </div>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="flex rounded border border-border/40 bg-void/50 text-bone px-2 h-9 text-scale-xs focus:outline-none focus:ring-1 focus:ring-pulse"
              >
                {LOGO_STYLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                disabled={!canGenerate}
                className="bg-pulse hover:bg-pulse/90 text-void font-semibold text-scale-xs h-9 min-w-[10rem]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating…
                  </>
                ) : (
                  "Generate Logo Grid"
                )}
              </Button>
            </form>
          </div>
        </div>

        <GenerationHistoryPanel
          batches={historyBatches}
          isOpen={historyOpen}
          onToggle={() => setHistoryOpen((v) => !v)}
          onSelectBatch={loadHistoryBatch}
        />

        <LogoDetailModal
          variation={selectedVariation}
          brandName={trimmedBrand || "Brand"}
          onClose={() => setSelectedVariation(null)}
          onRefine={handleRefineFromModal}
          isRefining={isRefining}
          onSendToBrandKit={(logoId) => {
            onSendToBrandKit?.(logoId);
            toast.message("Sent to Brand Identity Sheet (stub)");
          }}
        />
      </div>
    </BuilderShell>
  );
}
