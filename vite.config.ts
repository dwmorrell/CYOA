import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Relative base so the build works from any static host or sub-path.
// The service worker precaches the app shell and fonts so the game opens
// offline; story files use network-first so a newly published story shows up
// when online and the cached copy is used when offline.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: false,
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2,webmanifest}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/stories/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'stories', networkTimeoutSeconds: 4, expiration: { maxEntries: 200 } },
          },
        ],
      },
    }),
  ],
  build: {
    target: ['es2020', 'chrome90'],
    outDir: 'dist',
    sourcemap: false,
  },
});
