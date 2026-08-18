import { useEffect, useState } from 'react';
import PresentationWorkspace from './components/workspace/PresentationWorkspace';

type ThemeMode = 'light' | 'dark';

export default function App() {
  // Theme state — mirrors the same 'mavionix-theme' key/logic used on the main
  // MaVionix site so this module stays in sync when mounted inside it
  // (shared localStorage key + prefers-color-scheme fallback).
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

  return <PresentationWorkspace theme={theme} onThemeToggle={handleThemeToggle} />;
}
