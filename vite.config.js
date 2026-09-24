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
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('leaflet') || id.includes('react-leaflet')) {
                return 'vendor-leaflet';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              return 'vendor-libs';
            }
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
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

