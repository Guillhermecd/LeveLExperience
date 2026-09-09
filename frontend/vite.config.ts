import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // xp-rules.json lives at the repo root, one level above this project —
      // it is the single spec both Vitest (here) and JUnit (backend) run
      // against, so it is imported directly rather than copied.
      allow: [path.resolve(import.meta.dirname, '..')],
    },
  },
})
