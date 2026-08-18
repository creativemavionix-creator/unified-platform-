import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Users, Bot, Workflow, BarChart3, Bell, ChevronDown,
  Sun, Moon, Target, Plus,
} from 'lucide-react';
import { NOTIFICATIONS, DASHBOARD_STATS } from '../../../data/leadCrmMockData';
import DashboardTab from './tabs/DashboardTab';
import LeadsTab from './tabs/LeadsTab';
import AssistantTab from './tabs/AssistantTab';
import WorkflowsTab from './tabs/WorkflowsTab';
import AnalyticsTab from './tabs/AnalyticsTab';

type ThemeMode = 'light' | 'dark';

interface Props {
  onViewChange: (view: string, slug?: string) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
}

type TabId = 'dashboard' | 'leads' | 'assistant' | 'workflows' | 'analytics';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'assistant', label: 'AI Assistant', icon: Bot },
  { id: 'workflows', label: 'Automation', icon: Workflow },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function LeadCrmWorkspace({ onViewChange, theme, onThemeToggle }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navMenuRef = useRef<HTMLDivElement>(null);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  const goto = (tab: TabId) => {
    setActiveTab(tab);
    setNavMenuOpen(false);
  };

  useEffect(() => {
    if (!navMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navMenuRef.current && !navMenuRef.current.contains(e.target as Node)) {
        setNavMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navMenuOpen]);

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab onNavigate={goto} />;
      case 'leads':
        return <LeadsTab />;
      case 'assistant':
        return <AssistantTab />;
      case 'workflows':
        return <WorkflowsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#07070f] text-slate-900 dark:text-white flex">
      <aside className="hidden lg:sticky lg:top-0 lg:z-0 lg:flex h-screen w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0b14] flex-col">
        <div className="px-5 pt-5 pb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
            >
              <Target size={17} />
            </div>
            <div>
              <p className="text-sm font-black leading-tight">Lead CRM</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">MaVionix Business Suite</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => goto(tab.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/12 dark:text-purple-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/70 dark:hover:text-white'
                }`}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="mx-4 mb-4 rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/60 dark:bg-purple-500/5 p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">AI SDR Status</p>
          <p className="mt-1 text-lg font-black">{DASHBOARD_STATS.todaysAiActivities} <span className="text-xs font-semibold text-slate-400">actions today</span></p>
          <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">Working autonomously across {DASHBOARD_STATS.totalLeads.toLocaleString()} leads</p>
        </div>
      </aside>

      <div className="flex-1 min-w-0 lg:ml-auto">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#07070f]/80 backdrop-blur px-3 sm:px-6 py-3.5">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 relative" ref={navMenuRef}>
            <button
              onClick={() => setNavMenuOpen((v) => !v)}
              className="lg:hidden shrink-0 flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-[#0c0c14] px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
              aria-label="Open section menu"
              aria-expanded={navMenuOpen}
            >
              <LayoutDashboard size={16} />
              <ChevronDown size={14} className={`transition-transform duration-200 ${navMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            <h1 className="text-sm sm:text-base font-black uppercase tracking-wide truncate">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h1>

            <AnimatePresence>
              {navMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="lg:hidden absolute left-0 top-12 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] shadow-xl p-2 z-40"
                >
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => goto(tab.id)}
                        className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
                          active
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/12 dark:text-purple-300'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/70 dark:hover:text-white'
                        }`}
                      >
                        <Icon size={17} />
                        {tab.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 relative">
            <button
              onClick={onThemeToggle}
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label="Toggle dark mode"
              className="relative inline-flex h-9 w-[68px] shrink-0 items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-1 transition-colors duration-300"
            >
              <Sun size={13} className="absolute left-2 text-amber-500 dark:text-slate-600 transition-colors duration-300" />
              <Moon size={13} className="absolute right-2 text-slate-400 dark:text-purple-300 transition-colors duration-300" />
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className="z-10 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)',
                  marginLeft: theme === 'dark' ? 'auto' : 0,
                }}
              >
                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              </motion.span>
            </button>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-11 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] shadow-xl p-2 z-40">
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="rounded-xl px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/70">
                    <p className="text-[12.5px] font-medium text-slate-700 dark:text-slate-200">{n.text}</p>
                    <p className="mt-0.5 text-[10.5px] text-slate-400">{n.time}</p>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => goto('leads')}
              className="btn-primary hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-[11px] font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5"
            >
              <Plus size={14} />
              New Lead
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
