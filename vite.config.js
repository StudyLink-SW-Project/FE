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
        target: 'http://localhost:6080',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:6080',
        changeOrigin: true,
        secure: false,
      },
      '/room': {
        target: 'http://localhost:6080',
        changeOrigin: true,
        secure: false,
      },
      '/oauth2': {
        target: 'http://localhost:6080',
        changeOrigin: true,
        secure: false,
      },
      '/login/oauth2': {
        target: 'http://localhost:6080',
        changeOrigin: true,
        secure: false,
      },
      '/post': {
        target: 'http://localhost:6080',
        changeOrigin: true,
        secure: false,
      },
      '/comment': {
        target: 'http://localhost:6080',
        changeOrigin: true,
        secure: false,
      },
      '^/study/': {
        target: 'http://localhost:6080',
        changeOrigin: true,
        secure: false,
      },
      '/day': {
        target: 'http://localhost:6080',
        changeOrigin: true,
        secure: false,
      },
    },
  }
})