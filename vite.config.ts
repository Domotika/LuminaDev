import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    cssCodeSplit: false,
    outDir: 'dist',
    assetsDir: '', // Flat structure for Hubitat
    emptyOutDir: true,
    minify: 'terser', // Maximum minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs for production
      }
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
});