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
      // '/token' 로 오는 요청을 백엔드 6080 번으로 전달
      '/token': 'http://localhost:6080',
    },
  }
})
