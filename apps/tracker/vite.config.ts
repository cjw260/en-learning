import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import dts from 'vite-plugin-dts'
export default defineConfig({
  plugins: [
    dts({
      outDir: 'dist',
      entryRoot: '.'
    })
  ],
  build: {
    minify: true,
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: 'index.ts',
      name: 'tracker',
      fileName: 'tracker',
      formats: ['es', 'cjs', 'umd', 'iife']
    },
  },
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:3000`,
        changeOrigin: true
      },
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})