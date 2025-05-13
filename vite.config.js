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
      // /user 로 들어오는 요청은 https://api.studylink.store 로 포워딩
      '/user': {
        target: 'http://localhost:8081/',
        changeOrigin: true,
      },
      // 만약 API 엔드포인트가 /api 로 시작한다면 아래처럼 추가
      '/api': {
        target: 'http://localhost:8081/',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://localhost:8081/',
        changeOrigin: true,
      }
    },
  }
})