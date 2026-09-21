/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // vmThreads creates the jsdom environment once per worker instead of
    // once per test file, cutting startup time roughly in half while
    // keeping per-file isolation.
    pool: 'vmThreads',
    // Workers hang at startup when files run in parallel on this Windows
    // setup (project path contains a space); sequential startup is reliable.
    fileParallelism: false,
  },
})
