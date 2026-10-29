import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/vtm6elist/',
  plugins: process.env.VITEST ? [] : [react()],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          pdf: ['jspdf', 'html-to-image'],
          react: ['react', 'react-dom']
        }
      }
    }
  }
});
