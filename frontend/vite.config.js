import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get base path from environment or use repository name
const base = process.env.VITE_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/subscription-hub/' : '/')

export default defineConfig({
  plugins: [react()],
  base: base,
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})

