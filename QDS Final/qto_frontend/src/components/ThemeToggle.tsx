import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('qds_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('qds_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, setTheme, toggleTheme };
}

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  style?: React.CSSProperties;
}

export default function ThemeToggle({ theme, onToggle, style }: ThemeToggleProps) {
  const isDark = theme === 'dark';
  return (
    <button
      id="theme-toggle-btn"
      onClick={onToggle}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#0f172a',
        border: isDark ? '1px solid rgba(148, 163, 184, 0.25)' : '1px solid #cbd5e1',
        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(15,23,42,0.08)',
        userSelect: 'none',
        ...style,
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1 }}>{isDark ? '🌙' : '☀️'}</span>
      <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  );
}
