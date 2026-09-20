/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        ink: '#0e1b2a',
        'ink-soft': '#4a5b6e',
        cyan: { DEFAULT: '#1fb6d6', glow: '#5fe0f4' },
        violet: { DEFAULT: '#7c6cf6', glow: '#a89bff' },
        indigo: { DEFAULT: '#4c5fd5' },
        threat: { DEFAULT: '#ff6b4a', 2: '#ffb020' },
        safe: '#2bb673',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
