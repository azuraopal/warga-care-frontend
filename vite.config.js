import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  let backendTarget = (env.VITE_BACKEND_URL || env.VITE_API_TARGET || '').trim()

  if (!backendTarget) {
    const rawApiUrl = (env.VITE_API_BASE_URL || env.VITE_API_URL || '').trim()
    if (/^https?:\/\//i.test(rawApiUrl)) {
      try {
        backendTarget = new URL(rawApiUrl).origin
      } catch {
        backendTarget = ''
      }
    }
  }

  if (!backendTarget) {
    backendTarget = 'http://localhost:8080'
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  }
})

