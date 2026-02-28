import { useState, useEffect } from 'react';
import { getStoredTheme, setStoredTheme, applyThemeClass } from '../../utils/theme';
import type { ThemeMode } from '../../utils/theme';

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    applyThemeClass(mode);
  }, [mode]);

  const toggle = () => {
    const next: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setStoredTheme(next);
    setMode(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {mode === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
