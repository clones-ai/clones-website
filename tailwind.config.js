/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      colors: {
        'clones': {
          'bg-primary': '#000000',
          'bg-secondary': '#0A0A0A',
          'bg-tertiary': '#111111',
          'panel-main': '#1A1A1A',
          'panel-secondary': '#262626',
          'panel-elevated': '#2A2A2A',
          'accent-primary': '#8B5CF6',
          'accent-secondary': '#3B82F6',
          'accent-tertiary': '#EC4899',
          'text-primary': '#F8FAFC',
          'text-secondary': '#E2E8F0',
          'text-tertiary': '#94A3B8',
          'text-muted': '#64748B',
        }
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { 'box-shadow': '0 0 20px rgba(139, 92, 246, 0.4)' },
          '50%': { 'box-shadow': '0 0 40px rgba(139, 92, 246, 0.8)' },
          '100%': { 'box-shadow': '0 0 20px rgba(139, 92, 246, 0.4)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(5px) rotate(-1deg)' },
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2), 0 0 60px rgba(236, 72, 153, 0.1)',
        'glow-hover': '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3), 0 0 90px rgba(236, 72, 153, 0.2)',
      }
    },
  },
  plugins: [],
};