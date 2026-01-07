import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 代理 Meshy API 请求
      '/api/meshy': {
        target: 'https://api.meshy.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/meshy/, ''),
      },
      // 代理 Meshy 资产请求
      '/assets/meshy': {
        target: 'https://assets.meshy.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/assets\/meshy/, ''),
      },
    },
  },
})
