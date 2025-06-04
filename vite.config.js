import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  server: {
    port: 5173,
    proxy: {
      '/user': {
        target: 'https://api.studylink.store/',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://api.studylink.store/',
        changeOrigin: true,
        secure: false,
      },
      '/room': {  // ← 이 부분 추가
        target: 'https://api.studylink.store/',
        changeOrigin: true,
        secure: false,
      },
      '/oauth2': {
        target: 'https://api.studylink.store/',
        changeOrigin: true,
        secure: false,
      },
      '/login/oauth2': {
        target: 'https://api.studylink.store/',
        changeOrigin: true,
        secure: false,
      },
      '/post': {
        target: 'https://api.studylink.store/',
        changeOrigin: true,
        secure: false,
      },
      '/comment': {
        target: 'https://api.studylink.store/',
        changeOrigin: true,
        secure: false,
      },
    },
  }
})