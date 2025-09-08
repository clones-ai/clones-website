import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/clones-website/' : '/',
  esbuild: {
    target: 'es2020'
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      // Enable aggressive tree shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion': ['framer-motion'],
          'router': ['react-router-dom'],
          'icons': ['lucide-react'],
          'wagmi': ['wagmi', '@rainbow-me/rainbowkit'],
          'query': ['@tanstack/react-query']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['framer-motion', 'lenis', 'react', 'react-dom', 'react-router-dom'],
    exclude: []
  },
  server: {
    hmr: {
      overlay: false
    },
    host: true
  }
});