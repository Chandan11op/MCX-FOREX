/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070A11',
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
        },
        market: {
          green: '#10B981',
          red: '#EF4444',
          gold: '#F59E0B',
          silver: '#94A3B8',
          copper: '#EA580C',
          crude: '#6366F1',
          ng: '#06B6D4',
        },
      },
      keyframes: {
        flashGreen: {
          '0%': { backgroundColor: 'rgba(16, 185, 129, 0.4)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0.4)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        'flash-green': 'flashGreen 0.7s ease-out',
        'flash-red': 'flashRed 0.7s ease-out',
      },
    },
  },
  plugins: [],
};
