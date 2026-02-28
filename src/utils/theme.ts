const THEME_KEY = 'onda-theme';

export type ThemeMode = 'light' | 'dark';

export function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'light';
}

export function setStoredTheme(mode: ThemeMode): void {
  localStorage.setItem(THEME_KEY, mode);
}

export function applyThemeClass(mode: ThemeMode): void {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(mode);
}
