import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react()
  ],
  base: '/',
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
    include: ['framer-motion', 'lenis', 'react', 'react-dom', 'react-router-dom', '@splinetool/viewer', 'wagmi', '@rainbow-me/rainbowkit', 'viem'],
    exclude: []
  },
  server: {
    hmr: {
      overlay: false
    },
    host: true,
    middlewareMode: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
        timeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/tigris': {
        target: 'https://releases-test.clones-ai.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/tigris/, ''),
        headers: {
          'Origin': 'https://clones-site-test.fly.dev'
        }
      }
    }
  }
});