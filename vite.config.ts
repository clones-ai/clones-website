import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: 'es2020',
    minify: true,
    treeShaking: true
  },
  build: {
    target: 'es2020',
    minify: 'esbuild', // Faster than terser
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
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('@splinetool')) {
              return 'spline';
            }
            return 'vendor';
          }

          // Split components by feature
          if (id.includes('/components/motion/')) {
            return 'motion-components';
          }
          if (id.includes('/components/forge/')) {
            return 'forge-components';
          }
          if (id.includes('/components/marketplace/')) {
            return 'marketplace-components';
          }
          if (id.includes('/components/metadatasets/')) {
            return 'metadatasets-components';
          }
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