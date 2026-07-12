import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3000',
        changeOrigin: false, // Let Host header pass through for multi-tenant backend
      },
      '/uploads': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3000',
        changeOrigin: false,
      }
    }
  }
})
