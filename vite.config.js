import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      'next/image': '/src/shared/next-image.jsx',
      'next/dynamic': '/src/shared/next-dynamic.jsx',
    }
  },
  // Supports Vercel (/) and GitHub Pages (/NexaSphere/) via env var
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    VitePWA({
      disable: true,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'NexaSphere — Connecting GL Bajaj Tech Ecosystem',
        short_name: 'NexaSphere',
        description: 'The premier tech community of GL Bajaj Group of Institutions.',
        theme_color: '#CC1111',
        background_color: '#0A0A0A',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        inlineWorkboxRuntime: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}']
      }
    })
  ],
  server: {
    port: 5175,
    proxy: {
      '/api': 'http://localhost:8080',
      '/healthz': 'http://localhost:8080',
    },
  },
})
