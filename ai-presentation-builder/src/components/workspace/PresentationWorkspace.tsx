import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Wand2, PenSquare, LayoutTemplate, FolderKanban,
  Palette, Users, Download, BarChart3, ChevronDown, Sparkles, Sun, Moon,
} from 'lucide-react';
import DashboardTab from './tabs/DashboardTab';
import CreateTab from './tabs/CreateTab';
import EditorTab from './tabs/EditorTab';
import TemplatesTab from './tabs/TemplatesTab';
import AssetsTab from './tabs/AssetsTab';
import BrandKitTab from './tabs/BrandKitTab';
import CollaborateTab from './tabs/CollaborateTab';
import ExportTab from './tabs/ExportTab';
import HistoryTab from './tabs/HistoryTab';
import { DAILY_TOKEN_LIMIT, formatTimeRemaining, getTokenBalance } from '../../lib/tokens';
import type { Slide } from '../../data/presentationMockData';

type TabId = 'dashboard' | 'create' | 'editor' | 'templates' | 'assets' | 'brandkit' | 'collaborate' | 'export' | 'history';

interface Props {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'create', label: 'AI Generator', icon: Wand2 },
  { id: 'editor', label: 'Editor', icon: PenSquare },
  { id: 'templates', label: 'Templates & Themes', icon: LayoutTemplate },
  { id: 'assets', label: 'Media & Assets', icon: FolderKanban },
  { id: 'brandkit', label: 'Brand Kit', icon: Palette },
  { id: 'collaborate', label: 'Collaboration', icon: Users },
  { id: 'export', label: 'Export & Present', icon: Download },
  { id: 'history', label: 'History & Analytics', icon: BarChart3 },
];

export default function PresentationWorkspace({ theme, onThemeToggle }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [deckSlides, setDeckSlides] = useState<Slide[] | null>(null);
  const [tokenBalance, setTokenBalance] = useState(() => getTokenBalance());
  const navMenuRef = useRef<HTMLDivElement>(null);

  const refreshTokens = useCallback(() => setTokenBalance(getTokenBalance()), []);

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

  useEffect(() => {
    refreshTokens();
    const onChange = () => refreshTokens();
    window.addEventListener('mvx-tokens-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('mvx-tokens-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [refreshTokens]);

  const handleDeckReady = (slides: Slide[]) => {
    setDeckSlides(slides);
    refreshTokens();
    goto('editor');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab onNavigate={goto} />;
      case 'create':
        return <CreateTab onDeckReady={handleDeckReady} />;
      case 'editor':
        return <EditorTab initialSlides={deckSlides ?? undefined} />;
      case 'templates':
        return <TemplatesTab />;
      case 'assets':
        return <AssetsTab />;
      case 'brandkit':
        return <BrandKitTab />;
      case 'collaborate':
        return <CollaborateTab />;
      case 'export':
        return <ExportTab slides={deckSlides} />;
      case 'history':
        return <HistoryTab />;
      default:
        return null;
    }
  };

  const creditPercent = Math.min(100, (tokenBalance.remaining / DAILY_TOKEN_LIMIT) * 100);

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#07070f] text-slate-900 dark:text-white flex">
      {/* Sidebar — desktop/tablet only. Mobile uses the dropdown nav in the header instead. */}
      <aside className="hidden lg:sticky lg:top-0 lg:z-0 lg:flex h-screen w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0b14] flex-col">
        <div className="px-5 pt-5 pb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}
            >
              <Sparkles size={17} />
            </div>
            <div>
              <p className="text-sm font-black leading-tight">AI Presentation Builder</p>
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
          <p className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">AI Credits</p>
          <p className="mt-1 text-lg font-black">
            {tokenBalance.remaining.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-slate-400">/ {DAILY_TOKEN_LIMIT.toLocaleString()}</span>
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-purple-100 dark:bg-purple-500/15">
            <div className="h-1.5 rounded-full bg-purple-600" style={{ width: `${creditPercent}%` }} />
          </div>
          <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">Renews in {formatTimeRemaining(tokenBalance.resetsInMs)}</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
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

            {navMenuOpen && (
              <div className="lg:hidden absolute left-0 top-12 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] shadow-xl p-2 z-40">
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
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 relative">
            <button
              onClick={onThemeToggle}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={() => goto('create')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-[11px] font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5"
              style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)', boxShadow: '0 8px 20px -4px rgba(200,0,255,0.45)' }}
            >
              <Wand2 size={14} />
              New Presentation
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
