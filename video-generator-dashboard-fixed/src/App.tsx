import { useEffect, useState } from 'react';
import VideoGeneratorWorkspace from './components/product/modules/VideoGeneratorWorkspace';

type ThemeMode = 'light' | 'dark';

export default function App() {
  // Stub for the "Creative Suite" back button - wire this to your router/host app.
  const handleViewChange = (view: string, slug?: string) => {
    console.log('navigate ->', view, slug);
  };

  // Theme state - mirrors the same 'mavionix-theme' key/logic used on the main
  // eMavionics site so this dashboard stays in sync with the rest of the app
  // when it's mounted inside it (shared localStorage key + prefers-color-scheme fallback).
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem('mavionix-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    window.localStorage.setItem('mavionix-theme', theme);
  }, [theme]);

  const handleThemeToggle = () => setTheme((value) => (value === 'dark' ? 'light' : 'dark'));

  return (
    <VideoGeneratorWorkspace
      onViewChange={handleViewChange}
      theme={theme}
      onThemeToggle={handleThemeToggle}
    />
  );
}
