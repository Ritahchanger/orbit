import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["fonts/**/*", "logo.jpg", "favicon.ico"],
        manifest: {
          name: "MegaGamers",
          short_name: "MegaGamers",
          description: "MegaGamers Gaming Hub App",
          theme_color: "#3b82f6",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            {
              src: "/mega-gamers.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/mega-gamers.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "/mega-gamers.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff,woff2}"],
          // INCREASED to 5MB to handle large chunks
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /^\/api\/.*$/i,
              handler: "NetworkFirst",
              method: "GET",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24,
                },
                networkTimeoutSeconds: 10,
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "images-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "fonts-cache",
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@data": path.resolve(__dirname, "./data"),
      },
    },
    server: {
      host: true,
      allowedHosts: [
        "localhost",
        ".trycloudflare.com",
        ".ngrok-free.app",
        ".ngrok.io",
      ],
      headers: {
        "Cross-Origin-Embedder-Policy": "cross-origin",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: {
        overlay: false,
      },
    },
    // CRITICAL: Build optimization
    build: {
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Enable source maps for debugging (optional)
      sourcemap: false,
      // Rollup options for code splitting
      rollupOptions: {
        output: {
    
          manualChunks: (id) => {
            
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/react-router-dom/")
            ) {
              return "vendor-react";
            }

            // MUI libraries
            if (
              id.includes("node_modules/@mui/") ||
              id.includes("node_modules/@emotion/")
            ) {
              return "vendor-mui";
            }

            // Large utility libraries
            if (
              id.includes("node_modules/lodash/") ||
              id.includes("node_modules/date-fns/") ||
              id.includes("node_modules/axios/")
            ) {
              return "vendor-utils";
            }

            // Charting libraries (if you have any)
            if (
              id.includes("node_modules/chart.js/") ||
              id.includes("node_modules/recharts/")
            ) {
              return "vendor-charts";
            }

            // Put everything else in main chunk
            return null;
          },
          // Ensure consistent chunk naming
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
    },
    test: {
      globals: true,
      environment: "happy-dom",
      setupFiles: ["./src/setupTests.tsx"],
      include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
      testTimeout: 30000,
      hookTimeout: 30000,
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: [
          "node_modules/",
          "src/setupTests.ts",
          "**/*.d.ts",
          "**/*.config.*",
          "**/*.test.*",
          "**/*.spec.*",
        ],
      },
    },
  };
});
