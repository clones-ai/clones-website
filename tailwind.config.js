/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        system: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', '"Courier New"', 'monospace'],
      },
      colors: {
        // Primary Colors - Purple Gradient
        'primary': {
          500: '#8B5CF6',
          600: '#A855F7', 
          700: '#9333EA',
        },
        
        // Background Scale
        'bg': {
          primary: '#000000',
          quaternary: '#1A1A1A',
          quinary: '#262626',
        },
        
        // Text Scale
        'text': {
          primary: '#F8FAFC',
          secondary: '#E2E8F0', 
          muted: '#94A3B8',
          subtle: '#64748B',
        },
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(168, 85, 247, 0.2), 0 0 60px rgba(147, 51, 234, 0.1)',
        'glow-hover': '0 0 40px rgba(139, 92, 246, 0.8), 0 0 80px rgba(168, 85, 247, 0.4), 0 0 120px rgba(147, 51, 234, 0.3)',
        'text-glow': '0 0 10px rgba(139, 92, 246, 0.5)',
      }
    },
  },
  plugins: [],
};