import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/mira-gametracker",
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://gametracker-api-y3q1.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }, 
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})
