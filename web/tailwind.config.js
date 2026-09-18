/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0B0F17',
          card: '#131A29',
          border: '#1E293B',
          accent: '#3B82F6',
          text: '#F8FAFC',
          muted: '#94A3B8',
          green: '#10B981',
          red: '#EF4444',
          amber: '#F59E0B',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
