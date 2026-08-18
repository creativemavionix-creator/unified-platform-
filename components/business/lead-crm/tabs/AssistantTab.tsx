'use client';

import { useEffect, useState } from 'react';
import {
  Sparkles,
  Mail,
  MessageCircle,
  Phone,
  Check,
  X,
  Wand2,
  Copy,
  FileText,
  CheckCircle2,
  ChevronRight,
  Bot,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { CALL_SCRIPTS } from '../leadCrmMockData';
import {
  analyzeCrmLead,
  checkCrmHealth,
  generateCrmCallScript,
  generateCrmDraft,
  generateCrmRecommendations,
} from '@/lib/crm/api';
import {
  addActivity,
  dismissRecommendation,
  setRecommendations,
  updateLead,
} from '@/lib/crm/store';
import { useCrmStore } from '@/hooks/use-crm-store';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5 shadow-sm transition-all duration-200';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 flex items-center gap-1.5';

const priorityStyles: Record<string, string> = {
  high: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50 dark:border-red-500/20',
  medium: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/20',
};

const DRAFT_TYPES = [
  { id: 'email' as const, label: 'Personalized Email', icon: Mail },
  { id: 'whatsapp' as const, label: 'WhatsApp Message', icon: MessageCircle },
  { id: 'call' as const, label: 'Call Script', icon: Phone },
];

export default function AssistantTab() {
  const { state } = useCrmStore();
  const leads = state.leads;
  const recommendations = state.recommendations;

  const [draftType, setDraftType] = useState<'email' | 'whatsapp' | 'call'>('email');
  const [leadId, setLeadId] = useState<string>(leads[0]?.id || '');
  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ollama, setOllama] = useState<'checking' | 'ok' | 'unreachable'>('checking');
  const [selectedScript, setSelectedScript] = useState<(typeof CALL_SCRIPTS)[0] | { id: string; title: string; preview: string } | null>(null);
  const [scripts, setScripts] = useState(CALL_SCRIPTS);

  const lead = leads.find((l) => l.id === leadId) || leads[0];

  useEffect(() => {
    if (!leadId && leads[0]?.id) setLeadId(leads[0].id);
  }, [leads, leadId]);

  useEffect(() => {
    let alive = true;
    checkCrmHealth()
      .then((h) => {
        if (!alive) return;
        setOllama(h.ollama === 'ok' ? 'ok' : 'unreachable');
      })
      .catch(() => {
        if (!alive) return;
        setOllama('unreachable');
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleApprove = (id: string) => {
    const rec = recommendations.find((r) => r.id === id);
    dismissRecommendation(id);
    if (rec) {
      addActivity({
        leadId: rec.leadId,
        type: 'ai-action',
        title: `Approved: ${rec.action}`,
        detail: rec.message,
        aiGenerated: true,
      });
    }
  };

  const handleDismiss = (id: string) => {
    dismissRecommendation(id);
  };

  const refreshRecs = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const result = await generateCrmRecommendations(leads.slice(0, 8));
      setRecommendations(result.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh recommendations');
    } finally {
      setRefreshing(false);
    }
  };

  const generate = async () => {
    if (!lead) return;
    setGenerating(true);
    setCopied(false);
    setError(null);
    try {
      const result = await generateCrmDraft({ type: draftType, lead });
      setDraft(result.draft);
      addActivity({
        leadId: lead.id,
        type: draftType === 'call' ? 'call' : draftType === 'whatsapp' ? 'whatsapp' : 'email',
        title: `AI drafted ${draftType} outreach`,
        detail: result.draft.slice(0, 160),
        aiGenerated: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Draft generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const reanalyzeLead = async () => {
    if (!lead) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeCrmLead(lead);
      updateLead(lead.id, {
        aiSummary: result.aiSummary,
        nextAction: result.nextAction,
        score: result.score,
        buyingIntent: result.buyingIntent,
        engagementScore: result.engagementScore,
        conversionProbability: result.conversionProbability,
        fitScore: result.fitScore,
        priority: result.priority,
        tags: result.tags.length ? result.tags : lead.tags,
      });
      addActivity({
        leadId: lead.id,
        type: 'ai-action',
        title: 'AI re-scored this lead',
        detail: `Score ${result.score}/100 · ${result.nextAction}`,
        aiGenerated: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lead analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const customScript = async () => {
    if (!lead) return;
    setGenerating(true);
    setError(null);
    try {
      const result = await generateCrmCallScript({ lead });
      const script = { id: result.id, title: result.title, preview: result.preview };
      setScripts((prev) => [script, ...prev].slice(0, 8));
      setSelectedScript(script);
      addActivity({
        leadId: lead.id,
        type: 'call',
        title: `AI call script: ${result.title}`,
        detail: result.preview.slice(0, 160),
        aiGenerated: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Call script failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyDraft = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="reveal-up rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] shadow-sm">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-purple-600 dark:text-purple-400">
              <Sparkles size={14} className="animate-pulse" /> AI SDR Performance
            </p>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                ollama === 'ok'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                  : ollama === 'checking'
                    ? 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${ollama === 'ok' ? 'bg-emerald-500 animate-ping' : 'bg-current'}`} />
              {ollama === 'ok' ? 'Ollama ready (llama3:8b)' : ollama === 'checking' ? 'Checking Ollama…' : 'Ollama offline — start ollama serve'}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { label: 'Leads in Pipeline', value: leads.length.toLocaleString() },
              { label: 'AI Activities', value: state.activities.filter((a) => a.aiGenerated).length.toLocaleString() },
              { label: 'High Priority', value: leads.filter((l) => l.priority === 'high').length },
              { label: 'Avg Score', value: Math.round(leads.reduce((s, l) => s + l.score, 0) / Math.max(1, leads.length)) },
              { label: 'Active Workflows', value: state.workflows.filter((w) => w.status === 'active').length },
              { label: 'Awaiting Approval', value: recommendations.length },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{s.value}</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${card} reveal-up flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className={label}>
                <Bot size={13} /> Needs Your Approval
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {recommendations.length} Pending
                </span>
                <button
                  type="button"
                  onClick={() => void refreshRecs()}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 disabled:opacity-60"
                >
                  {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  AI Refresh
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {recommendations.length > 0 ? (
                recommendations.map((r) => (
                  <div key={r.id} className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 p-3.5 hover:border-purple-200 dark:hover:border-purple-900/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{r.leadName}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${priorityStyles[r.priority]}`}>
                            {r.priority}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-400 line-clamp-2">{r.message}</p>
                        <p className="mt-1.5 text-[11px] font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1">
                          <span>Suggested:</span> {r.action}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleApprove(r.id)}
                          title="Approve action"
                          className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismiss(r.id)}
                          title="Dismiss action"
                          className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white flex items-center justify-center transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                  <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">All recommendations reviewed!</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Refresh with Ollama for a new AI review queue.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`${card} reveal-up`}>
          <span className={label}>
            <Wand2 size={13} /> Generate Outreach Draft
          </span>

          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {DRAFT_TYPES.map((d) => {
              const Icon = d.icon;
              const isActive = draftType === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setDraftType(d.id);
                    setDraft('');
                  }}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2.5 text-[10.5px] font-bold transition-all ${
                    isActive
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon size={16} /> {d.label}
                </button>
              );
            })}
          </div>

          <select
            value={leadId}
            onChange={(e) => {
              setLeadId(e.target.value);
              setDraft('');
            }}
            className="mt-3 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2.5 text-[12.5px] text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 outline-none transition-all"
          >
            {leads.slice(0, 24).map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} — {l.company}
              </option>
            ))}
          </select>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void generate()}
              disabled={generating || !lead}
              className="inline-flex items-center justify-center gap-2 rounded-xl py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-70 shadow-sm"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              {generating ? 'Generating…' : 'Generate AI Draft'}
            </button>
            <button
              type="button"
              onClick={() => void reanalyzeLead()}
              disabled={analyzing || !lead}
              className="inline-flex items-center justify-center gap-2 rounded-xl py-2.5 border border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 disabled:opacity-70"
            >
              {analyzing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Re-score Lead
            </button>
          </div>

          {lead && (
            <p className="mt-3 text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
              <span className="font-bold text-purple-600 dark:text-purple-300">AI summary:</span> {lead.aiSummary}
            </p>
          )}

          {draft && (
            <div className="relative mt-3 group">
              <textarea
                readOnly
                value={draft}
                className="w-full h-36 resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 text-[12px] leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopyDraft(draft)}
                className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-sm"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Copy
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`${card} reveal-up`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={label}>
            <FileText size={13} /> Call Script Library
          </span>
          <button
            type="button"
            onClick={() => void customScript()}
            disabled={generating || !lead}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white disabled:opacity-60"
            style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
          >
            <StarIcon /> AI Script for Selected Lead
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {scripts.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedScript(s)}
              className="group cursor-pointer rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 p-4 hover:border-purple-500/50 hover:bg-purple-50/30 dark:hover:bg-purple-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {s.title}
                </p>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="mt-1.5 text-[11.5px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-normal">{s.preview}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-6 shadow-2xl relative">
            <button type="button" onClick={() => setSelectedScript(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Phone size={16} />
              <p className="text-[11px] font-black uppercase tracking-wider">Script Preview</p>
            </div>
            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{selectedScript.title}</h3>
            <div className="mt-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 text-[12.5px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {selectedScript.preview}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedScript(null)} className="px-4 py-2 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCopyDraft(selectedScript.preview);
                  setSelectedScript(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[12px] font-bold"
              >
                <Copy size={13} /> Copy Script
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StarIcon() {
  return <Sparkles size={12} />;
}
