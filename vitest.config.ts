import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Lightweight regression net. Tests live in /tests and import the REAL
// production modules via the same `@/` alias the app uses.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
