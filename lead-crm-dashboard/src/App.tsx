import { useEffect, useState } from 'react';
import LeadCrmWorkspace from './components/product/modules/LeadCrmWorkspace';

type ThemeMode = 'light' | 'dark';

export default function App() {
  const handleViewChange = (view: string, slug?: string) => {
    console.log('navigate ->', view, slug);
  };

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
    <LeadCrmWorkspace
      onViewChange={handleViewChange}
      theme={theme}
      onThemeToggle={handleThemeToggle}
    />
  );
}
