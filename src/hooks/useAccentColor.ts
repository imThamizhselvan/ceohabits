import { useState, useEffect } from 'react';

export const ACCENT_COLORS = [
  { label: 'Indigo',  hsl: '239 84% 67%',  hex: '#6366f1' },
  { label: 'Purple',  hsl: '262 83% 58%',  hex: '#8b5cf6' },
  { label: 'Pink',    hsl: '330 81% 60%',  hex: '#ec4899' },
  { label: 'Rose',    hsl: '347 77% 50%',  hex: '#e11d48' },
  { label: 'Orange',  hsl: '25 95% 53%',   hex: '#f97316' },
  { label: 'Green',   hsl: '142 76% 36%',  hex: '#16a34a' },
  { label: 'Teal',    hsl: '172 66% 50%',  hex: '#14b8a6' },
  { label: 'Blue',    hsl: '217 91% 60%',  hex: '#3b82f6' },
] as const;

const STORAGE_KEY = 'habit-accent';
const DEFAULT = ACCENT_COLORS[0].hsl;

function applyAccent(hsl: string) {
  document.documentElement.style.setProperty('--primary', hsl);
}

export function useAccentColor() {
  const [accent, setAccentState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT;
  });

  useEffect(() => {
    applyAccent(accent);
  }, [accent]);

  // Apply on first mount (covers page refresh)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) applyAccent(stored);
  }, []);

  function setAccent(hsl: string) {
    localStorage.setItem(STORAGE_KEY, hsl);
    setAccentState(hsl);
  }

  return { accent, setAccent, ACCENT_COLORS };
}
