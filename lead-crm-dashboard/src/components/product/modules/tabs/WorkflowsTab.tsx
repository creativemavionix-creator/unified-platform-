import React, { useEffect, useMemo, useState } from 'react';
import { 
  Workflow, 
  Plus, 
  ArrowRight, 
  Pause, 
  Play, 
  Search, 
  Zap, 
  Trash2, 
  Copy, 
  Sparkles, 
  X, 
  Activity, 
  Check, 
  Layers, 
  Clock,
  PlayCircle,
  BarChart3,
  Loader2,
} from 'lucide-react';
import type { WorkflowItem } from '../../../../data/leadCrmMockData';
import { useCrmStore } from '@/hooks/use-crm-store';
import { setWorkflows as persistWorkflows } from '@/lib/crm/store';
import { describeCrmWorkflow } from '@/lib/crm/api';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5 transition-all duration-200';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 flex items-center gap-2';

export default function WorkflowsTab() {
  const { state } = useCrmStore();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(state.workflows);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiDescribing, setAiDescribing] = useState(false);

  useEffect(() => {
    setWorkflows(state.workflows);
  }, [state.workflows]);

  const commit = (next: WorkflowItem[]) => {
    setWorkflows(next);
    persistWorkflows(next);
  };

  // New Workflow Form State
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    category: 'Lead Nurturing',
    trigger: 'New Lead Created',
    action: 'Send AI Email Sequences',
    description: '',
  });

  // Toast Notification Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Active/Paused Status
  const toggleStatus = (id: string) => {
    commit(
      workflows.map((w) => {
        if (w.id === id) {
          const nextStatus = w.status === 'active' ? 'paused' : 'active';
          showToast(`Workflow "${w.name}" set to ${nextStatus}.`);
          return { ...w, status: nextStatus };
        }
        return w;
      }),
    );
  };

  // Manual Test Trigger Simulation
  const handleRunTest = (id: string, name: string) => {
    commit(workflows.map((w) => (w.id === id ? { ...w, leadsProcessed: w.leadsProcessed + 1 } : w)));
    showToast(`⚡ Test executed for "${name}". Processed 1 test lead.`);
  };

  // Duplicate Workflow
  const handleDuplicate = (workflow: WorkflowItem) => {
    const duplicated: WorkflowItem = {
      ...workflow,
      id: `wf-${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      leadsProcessed: 0,
      status: 'paused',
    };
    commit([duplicated, ...workflows]);
    showToast(`Duplicated "${workflow.name}".`);
  };

  // Delete Workflow
  const handleDelete = (id: string, name: string) => {
    commit(workflows.filter((w) => w.id !== id));
    showToast(`Deleted workflow "${name}".`);
  };

  // Create New Workflow
  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflow.name.trim()) return;

    const created: WorkflowItem = {
      id: `wf-${Date.now()}`,
      name: newWorkflow.name,
      category: newWorkflow.category,
      status: 'active',
      description: newWorkflow.description || 'Custom automated lead workflow.',
      trigger: newWorkflow.trigger,
      action: newWorkflow.action,
      leadsProcessed: 0,
    };
    commit([created, ...workflows]);
    setIsModalOpen(false);
    setNewWorkflow({
      name: '',
      category: 'Lead Nurturing',
      trigger: 'New Lead Created',
      action: 'Send AI Email Sequences',
      description: '',
    });
    showToast(`Created workflow "${created.name}".`);
  };

  const fillDescriptionWithAi = async () => {
    setAiDescribing(true);
    try {
      const result = await describeCrmWorkflow(newWorkflow);
      setNewWorkflow((prev) => ({ ...prev, description: result.description }));
      showToast('AI wrote the workflow description.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'AI description failed');
    } finally {
      setAiDescribing(false);
    }
  };

  // Filtered Workflows Computation
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      const matchesSearch =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.action.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || w.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [workflows, searchQuery, statusFilter]);

  // Real-time Aggregate Metrics
  const activeCount = useMemo(() => workflows.filter((w) => w.status === 'active').length, [workflows]);
  const totalLeadsProcessed = useMemo(() => workflows.reduce((acc, curr) => acc + curr.leadsProcessed, 0), [workflows]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* Toast Notification Floating Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl text-xs font-bold animate-in slide-in-from-bottom-5">
          <Sparkles size={16} className="text-purple-400 dark:text-purple-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Stats Analytics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${card} flex items-center justify-between`}>
          <div>
            <span className={label}>Active Automations</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{activeCount}</span>
              <span className="text-xs font-semibold text-slate-400">/ {workflows.length} running</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <Activity size={20} />
          </div>
        </div>

        <div className={`${card} flex items-center justify-between`}>
          <div>
            <span className={label}>Total Executions</span>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {totalLeadsProcessed.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <BarChart3 size={20} />
          </div>
        </div>

        <div className={`${card} flex items-center justify-between`}>
          <div>
            <span className={label}>Automation Rate</span>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {workflows.length > 0 ? `${Math.round((activeCount / workflows.length) * 100)}%` : '0%'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Layers size={20} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search workflows, triggers, actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-[#0c0c14] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#0c0c14] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {(['all', 'active', 'paused'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Create Workflow Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-md shadow-purple-500/20 active:scale-95 shrink-0"
        >
          <Plus size={15} />
          Create Workflow
        </button>
      </div>

      {/* Workflows Cards Grid */}
      {filteredWorkflows.length === 0 ? (
        <div className={`${card} text-center py-12`}>
          <Workflow size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No workflows found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkflows.map((w) => {
            const isActive = w.status === 'active';
            return (
              <div
                key={w.id}
                className={`${card} flex flex-col justify-between group hover:border-purple-500/30 dark:hover:border-purple-500/30 relative overflow-hidden`}
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/50 dark:border-purple-800/40">
                        <Workflow size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{w.name}</p>
                          {isActive && (
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                          )}
                        </div>
                        <span className="inline-block mt-0.5 text-[10.5px] font-semibold text-slate-400">
                          {w.category}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => toggleStatus(w.id)}
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isActive ? <Pause size={12} /> : <Play size={12} />}
                      <span className="capitalize">{w.status}</span>
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {w.description}
                  </p>

                  {/* Visual Node Pipeline Step Display */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-[11.5px]">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40 font-semibold truncate">
                        <Zap size={12} className="shrink-0" />
                        {w.trigger}
                      </span>
                      <ArrowRight size={13} className="text-slate-400 shrink-0" />
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/40 font-semibold truncate">
                        <Sparkles size={12} className="shrink-0" />
                        {w.action}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls & Stats */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {w.leadsProcessed.toLocaleString()} leads processed
                  </span>

                  {/* Card Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleRunTest(w.id, w.name)}
                      title="Run Test Execution"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                    >
                      <PlayCircle size={15} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(w)}
                      title="Duplicate Workflow"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(w.id, w.name)}
                      title="Delete Workflow"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Overlay: Create Workflow */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0c0c14] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                  <Workflow size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Automation Workflow</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Workflow Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Lead Fast-Track Sequence"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                  <select
                    value={newWorkflow.category}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="Lead Nurturing">Lead Nurturing</option>
                    <option value="Lead Routing">Lead Routing</option>
                    <option value="Re-engagement">Re-engagement</option>
                    <option value="AI Outreach">AI Outreach</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Trigger Event</label>
                  <select
                    value={newWorkflow.trigger}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, trigger: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="New Lead Created">New Lead Created</option>
                    <option value="Status Changed to Qualified">Status Changed to Qualified</option>
                    <option value="Lead Inactive 14 Days">Lead Inactive 14 Days</option>
                    <option value="Form Submitted">Form Submitted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Automated Action</label>
                <select
                  value={newWorkflow.action}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, action: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="Send AI Email Sequences">Send AI Email Sequences</option>
                  <option value="Assign Sales Rep & Notify Slack">Assign Sales Rep & Notify Slack</option>
                  <option value="Schedule Auto Follow-up Call">Schedule Auto Follow-up Call</option>
                  <option value="Tag as High-Priority VIP">Tag as High-Priority VIP</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <button
                    type="button"
                    onClick={() => void fillDescriptionWithAi()}
                    disabled={aiDescribing}
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-300 disabled:opacity-60"
                  >
                    {aiDescribing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                    Write with AI
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Explain what this automation handles..."
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-md shadow-purple-500/20"
                >
                  Activate Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}