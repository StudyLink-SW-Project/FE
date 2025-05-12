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
// 모든 API 요청들을 백엔드로 프록시
      '/api': {
        target: 'https://api.studylink.store',
        changeOrigin: true,
      },
      '/user': {
        target: 'https://api.studylink.store',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'https://api.studylink.store',
        changeOrigin: true,
      }
    },
  }
})