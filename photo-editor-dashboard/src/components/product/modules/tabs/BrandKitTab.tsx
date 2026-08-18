import React, { useState, useEffect, useRef } from 'react';
import { Palette, Type, Image as ImageIcon, FolderOpen, LayoutTemplate, Wand2, Plus, Save, Loader2, Sparkles, RefreshCw, Upload, X, AlertCircle, Eye, Download, Copy, RotateCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getBrandKit, saveBrandKit, suggestBrandKit, generateImage, ApiBrandKit, ApiBrandKitSuggestion } from '../../../../lib/api';
import { getOperationCost, checkDemoTokens, deductDemoTokens } from '../../../../lib/tokens';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const GOOGLE_FONTS = [
  'Inter', 'Sora', 'Outfit', 'Poppins', 'Montserrat',
  'Playfair Display', 'Lora', 'Cinzel', 'Fredoka', 'Quicksand', 'Nunito',
  'Roboto', 'Lato', 'DM Sans',
];

export default function BrandKitTab() {
  const [brandKit, setBrandKit] = useState<ApiBrandKit>({
    colors: ['#C800FF', '#7C3AED', '#4C1D95', '#0F172A', '#FFFFFF'],
    fonts: ['Inter', 'Poppins', 'Sora'],
    logos: [],
    assets: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  // Form states for Auto Branding
  const [brandName, setBrandName] = useState('');
  const [brandType, setBrandType] = useState('Tech Startup');
  const [description, setDescription] = useState('');
  const [generatingStep, setGeneratingStep] = useState<'idle' | 'suggesting' | 'review' | 'logo' | 'asset1' | 'asset2' | 'saving' | 'done'>('idle');
  const [stepDetail, setStepDetail] = useState('');
  const [error, setError] = useState('');

  // Suggestion review state
  const [suggestions, setSuggestions] = useState<ApiBrandKitSuggestion | null>(null);
  const [editedColors, setEditedColors] = useState<string[]>([]);
  const [editedFonts, setEditedFonts] = useState<string[]>([]);
  const [editedLogoPrompt, setEditedLogoPrompt] = useState('');
  const [editedAssetPrompts, setEditedAssetPrompts] = useState<string[]>([]);

  // Multiple logo variations
  const [logoVariations, setLogoVariations] = useState<string[]>([]);
  const [selectedLogoIndex, setSelectedLogoIndex] = useState(0);
  const [generatingLogos, setGeneratingLogos] = useState(false);

  // Asset variations
  const [assetVariations, setAssetVariations] = useState<{ [key: number]: string[] }>({});
  const [generatingAssets, setGeneratingAssets] = useState<Set<number>>(new Set());

  // Load existing brand kit on mount
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getBrandKit();
        setBrandKit(data);
      } catch (err) {
        console.error('Failed to load brand kit', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Dynamically load Google Fonts for preview styling
  useEffect(() => {
    if (brandKit?.fonts) {
      brandKit.fonts.forEach((font) => {
        const linkId = `gfont-${font.replace(/\s+/g, '-').toLowerCase()}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
          document.head.appendChild(link);
        }
      });
    }
  }, [brandKit?.fonts]);

  const handleSave = async (updatedKit = brandKit) => {
    try {
      setSaving(true);
      const saved = await saveBrandKit(updatedKit);
      setBrandKit(saved);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to save brand kit.');
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (index: number, value: string) => {
    const nextColors = [...brandKit.colors];
    nextColors[index] = value;
    const nextKit = { ...brandKit, colors: nextColors };
    setBrandKit(nextKit);
    handleSave(nextKit);
  };

  const handleAddColor = () => {
    if (brandKit.colors.length >= 8) return;
    const nextKit = { ...brandKit, colors: [...brandKit.colors, '#7C3AED'] };
    setBrandKit(nextKit);
    handleSave(nextKit);
  };

  const handleRemoveColor = (index: number) => {
    if (brandKit.colors.length <= 1) return;
    const nextColors = brandKit.colors.filter((_, i) => i !== index);
    const nextKit = { ...brandKit, colors: nextColors };
    setBrandKit(nextKit);
    handleSave(nextKit);
  };

  const handleFontChange = (index: number, value: string) => {
    const nextFonts = [...brandKit.fonts];
    nextFonts[index] = value;
    const nextKit = { ...brandKit, fonts: nextFonts };
    setBrandKit(nextKit);
    handleSave(nextKit);
  };

  const handleRemoveLogo = (index: number) => {
    const nextLogos = brandKit.logos.filter((_, i) => i !== index);
    const nextKit = { ...brandKit, logos: nextLogos };
    setBrandKit(nextKit);
    handleSave(nextKit);
  };

  const handleRemoveAsset = (index: number) => {
    const nextAssets = brandKit.assets.filter((_, i) => i !== index);
    const nextKit = { ...brandKit, assets: nextAssets };
    setBrandKit(nextKit);
    handleSave(nextKit);
  };

  // Convert custom uploaded image to base64 and save
  const handleUploadImage = (type: 'logo' | 'asset') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (!base64) return;

      const nextKit = {
        ...brandKit,
        logos: type === 'logo' ? [...brandKit.logos, base64] : brandKit.logos,
        assets: type === 'asset' ? [...brandKit.assets, base64] : brandKit.assets,
      };
      setBrandKit(nextKit);
      await handleSave(nextKit);
    };
    reader.readAsDataURL(file);
  };

  // Run AI Brand Kit generation
  const handleAutoBrandGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      setError('Brand Name is required');
      return;
    }

    const suggestCost = getOperationCost('brandkit/suggest');
    let tokenCheck = checkDemoTokens(suggestCost);
    if (!tokenCheck.ok) {
      setError(tokenCheck.error || 'Not enough credits for brand suggestion');
      return;
    }

    try {
      setError('');
      setGeneratingStep('suggesting');
      setStepDetail('Consulting local AI models for brand alignment guidelines...');

      // 1. Get suggestions (colors, fonts, logo prompt, asset prompts)
      const suggestionData = await suggestBrandKit({
        brandName,
        brandType,
        description,
      });

      deductDemoTokens(suggestCost);

      // Set suggestions for review step
      setSuggestions(suggestionData);
      setEditedColors([...suggestionData.colors]);
      setEditedFonts(
        suggestionData.fonts.map((font) => (GOOGLE_FONTS.includes(font) ? font : 'Inter'))
      );
      setEditedLogoPrompt(suggestionData.logo_prompt);
      setEditedAssetPrompts([...suggestionData.asset_prompts]);
      setGeneratingStep('review');
      setStepDetail('Review and customize your brand identity before generating');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during brand suggestion.');
      setGeneratingStep('idle');
    }
  };

  // Generate logo variations
  const handleGenerateLogos = async (count: number = 4) => {
    if (!editedLogoPrompt.trim()) return;
    
    const generateCost = getOperationCost('generate') * count;
    const tokenCheck = checkDemoTokens(generateCost);
    if (!tokenCheck.ok) {
      setError(tokenCheck.error || 'Not enough credits for logo generation');
      return;
    }

    setGeneratingLogos(true);
    setError('');
    setGeneratingStep('logo');
    setStepDetail(`Generating ${count} logo variations...`);

    try {
      const logoPromises = Array.from({ length: count }, (_, i) => 
        generateImage({
          prompt: editedLogoPrompt,
          width: 512,
          height: 512,
          steps: 25,
          seed: Date.now() + i,
        })
      );

      const results = await Promise.all(logoPromises);
      const urls = results.map(r => r.url);
      setLogoVariations(urls);
      setSelectedLogoIndex(0);
      deductDemoTokens(generateCost);
      
      // Update brand kit with first logo
      const nextKit = { ...brandKit, logos: [urls[0]], colors: editedColors, fonts: editedFonts };
      setBrandKit(nextKit);
    } catch (err: any) {
      console.error('Failed to generate logos:', err);
      setError(err.message || 'Failed to generate logo variations');
    } finally {
      setGeneratingLogos(false);
      setGeneratingStep('review');
    }
  };

  // Generate asset variations
  const handleGenerateAssets = async (assetIndex: number, count: number = 2) => {
    const prompt = editedAssetPrompts[assetIndex];
    if (!prompt?.trim()) return;

    const generateCost = getOperationCost('generate') * count;
    const tokenCheck = checkDemoTokens(generateCost);
    if (!tokenCheck.ok) {
      setError(tokenCheck.error || 'Not enough credits for asset generation');
      return;
    }

    setGeneratingAssets(prev => new Set(prev).add(assetIndex));
    setError('');
    setGeneratingStep(assetIndex === 0 ? 'asset1' : 'asset2');
    setStepDetail(`Generating ${count} asset variations...`);

    try {
      const assetPromises = Array.from({ length: count }, (_, i) =>
        generateImage({
          prompt,
          width: 768,
          height: 768,
          steps: 25,
          seed: Date.now() + i + assetIndex * 10,
        })
      );

      const results = await Promise.all(assetPromises);
      const urls = results.map(r => r.url);
      setAssetVariations(prev => ({ ...prev, [assetIndex]: urls }));
      deductDemoTokens(generateCost);

      // Update brand kit with first asset
      const nextAssets = [...brandKit.assets];
      nextAssets[assetIndex] = urls[0];
      const nextKit = { ...brandKit, assets: nextAssets, colors: editedColors, fonts: editedFonts };
      setBrandKit(nextKit);
    } catch (err: any) {
      console.error(`Failed to generate asset ${assetIndex}:`, err);
      setError(err.message || 'Failed to generate asset variations');
    } finally {
      setGeneratingAssets(prev => {
        const next = new Set(prev);
        next.delete(assetIndex);
        return next;
      });
      setGeneratingStep('review');
    }
  };

  // Select logo variation
  const handleSelectLogo = (index: number) => {
    setSelectedLogoIndex(index);
    const nextKit = { ...brandKit, logos: [logoVariations[index]], colors: editedColors, fonts: editedFonts };
    setBrandKit(nextKit);
  };

  // Select asset variation
  const handleSelectAsset = (assetIndex: number, variationIndex: number) => {
    const variations = assetVariations[assetIndex];
    if (!variations?.[variationIndex]) return;
    const nextAssets = [...brandKit.assets];
    nextAssets[assetIndex] = variations[variationIndex];
    const nextKit = { ...brandKit, assets: nextAssets, colors: editedColors, fonts: editedFonts };
    setBrandKit(nextKit);
  };

  // Save final brand kit
  const handleFinalizeBrandKit = async () => {
    if (brandKit.logos.length === 0) {
      setError('Please generate at least one logo first');
      return;
    }

    setGeneratingStep('saving');
    setStepDetail('Finalizing your custom brand identity kit...');
    
    try {
      await handleSave({
        ...brandKit,
        colors: editedColors,
        fonts: editedFonts,
      });
      setGeneratingStep('done');
      setShowGenerator(false);
      // Reset generator state
      setSuggestions(null);
      setEditedColors([]);
      setEditedFonts([]);
      setEditedLogoPrompt('');
      setEditedAssetPrompts([]);
      setLogoVariations([]);
      setAssetVariations({});
    } catch (err: any) {
      setError(err.message || 'Failed to save brand kit');
      setGeneratingStep('review');
    }
  };

  // Reset generator
  const handleResetGenerator = () => {
    setShowGenerator(false);
    setGeneratingStep('idle');
    setSuggestions(null);
    setEditedColors([]);
    setEditedFonts([]);
    setEditedLogoPrompt('');
    setEditedAssetPrompts([]);
    setLogoVariations([]);
    setAssetVariations({});
    setError('');
  };

  if (loading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        <p className="text-sm font-semibold text-slate-500">Loading brand kit...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ backgroundImage: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 55%, #6d28d9 100%)' }}
      >
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-purple-200">Brand Kit</p>
          <h2 className="mt-2 text-xl sm:text-2xl font-black">Keep every generation on-brand</h2>
        </div>
        <button
          onClick={() => {
            setShowGenerator(!showGenerator);
            setGeneratingStep('idle');
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-purple-800 hover:-translate-y-0.5 transition-transform"
        >
          {showGenerator ? <X size={15} /> : <Wand2 size={15} />}
          {showGenerator ? 'Close Generator' : 'Auto Branding'}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Auto Branding Generator Form Panel */}
      {showGenerator && (
        <div className={`${card} border-purple-500/50 bg-gradient-to-br from-white to-purple-50/20 dark:from-[#0c0c14] dark:to-purple-950/5 reveal-up`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                AI Identity Architect
              </h3>
            </div>
            <button
              onClick={handleResetGenerator}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold flex items-center gap-0.5"
            >
              <X size={14} /> Close
            </button>
          </div>

          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-between">
            {[
              { id: 'review', label: 'Review', icon: <Eye size={14} /> },
              { id: 'logo', label: 'Logos', icon: <ImageIcon size={14} /> },
              { id: 'asset1', label: 'Asset 1', icon: <FolderOpen size={14} /> },
              { id: 'asset2', label: 'Asset 2', icon: <FolderOpen size={14} /> },
              { id: 'done', label: 'Save', icon: <Save size={14} /> },
            ].map((step, i) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    ['review', 'logo', 'asset1', 'asset2', 'done'].indexOf(generatingStep) >= ['review', 'logo', 'asset1', 'asset2', 'done'].indexOf(step.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-200 text-slate-400 dark:bg-slate-700'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`ml-1 text-[10px] font-semibold uppercase tracking-wide ${
                    ['review', 'logo', 'asset1', 'asset2', 'done'].indexOf(generatingStep) >= ['review', 'logo', 'asset1', 'asset2', 'done'].indexOf(step.id)
                      ? 'text-purple-600 dark:text-purple-300'
                      : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                  {i < 4 && <div className="hidden lg:block w-16 h-0.5 ml-1 bg-slate-200 dark:bg-slate-700" />}
                </div>
              </React.Fragment>
            ))}
          </div>

          {generatingStep === 'idle' && (
            <form onSubmit={handleAutoBrandGenerate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="brand-name" className={label}>Brand Name</label>
                  <input
                    id="brand-name"
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. EcoSphere or Veloce Motors"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131320] px-4 py-2.5 text-xs font-semibold focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="brand-type" className={label}>What type of brand is that?</label>
                  <select
                    id="brand-type"
                    value={brandType}
                    onChange={(e) => setBrandType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131320] px-4 py-2.5 text-xs font-semibold focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Tech Startup">SaaS / Tech Startup</option>
                    <option value="Eco / Organic">Organic / Nature Brand</option>
                    <option value="Luxury Fashion">Luxury Fashion / Cosmetics</option>
                    <option value="Corporate / Finance">Corporate / Finance</option>
                    <option value="Playful / Food / Fun">Playful / Creative / Food</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="brand-desc" className={label}>Brand Description & Mood</label>
                <textarea
                  id="brand-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your brand values, target audience, or aesthetic preference (e.g. 'minimalist organic soap, pastel colors, calming feeling')"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131320] px-4 py-2.5 text-xs font-semibold focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                <span>Estimated cost:</span>
                <span className="font-bold text-purple-600 dark:text-purple-300">
                  {getOperationCost('brandkit/suggest') + getOperationCost('generate') * 5} credits
                </span>
                <span className="text-slate-400">
                  (suggest: {getOperationCost('brandkit/suggest')} + 5 × generate: {getOperationCost('generate')})
                </span>
              </p>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider py-3 transition-colors"
              >
                <Sparkles size={14} /> Start Brand Kit Generation
              </button>
            </form>
          )}

          {generatingStep === 'review' && suggestions && (
            <div className="space-y-6">
              {/* Colors Editor */}
              <div className="space-y-3">
                <label className={label}>Brand Colors <span className="text-slate-400 font-normal">(click to edit)</span></label>
                <div className="flex flex-wrap gap-3">
                  {editedColors.map((c, i) => (
                    <div key={i} className="relative group">
                      <div className="relative w-14 h-14 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" style={{ backgroundColor: c }}>
                        <input
                          type="color"
                          value={c}
                          onChange={(e) => {
                            const next = [...editedColors];
                            next[i] = e.target.value;
                            setEditedColors(next);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                      <p className="mt-1.5 text-[10px] font-semibold text-slate-500 uppercase">{c}</p>
                      {editedColors.length > 1 && (
                        <button
                          onClick={() => setEditedColors(editedColors.filter((_, idx) => idx !== i))}
                          className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                  {editedColors.length < 8 && (
                    <button
                      onClick={() => setEditedColors([...editedColors, '#7C3AED'])}
                      className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:border-purple-500 hover:text-purple-600 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Fonts Editor */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className={label}>Typography <span className="text-slate-400 font-normal">(header, body, accent)</span></label>
                <div className="space-y-3">
                  {editedFonts.map((f, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                          {i === 0 ? 'Header Font' : i === 1 ? 'Body Font' : 'Accent/UI Font'}
                        </span>
                        <span className="text-base font-bold transition-all" style={{ fontFamily: f }}>{f}</span>
                      </div>
                      <select
                        value={f}
                        onChange={(e) => {
                          const next = [...editedFonts];
                          next[i] = e.target.value;
                          setEditedFonts(next);
                        }}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131320] px-2.5 py-1 text-xs font-semibold focus:outline-none"
                      >
                        {GOOGLE_FONTS.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logo Prompt Editor */}
              <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className={label}>Logo Prompt</label>
                <textarea
                  value={editedLogoPrompt}
                  onChange={(e) => setEditedLogoPrompt(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131320] px-4 py-2.5 text-xs font-semibold focus:border-purple-500 focus:outline-none resize-none"
                />
                <button
                  onClick={() => handleGenerateLogos(4)}
                  disabled={generatingLogos}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider py-2.5 px-4 transition-colors disabled:opacity-50"
                >
                  {generatingLogos ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Generate 4 Logo Variations ({getOperationCost('generate') * 4} credits)
                </button>
              </div>

              {/* Asset Prompts Editor */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className={label}>Brand Asset Prompts</label>
                {editedAssetPrompts.map((prompt, i) => (
                  <div key={i} className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Asset {i + 1} {i === 0 ? '(Primary Pattern)' : '(Secondary Pattern)'}
                      </span>
                    </div>
                    <textarea
                      value={prompt}
                      onChange={(e) => {
                        const next = [...editedAssetPrompts];
                        next[i] = e.target.value;
                        setEditedAssetPrompts(next);
                      }}
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131320] px-3 py-2 text-xs font-medium focus:border-purple-500 focus:outline-none resize-none"
                    />
                    <button
                      onClick={() => handleGenerateAssets(i, 2)}
                      disabled={generatingAssets.has(i)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-2 px-3 transition-colors disabled:opacity-50"
                    >
                      {generatingAssets.has(i) ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Generate 2 Variations ({getOperationCost('generate') * 2} credits)
                    </button>
                  </div>
                ))}
              </div>

              {/* Generate Logos Preview */}
              {logoVariations.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <label className={label}>Generated Logos <span className="text-slate-400 font-normal">(click to select)</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {logoVariations.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectLogo(i)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          selectedLogoIndex === i ? 'ring-2 ring-purple-500 scale-[1.02]' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
                        }`}
                      >
                        <img src={url} alt={`Logo variation ${i + 1}`} className="w-full h-full object-contain p-4 bg-white dark:bg-slate-900" />
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                    Selected: Variation {selectedLogoIndex + 1}
                  </p>
                </div>
              )}

              {/* Generate Assets Preview */}
              {Object.keys(assetVariations).length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <label className={label}>Generated Assets</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(assetVariations).map(([assetIndex, variations]) => (
                      <div key={assetIndex} className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase">
                          Asset {Number(assetIndex) + 1} Variations
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {variations.map((url, i) => (
                            <button
                              key={i}
                              onClick={() => handleSelectAsset(Number(assetIndex), i)}
                              className="aspect-square rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                            >
                              <img src={url} alt={`Asset ${Number(assetIndex) + 1} variation ${i + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Finalize Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                <button
                  onClick={() => setGeneratingStep('idle')}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c0c14] py-3 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                >
                  Back to Input
                </button>
                <button
                  onClick={handleFinalizeBrandKit}
                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider py-3 transition-colors"
                >
                  <Save size={14} className="mr-1 inline" />
                  Save Brand Kit
                </button>
              </div>
            </div>
          )}

          {generatingStep !== 'review' && generatingStep !== 'idle' && generatingStep !== 'done' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {generatingStep === 'suggesting' && '💡 Aligning Design System...'}
                  {generatingStep === 'logo' && '🎨 Generating Logo Variations...'}
                  {generatingStep === 'asset1' && '🖼️ Generating Primary Asset...'}
                  {generatingStep === 'asset2' && '🌀 Generating Secondary Asset...'}
                  {generatingStep === 'saving' && '💾 Archiving Identity...'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">{stepDetail}</p>
              </div>
            </div>
          )}

          {generatingStep === 'done' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Sparkles size={28} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-black text-slate-800 dark:text-slate-200">Brand Kit Created!</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your custom identity is ready to use across all generators.</p>
              <button
                onClick={handleResetGenerator}
                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider py-2.5 px-6 transition-colors"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      )}

      {/* Brand Kit Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colors */}
        <div className={`${card} reveal-up`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-purple-500" />
              <span className={label}>Brand Colors</span>
            </div>
            {brandKit.colors.length < 8 && (
              <button
                onClick={handleAddColor}
                className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-0.5"
              >
                <Plus size={14} /> Add Color
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {brandKit.colors.map((c, i) => (
              <div key={i} className="text-center relative group">
                <div className="relative w-14 h-14 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" style={{ backgroundColor: c }}>
                  <input
                    type="color"
                    value={c}
                    onChange={(e) => handleColorChange(i, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <p className="mt-1.5 text-[10px] font-semibold text-slate-500 uppercase">{c}</p>
                {brandKit.colors.length > 1 && (
                  <button
                    onClick={() => handleRemoveColor(i)}
                    className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fonts */}
        <div className={`${card} reveal-up`}>
          <div className="flex items-center gap-2 mb-4">
            <Type size={16} className="text-purple-500" />
            <span className={label}>Fonts & Typography</span>
          </div>
          <div className="space-y-3">
            {brandKit.fonts.map((f, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                    {i === 0 ? 'Header Font' : i === 1 ? 'Body Font' : 'Accent/UI Font'}
                  </span>
                  <span className="text-base font-bold transition-all" style={{ fontFamily: f }}>{f}</span>
                </div>
                <select
                  value={f}
                  onChange={(e) => handleFontChange(i, e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131320] px-2.5 py-1 text-xs font-semibold focus:outline-none"
                >
                  {GOOGLE_FONTS.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Logos */}
        <div className={`${card} reveal-up`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-purple-500" />
              <span className={label}>Brand Logos</span>
            </div>
            <label className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-0.5 cursor-pointer">
              <Upload size={13} />
              <span>Upload Custom</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage('logo')} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {brandKit.logos.length > 0 ? (
              brandKit.logos.map((l, i) => (
                <div key={i} className="aspect-video rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative group border border-slate-100 dark:border-slate-800">
                  <img src={l} alt="Logo" className="max-h-full max-w-full object-contain" />
                  <button
                    onClick={() => handleRemoveLogo(i)}
                    className="absolute top-2 right-2 rounded-full bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No logos created yet. Upload a logo or use 'Auto Branding'.
              </div>
            )}
          </div>
        </div>

        {/* Brand assets */}
        <div className={`${card} reveal-up`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderOpen size={16} className="text-purple-500" />
              <span className={label}>Brand Assets / Patterns</span>
            </div>
            <label className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-0.5 cursor-pointer">
              <Upload size={13} />
              <span>Upload Custom</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage('asset')} />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {brandKit.assets.length > 0 ? (
              brandKit.assets.map((a, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 relative group border border-slate-200 dark:border-slate-800">
                  <img src={a} alt="Asset" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveAsset(i)}
                    className="absolute top-2 right-2 rounded-full bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No custom assets created yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brand Templates - Dynamic Previews */}
      <div className={`${card} reveal-up`}>
        <div className="flex items-center gap-2 mb-4">
          <LayoutTemplate size={16} className="text-purple-500" />
          <span className={label}>Interactive Brand Templates (Live Preview)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Social Post */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-[#131320] flex flex-col justify-between">
            <div 
              className="aspect-square rounded-lg mb-2 p-4 flex flex-col justify-between relative overflow-hidden text-white"
              style={{
                background: `linear-gradient(135deg, ${brandKit.colors[0]} 0%, ${brandKit.colors[1] || brandKit.colors[0]} 100%)`
              }}
            >
              {/* Asset background overlay if available */}
              {brandKit.assets[0] && (
                <img src={brandKit.assets[0]} alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay" />
              )}
              
              <div className="flex items-center justify-between z-10">
                <span className="text-[9px] font-black tracking-widest uppercase" style={{ fontFamily: brandKit.fonts[1] }}>
                  {brandName || 'BRAND'}
                </span>
                {brandKit.logos[0] && (
                  <img src={brandKit.logos[0]} alt="Logo" className="w-6 h-6 object-contain rounded bg-white/20 p-0.5" />
                )}
              </div>
              
              <div className="z-10 mt-auto">
                <h4 className="text-sm font-black leading-tight" style={{ fontFamily: brandKit.fonts[0] }}>
                  The Future of Branding is AI
                </h4>
                <p className="text-[8px] text-white/80 mt-1" style={{ fontFamily: brandKit.fonts[1] }}>
                  Explore customizable layouts instantly.
                </p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Social Post</p>
              <p className="text-[9px] text-slate-400 mt-0.5">1080x1080 Instagram feed layout</p>
            </div>
          </div>

          {/* Presentation Cover */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-[#131320] flex flex-col justify-between">
            <div 
              className="aspect-square rounded-lg mb-2 p-4 flex flex-col justify-between text-slate-900 relative overflow-hidden"
              style={{
                backgroundColor: brandKit.colors[4] || '#ffffff'
              }}
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-40" style={{ backgroundColor: brandKit.colors[2] || brandKit.colors[0] }} />
              <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full opacity-30" style={{ backgroundColor: brandKit.colors[0] }} />
              
              <div className="z-10 flex items-center gap-1.5">
                {brandKit.logos[0] && (
                  <img src={brandKit.logos[0]} alt="Logo" className="w-5 h-5 object-contain" />
                )}
                <span className="text-[9px] font-black uppercase tracking-wider" style={{ fontFamily: brandKit.fonts[1] }}>
                  {brandName || 'BRAND'}
                </span>
              </div>
              
              <div className="z-10 my-auto text-left">
                <span className="text-[8px] font-black uppercase text-purple-600 tracking-widest block mb-1">
                  Design system v1.0
                </span>
                <h4 className="text-xs font-black tracking-tight leading-snug" style={{ fontFamily: brandKit.fonts[0] }}>
                  Quarterly Alignment & Brand Strategy
                </h4>
              </div>
              
              <div className="z-10 flex justify-between items-center text-[7px] text-slate-400 font-bold border-t border-slate-100 pt-1.5">
                <span>Presenter: AI Engine</span>
                <span>2026</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Presentation Deck</p>
              <p className="text-[9px] text-slate-400 mt-0.5">16:9 widescreen slides</p>
            </div>
          </div>

          {/* Email Banner */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-[#131320] flex flex-col justify-between">
            <div 
              className="aspect-square rounded-lg mb-2 p-4 flex flex-col justify-between text-white relative overflow-hidden"
              style={{
                backgroundColor: brandKit.colors[3] || '#0f172a'
              }}
            >
              <div 
                className="absolute top-0 right-0 w-2/3 h-full opacity-60" 
                style={{
                  background: `linear-gradient(225deg, ${brandKit.colors[0]} 0%, transparent 100%)`
                }}
              />
              
              <div className="z-10 flex items-center justify-between">
                <span className="text-[8px] font-black tracking-wider uppercase" style={{ fontFamily: brandKit.fonts[1] }}>
                  {brandName || 'BRAND'}
                </span>
              </div>
              
              <div className="z-10 mt-auto text-left">
                <h4 className="text-xs font-black tracking-tight" style={{ fontFamily: brandKit.fonts[0] }}>
                  Thank you for your order!
                </h4>
                <p className="text-[7px] text-white/60 mt-0.5">
                  Your creative bundle is ready to download.
                </p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Email Banner</p>
              <p className="text-[9px] text-slate-400 mt-0.5">600x200 newsletter header</p>
            </div>
          </div>

          {/* Ad Creative */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-[#131320] flex flex-col justify-between">
            <div 
              className="aspect-square rounded-lg mb-2 p-4 flex flex-col justify-between text-white relative overflow-hidden"
              style={{
                background: `radial-gradient(circle at top left, ${brandKit.colors[1] || brandKit.colors[0]} 0%, ${brandKit.colors[3] || '#0f172a'} 100%)`
              }}
            >
              {/* Asset pattern if available */}
              {brandKit.assets[1] && (
                <img src={brandKit.assets[1]} alt="asset" className="absolute inset-0 w-full h-full object-cover opacity-20" />
              )}
              
              <div className="z-10">
                <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[6.5px] font-black uppercase tracking-wider">
                  Special Offer
                </span>
              </div>
              
              <div className="z-10 mt-auto text-left">
                <h4 className="text-xs font-black leading-tight" style={{ fontFamily: brandKit.fonts[0] }}>
                  Create Smarter, Generate Faster.
                </h4>
                <div 
                  className="inline-block mt-2 rounded px-2.5 py-1 text-[7px] font-black uppercase tracking-wider text-center text-slate-900 bg-white"
                  style={{ color: brandKit.colors[3] }}
                >
                  Try Now
                </div>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Ad Creative</p>
              <p className="text-[9px] text-slate-400 mt-0.5">1200x628 landscape marketing ad</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
