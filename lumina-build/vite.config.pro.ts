import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Config para build PRO
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  define: {
    'import.meta.env.VITE_IS_PRO': JSON.stringify('true'),
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
