import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Wand2, Images, SlidersHorizontal, Palette, Download,
  BarChart3, ArrowLeft, Sparkles, ChevronDown,
} from 'lucide-react';
import DashboardTab from './tabs/DashboardTab';
import CreateTab from './tabs/CreateTab';
import GalleryTab from './tabs/GalleryTab';
import EditorTab from './tabs/EditorTab';
import BrandKitTab from './tabs/BrandKitTab';
import ExportTab from './tabs/ExportTab';
import HistoryTab from './tabs/HistoryTab';
import { useCreativeTokens } from '@/hooks/use-creative-tokens';

interface Props {
  onBack?: () => void;
  onViewChange: (view: string, slug?: string) => void;
}

type TabId = 'dashboard' | 'create' | 'gallery' | 'editor' | 'brandkit' | 'export' | 'history';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'create', label: 'Create', icon: Wand2 },
  { id: 'gallery', label: 'Gallery', icon: Images },
  { id: 'editor', label: 'Editor', icon: SlidersHorizontal },
  { id: 'brandkit', label: 'Brand Kit', icon: Palette },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'history', label: 'History & Analytics', icon: BarChart3 },
];

export default function ImageGeneratorWorkspace({ onBack, onViewChange }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [pendingCreatePrompt, setPendingCreatePrompt] = useState('');
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const navMenuRef = useRef<HTMLDivElement>(null);
  const { balance } = useCreativeTokens();

  const creditPercent = balance.limit > 0 ? Math.min(100, (balance.remaining / balance.limit) * 100) : 0;
  const renewLabel = balance.resetsInMs > 86_400_000
    ? `Resets in ${Math.ceil(balance.resetsInMs / 86_400_000)} day${Math.ceil(balance.resetsInMs / 86_400_000) === 1 ? '' : 's'}`
    : `Resets in ${Math.max(1, Math.ceil(balance.resetsInMs / 3_600_000))}h`;

  const goto = (tab: TabId, prompt?: string) => {
    if (prompt) setPendingCreatePrompt(prompt);
    setActiveTab(tab);
    setNavMenuOpen(false);
  };

  // Close the mobile nav dropdown when tapping/clicking outside of it.
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
      case 'create':
        return (
          <CreateTab
            initialPrompt={pendingCreatePrompt}
            onInitialPromptConsumed={() => setPendingCreatePrompt('')}
          />
        );
      case 'gallery':
        return <GalleryTab />;
      case 'editor':
        return <EditorTab />;
      case 'brandkit':
        return <BrandKitTab />;
      case 'export':
        return <ExportTab />;
      case 'history':
        return <HistoryTab />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#07070f] text-slate-900 dark:text-white flex">
      {/* Sidebar - desktop/tablet only. Mobile uses the dropdown nav in the header instead. */}
      <aside className="hidden lg:sticky lg:top-0 lg:z-0 lg:flex h-screen w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0b14] flex-col">
        {onBack && (
          <div className="px-5 pt-4 pb-0">
            <button
              onClick={onBack}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 dark:text-slate-400 hover:text-white dark:hover:text-white bg-slate-100 dark:bg-slate-900/60 hover:bg-[#C800FF] dark:hover:bg-[#C800FF] hover:border-transparent dark:hover:border-transparent transition-all border border-slate-200 dark:border-slate-800"
            >
              <ArrowLeft size={12} className="text-[#C800FF] group-hover:text-white transition-colors" />
              <span>Back to Creative Suite</span>
            </button>
          </div>
        )}

        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
            >
              <Sparkles size={17} />
            </div>
            <div>
              <p className="text-sm font-black leading-tight">AI Image Generator</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">MaVionix Creative Suite</p>
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
          <p className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">Generation Credits</p>
          <p className="mt-1 text-lg font-black">{balance.remaining.toLocaleString()} <span className="text-xs font-semibold text-slate-400">/ {balance.limit.toLocaleString()}</span></p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-purple-100 dark:bg-purple-500/15">
            <div className="h-1.5 rounded-full bg-purple-600 transition-all" style={{ width: `${creditPercent}%` }} />
          </div>
          <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">{renewLabel}</p>
        </div>
      </aside>

      {/* Main content */}
     <div className="flex-1 min-w-0 lg:ml-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#07070f]/80 backdrop-blur px-3 sm:px-6 py-3.5">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 relative" ref={navMenuRef}>
            {/* Mobile app-launcher dropdown: tap the arrow to reveal all sections */}
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

            {/* Flyout menu - replaces the old slide-in sidebar on mobile */}
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
              onClick={() => goto('create')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-[11px] font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5"
              style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)', boxShadow: '0 8px 20px -4px rgba(200,0,255,0.45)' }}
            >
              <Wand2 size={14} />
              New Generation
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
