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
        padding: '6px 12px',
        borderRadius: 2,
        fontSize: 11,
        fontWeight: 800,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        background: '#FAF9F5',
        color: '#0F0F0F',
        border: '1.5px solid #0F0F0F',
        boxShadow: '2px 2px 0px #0F0F0F',
        userSelect: 'none',
        ...style,
      }}
    >
      <span>{isDark ? 'DARK MODE' : 'LIGHT MODE'}</span>
    </button>
  );
}
