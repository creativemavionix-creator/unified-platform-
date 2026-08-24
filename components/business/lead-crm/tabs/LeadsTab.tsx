import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Upload,
  X,
  Mail,
  Phone,
  MessageCircle,
  Globe,
  MapPin,
  Building2,
  Star,
  Sparkles,
  Copy,
  Check,
  MoreVertical,
  ChevronRight,
  Trash2,
  UserCheck,
  Download,
  ArrowUpRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { CALL_SCRIPTS, type Lead } from '../leadCrmMockData';
import { useCrmStore } from '@/hooks/use-crm-store';
import { addActivity, updateLead, addLead, deleteLead } from '@/lib/crm/store';
import { analyzeCrmLead, generateCrmDraft } from '@/lib/crm/api';

// Styles Helper
const cardStyle = 'rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0c0c14]/80 backdrop-blur-md p-5 shadow-xs transition-all duration-200';

const STATUS_STYLES: Record<Lead['status'], { badge: string; dot: string }> = {
  new: {
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  contacted: {
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200 dark:border-sky-800/50',
    dot: 'bg-sky-500',
  },
  qualified: {
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    dot: 'bg-emerald-500',
  },
  nurturing: {
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    dot: 'bg-amber-500',
  },
  proposal: {
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
    dot: 'bg-purple-500',
  },
  won: {
    badge: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400 border-green-200 dark:border-green-800/50',
    dot: 'bg-green-500',
  },
  lost: {
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
    dot: 'bg-rose-500',
  },
};

const KANBAN_STAGES: Lead['status'][] = ['new', 'contacted', 'qualified', 'nurturing', 'proposal', 'won'];
const STATUS_FILTERS = ['All', ...KANBAN_STAGES, 'lost'];

interface LeadsTabProps {
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
  onOpenCreate?: () => void;
}

export default function LeadsTab({ isCreateOpen, onCloseCreate, onOpenCreate }: LeadsTabProps = {}) {
  const { state } = useCrmStore();
  const leads = state.leads;
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'score' | 'priority' | 'name'>('recent');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [localCreateOpen, setLocalCreateOpen] = useState(false);

  const showCreateModal = typeof isCreateOpen === 'boolean' ? isCreateOpen : localCreateOpen;
  const handleOpenCreate = () => {
    if (onOpenCreate) onOpenCreate();
    else setLocalCreateOpen(true);
  };
  const handleCloseCreate = () => {
    if (onCloseCreate) onCloseCreate();
    else setLocalCreateOpen(false);
  };

  const handleLeadCreated = (newLead: Lead) => {
    setSelectedLead(newLead);
  };

  // Keep drawer lead in sync with store mutations
  useEffect(() => {
    if (!selectedLead?.id) return;
    const fresh = leads.find((l) => l.id === selectedLead.id);
    if (fresh) setSelectedLead(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when store leads change
  }, [leads, selectedLead?.id]);

  // Filter & Sort Logic
  const filtered = leads
    .filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.company.toLowerCase().includes(search.toLowerCase()) ||
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        (l.tags && l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
      const matchesStatus = status === 'All' || l.status === status;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'priority') {
        const pMap: Record<Lead['priority'], number> = { high: 3, medium: 2, low: 1 };
        return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  // Toggle selection for individual items
  const toggleSelectLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Toggle all check items
  const toggleSelectAll = () => {
    if (checkedIds.length === filtered.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(filtered.map((l) => l.id));
    }
  };

  return (
    <div className="space-y-5 relative min-h-screen pb-16">
      {/* Search & Actions Toolbar */}
      <div className={`${cardStyle} flex flex-col md:flex-row md:items-center justify-between gap-3.5`}>
        {/* Search Field */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, title, company, or tags..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-[11px] font-semibold text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <option value="recent">Recent</option>
              <option value="score">Highest Score</option>
              <option value="priority">Priority</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* View Toggle Bar */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 p-1">
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === 'table'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title="Table View"
            >
              <List size={14} />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === 'kanban'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title="Kanban Board"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map((s) => {
          const count = s === 'All' ? leads.length : leads.filter((l) => l.status === s).length;
          const isActive = status === s;
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold capitalize transition-all shrink-0 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs shadow-purple-500/30'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {s}
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content View */}
      {view === 'table' ? (
        <div className={`${cardStyle} overflow-hidden p-0 border`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-black uppercase tracking-wider text-slate-400 select-none">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={checkedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500/40"
                    />
                  </th>
                  <th className="py-3 pr-4">Lead Info</th>
                  <th className="py-3 pr-4">Company</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Score</th>
                  <th className="py-3 pr-4">Owner</th>
                  <th className="py-3 pr-4">Last Activity</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((l) => {
                  const isChecked = checkedIds.includes(l.id);
                  const style = STATUS_STYLES[l.status] || STATUS_STYLES.new;
                  return (
                    <tr
                      key={l.id}
                      onClick={() => setSelectedLead(l)}
                      className={`group cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-purple-50/40 dark:bg-purple-900/10'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => toggleSelectLead(l.id, e as unknown as React.MouseEvent)}
                          className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500/40"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: l.avatarColor || '#8b5cf6' }}
                          >
                            {l.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                              {l.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{l.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-[12.5px] font-medium text-slate-600 dark:text-slate-300">
                        {l.company}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold capitalize ${style.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-600 dark:bg-purple-400 h-full rounded-full"
                              style={{ width: `${Math.min(l.score, 100)}%` }}
                            />
                          </div>
                          <span className="text-[12px] font-black text-purple-600 dark:text-purple-400">
                            {l.score}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-[12px] text-slate-500 dark:text-slate-400">{l.assignedTo}</td>
                      <td className="py-3 pr-4 text-[12px] text-slate-400">{l.lastActivity}</td>
                      <td className="py-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            title="Quick Mail"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Mail size={14} />
                          </button>
                          <button
                            title="Quick Call"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Phone size={14} />
                          </button>
                          <button
                            title="More Actions"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm font-bold text-slate-500">No leads found</p>
              <p className="text-[12px] text-slate-400">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {KANBAN_STAGES.map((stage) => {
            const stageLeads = filtered.filter((l) => l.status === stage);
            const stageStyle = STATUS_STYLES[stage];
            return (
              <div
                key={stage}
                className="flex flex-col rounded-2xl bg-slate-50/60 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 p-2.5 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stageStyle.dot}`} />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 capitalize">
                      {stage}
                    </span>
                  </div>
                  <span className="rounded-full bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {stageLeads.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => setSelectedLead(l)}
                      className="group cursor-pointer rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-3.5 shadow-xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700/60 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[12.5px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                          {l.name}
                        </p>
                        <span className="text-[10px] font-black text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded-md border border-purple-100 dark:border-purple-900/30 shrink-0">
                          {l.score} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{l.company}</p>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate max-w-[90px]">{l.assignedTo}</span>
                        <span>{l.lastActivity}</span>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="h-24 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-[11px] text-slate-400">
                      No leads
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Leads Floating Toolbar */}
      {checkedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200 border border-slate-800 dark:border-slate-200">
          <span className="text-xs font-bold">{checkedIds.length} leads selected</span>
          <div className="h-4 w-px bg-slate-700 dark:bg-slate-300" />
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 text-xs font-bold hover:text-purple-400 dark:hover:text-purple-600 transition-colors px-2 py-1">
              <UserCheck size={14} /> Assign
            </button>
            <button className="inline-flex items-center gap-1.5 text-xs font-bold hover:text-purple-400 dark:hover:text-purple-600 transition-colors px-2 py-1">
              <Download size={14} /> Export
            </button>
            <button
              onClick={() => {
                checkedIds.forEach((id) => deleteLead(id));
                setCheckedIds([]);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 dark:text-rose-600 hover:opacity-80 transition-opacity px-2 py-1"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
          <button
            onClick={() => setCheckedIds([])}
            className="p-1 rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 text-slate-400"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}

      <CreateLeadModal
        isOpen={showCreateModal}
        onClose={handleCloseCreate}
        onCreated={handleLeadCreated}
      />
    </div>
  );
}

function LeadDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { state } = useCrmStore();
  const [tab, setTab] = useState<'overview' | 'timeline' | 'ai'>('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<Lead['status']>(lead.status);
  const [busy, setBusy] = useState<string | null>(null);
  const [draftPreview, setDraftPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activities = state.activities.filter((a) => a.leadId === lead.id);

  useEffect(() => {
    setCurrentStatus(lead.status);
  }, [lead.id, lead.status]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopyScript = (id: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const persistStatus = (next: Lead['status']) => {
    setCurrentStatus(next);
    updateLead(lead.id, { status: next });
    addActivity({
      leadId: lead.id,
      type: 'note',
      title: `Stage moved to ${next}`,
      detail: `${lead.name} is now in ${next}.`,
    });
  };

  const runDraft = async (type: 'email' | 'whatsapp' | 'call') => {
    setBusy(type);
    setError(null);
    try {
      const result = await generateCrmDraft({ type, lead });
      setDraftPreview(result.draft);
      addActivity({
        leadId: lead.id,
        type: type === 'call' ? 'call' : type === 'whatsapp' ? 'whatsapp' : 'email',
        title: `AI drafted ${type}`,
        detail: result.draft.slice(0, 180),
        aiGenerated: true,
      });
      setTab('overview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI draft failed');
    } finally {
      setBusy(null);
    }
  };

  const refreshAi = async () => {
    setBusy('analyze');
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
        status: (['new', 'contacted', 'qualified', 'nurturing', 'proposal', 'won', 'lost'].includes(result.suggestedStatus)
          ? result.suggestedStatus
          : lead.status) as Lead['status'],
      });
      addActivity({
        leadId: lead.id,
        type: 'ai-action',
        title: 'AI refreshed intelligence',
        detail: `Score ${result.score}/100 · ${result.nextAction}`,
        aiGenerated: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI analysis failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-in Panel */}
      <div className="relative w-full max-w-lg h-full bg-white dark:bg-[#0b0b14] shadow-2xl overflow-y-auto z-10 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#0b0b14]/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 shadow-xs"
              style={{ backgroundColor: lead.avatarColor || '#8b5cf6' }}
            >
              {lead.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 truncate">{lead.name}</h3>
              <p className="text-[11.5px] text-slate-400 truncate">
                {lead.title} · <span className="text-slate-600 dark:text-slate-300 font-medium">{lead.company}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Status Quick Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Lead Stage</span>
            <select
              value={currentStatus}
              onChange={(e) => persistStatus(e.target.value as Lead['status'])}
              className="text-[12px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-purple-600 dark:text-purple-300 focus:outline-none"
            >
              {KANBAN_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* AI Summary Banner */}
          <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/40 bg-gradient-to-br from-purple-50/80 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/10 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
                <span className="text-[10.5px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  AI Intelligence
                </span>
              </div>
              <button
                type="button"
                onClick={() => void refreshAi()}
                disabled={busy === 'analyze'}
                className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-200/60 dark:bg-purple-800/40 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full disabled:opacity-60"
              >
                {busy === 'analyze' ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                Refresh with Ollama
              </button>
            </div>
            <p className="text-[12.5px] text-slate-700 dark:text-slate-300 leading-relaxed">{lead.aiSummary}</p>
            <div className="mt-3 pt-2.5 border-t border-purple-200/60 dark:border-purple-900/30 flex items-center justify-between text-[11px] font-bold text-purple-800 dark:text-purple-300">
              <span>Next Suggested Action:</span>
              <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400">
                {lead.nextAction} <ChevronRight size={12} />
              </span>
            </div>
          </div>

          {error && (
            <p className="text-[11px] font-semibold text-red-500">{error}</p>
          )}

          {draftPreview && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">AI Draft Preview</p>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(draftPreview);
                    setCopiedId('draft');
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="text-[10px] font-bold text-purple-600"
                >
                  {copiedId === 'draft' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">{draftPreview}</p>
            </div>
          )}

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 gap-2.5 text-[12.5px] p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <Mail size={14} className="text-slate-400 shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span>{lead.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <Globe size={14} className="text-slate-400 shrink-0" />
              <a
                href={`https://${lead.website}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-purple-600 dark:text-purple-400 flex items-center gap-1"
              >
                {lead.website} <ArrowUpRight size={11} />
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <Building2 size={14} className="text-slate-400 shrink-0" />
              <span>{lead.industry}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span>{lead.location}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {lead.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10.5px] font-bold text-slate-600 dark:text-slate-400"
              >
                #{t}
              </span>
            ))}
          </div>

          {/* Performance Metrics Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { name: 'Buying Intent', value: lead.buyingIntent },
              { name: 'Engagement', value: lead.engagementScore },
              { name: 'Conversion Prob.', value: lead.conversionProbability },
              { name: 'Customer Fit', value: lead.fitScore },
            ].map((s) => (
              <div
                key={s.name}
                className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 p-3"
              >
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{s.name}</p>
                <p className="mt-1 text-lg font-black text-purple-600 dark:text-purple-400">{s.value}%</p>
              </div>
            ))}
          </div>

          {/* Tabs Nav */}
          <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pt-2">
            {(['overview', 'timeline', 'ai'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-2.5 px-2 text-[12px] font-bold capitalize border-b-2 transition-all ${
                  tab === t
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {t === 'ai' ? 'AI Actions' : t}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview Quick Actions */}
          {tab === 'overview' && (
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={!!busy}
                onClick={() => void runDraft('email')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-60"
              >
                {busy === 'email' ? <Loader2 size={14} className="animate-spin text-purple-500" /> : <Mail size={14} className="text-purple-500" />}
                Draft Email
              </button>
              <button
                type="button"
                disabled={!!busy}
                onClick={() => void runDraft('whatsapp')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-60"
              >
                {busy === 'whatsapp' ? <Loader2 size={14} className="animate-spin text-emerald-500" /> : <MessageCircle size={14} className="text-emerald-500" />}
                Send WhatsApp Message
              </button>
              <button
                type="button"
                disabled={!!busy}
                onClick={() => void runDraft('call')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-60"
              >
                {busy === 'call' ? <Loader2 size={14} className="animate-spin text-sky-500" /> : <Phone size={14} className="text-sky-500" />}
                Log Call Script
              </button>
            </div>
          )}

          {/* Tab 2: Activity Timeline */}
          {tab === 'timeline' && (
            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {activities.length === 0 && (
                <p className="text-[12.5px] text-slate-400 pl-4">No activity recorded for this lead yet.</p>
              )}
              {activities.map((a) => (
                <div key={a.id} className="relative pl-6">
                  <span
                    className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#0b0b14] shrink-0 ${
                      a.aiGenerated ? 'bg-purple-600' : 'bg-slate-400'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12.5px] font-bold text-slate-800 dark:text-slate-100">{a.title}</p>
                      {a.aiGenerated && (
                        <span className="text-[9.5px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1 rounded">
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{a.detail}</p>
                    <p className="text-[10.5px] text-slate-400 mt-1">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: AI Scripts & Actions */}
          {tab === 'ai' && (
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Suggested Call Scripts</p>
              {CALL_SCRIPTS.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/30"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{s.title}</p>
                    <button
                      onClick={() => handleCopyScript(s.id, s.preview)}
                      className="text-slate-400 hover:text-purple-600 transition-colors p-1"
                      title="Copy Script"
                    >
                      {copiedId === s.id ? (
                        <Check size={14} className="text-emerald-500 animate-in zoom-in-50" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {s.preview}
                  </p>
                </div>
              ))}
              <button
                type="button"
                disabled={!!busy}
                onClick={() => void runDraft('email')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white py-2.5 text-[11px] font-black uppercase tracking-wider transition-all shadow-md shadow-purple-500/20 disabled:opacity-60"
              >
                {busy === 'email' ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} />}
                Draft Custom AI Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (lead: Lead) => void;
}

function CreateLeadModal({ isOpen, onClose, onCreated }: CreateLeadModalProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Enterprise Tech');
  const [location, setLocation] = useState('San Francisco, CA');
  const [source, setSource] = useState('Inbound Website');
  const [status, setStatus] = useState<Lead['status']>('new');
  const [priority, setPriority] = useState<Lead['priority']>('medium');
  const [score, setScore] = useState(75);
  const [assignedTo, setAssignedTo] = useState('AI SDR Agent');
  const [tags, setTags] = useState('New Lead, High Intent');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) {
      setError('Full Name and Company Name are required.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const tagList = tags
        .split(/[,#]/)
        .map((t) => t.trim())
        .filter(Boolean);

      const created = addLead({
        name,
        company,
        title: title.trim() || 'Key Decision Maker',
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        industry,
        location,
        source,
        status,
        priority,
        score: Number(score) || 75,
        assignedTo,
        tags: tagList.length ? tagList : ['New Inbound'],
        aiSummary: notes.trim()
          ? `${notes.trim()} — Inbound lead profile logged for ${name} at ${company}.`
          : `New inbound prospect ${name} from ${company}. Automated intelligence profile initialized.`,
        nextAction: 'Send personalized introduction email',
      });

      addActivity({
        leadId: created.id,
        type: 'note',
        title: 'New lead added to pipeline',
        detail: `${created.name} (${created.title}) at ${created.company} added via ${created.source}.`,
      });

      onCreated(created);
      onClose();

      // Reset form
      setName('');
      setCompany('');
      setTitle('');
      setEmail('');
      setPhone('');
      setWebsite('');
      setNotes('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0c0c14] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shadow-purple-500/25"
              style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
            >
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Create New Lead</h3>
              <p className="text-[12px] text-slate-400">Add an opportunity to your AI SDR sales pipeline</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs font-bold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Primary Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Contact Full Name <span className="text-purple-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikramaditya Singhania"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Company Name <span className="text-purple-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nexus Dynamics"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Chief Technology Officer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="e.g. vikram@nexusdynamics.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +1 (555) 349-2918"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-medium"
              >
                <option value="Enterprise Tech">Enterprise Tech</option>
                <option value="AI & Robotics">AI & Robotics</option>
                <option value="Fintech & Banking">Fintech & Banking</option>
                <option value="Healthcare & Biotech">Healthcare & Biotech</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                <option value="Clean Energy">Clean Energy</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-medium"
              >
                <option value="Inbound Website">Inbound Website</option>
                <option value="LinkedIn Outreach">LinkedIn Outreach</option>
                <option value="Referral">Referral</option>
                <option value="Cold Email Outreach">Cold Email Outreach</option>
                <option value="Webinar Attendee">Webinar Attendee</option>
                <option value="Demo Request">Demo Request</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
              <input
                type="text"
                placeholder="e.g. Austin, TX"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Pipeline Stage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Lead['status'])}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-medium"
              >
                <option value="new">NEW</option>
                <option value="contacted">CONTACTED</option>
                <option value="qualified">QUALIFIED</option>
                <option value="nurturing">NURTURING</option>
                <option value="proposal">PROPOSAL</option>
                <option value="won">WON</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Lead['priority'])}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-medium"
              >
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Lead Score: {score}</label>
              <input
                type="range"
                min={10}
                max={100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg accent-purple-600 cursor-pointer mt-3"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Assigned Owner</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-medium"
              >
                <option value="AI SDR Agent">AI SDR Agent</option>
                <option value="Rhea Kapoor">Rhea Kapoor</option>
                <option value="Kabir Sen">Kabir Sen</option>
                <option value="Aarav Patel">Aarav Patel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tags <span className="font-normal text-slate-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Enterprise, Decision Maker, High Intent, Q4 Target"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Initial Context / Notes for AI SDR
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Met at Cloud Summit; interested in enterprise pipeline automation and reducing rep onboarding time."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-medium resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-wider text-white text-xs shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-60"
              style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              <span>{submitting ? 'Creating...' : 'Create Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}