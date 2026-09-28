import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

function versionStamperPlugin() {
  return {
    name: 'version-stamper',
    buildStart() {
      const buildTime = Date.now();
      const versionObj = {
        version: `v1.0.${buildTime}`,
        buildTime,
        date: new Date().toISOString()
      };
      const publicDir = path.resolve(__dirname, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(path.resolve(publicDir, 'app-version.json'), JSON.stringify(versionObj, null, 2));
    },
    closeBundle() {
      const buildTime = Date.now();
      const versionObj = {
        version: `v1.0.${buildTime}`,
        buildTime,
        date: new Date().toISOString()
      };
      const distDir = path.resolve(__dirname, 'dist');
      if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.resolve(distDir, 'app-version.json'), JSON.stringify(versionObj, null, 2));
      }
    }
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      versionStamperPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'apple-touch-icon.png', 'og-image.jpg'],
        manifest: {
          id: '/',
          name: 'Батаарын Өлгий | Bataar Travel',
          short_name: 'BataarTravel',
          description: 'Монголын үлэг гүрвэлийн өлгий нутаг, Тарбозавр Батаар палео-аялал жуулчлалын нэгдсэн систем',
          theme_color: '#0c0a09',
          background_color: '#0c0a09',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: './icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: './icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: './icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/, /app-version\.json/],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'unsplash-images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
