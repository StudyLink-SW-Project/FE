import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/user': {
        target: 'http://localhost:8081/',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8081/',
        changeOrigin: true,
        secure: false,
      },
      '/oauth2': {
        target: 'http://localhost:8081/',
        changeOrigin: true,
        secure: false,
      },
      '/login/oauth2': {
        target: 'http://localhost:8081/',
        changeOrigin: true,
        secure: false,
      }
    },
  }
})