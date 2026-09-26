/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#F5F4EE',
        card: '#FAF9F5',
        ink: '#0F0F0F',
        'ink-soft': '#404040',
        cyan: { DEFAULT: '#1D4ED8', glow: '#3B82F6' },
        blue: { DEFAULT: '#1D4ED8', glow: '#3B82F6' },
        yellow: { DEFAULT: '#FACC15', soft: '#FEF08A' },
        red: { DEFAULT: '#DC2626', soft: '#FCA5A5' },
        threat: { DEFAULT: '#DC2626', 2: '#FACC15' },
        safe: '#1D4ED8',
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"JetBrains Mono"', 'monospace', 'sans-serif'],
        body: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        brutal: '3px 3px 0px #0F0F0F',
        'brutal-lg': '5px 5px 0px #0F0F0F',
        'brutal-sm': '2px 2px 0px #0F0F0F',
      },
    },
  },
  plugins: [],
};

