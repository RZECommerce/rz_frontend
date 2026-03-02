import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Centralized API URL configuration
  // VITE_API_URL should include /api (e.g., http://backend:8000/api)
  // For proxy target, we need to strip /api since the proxy path is already /api
  const AUTH_TARGET = env.VITE_AUTH_URL || "http://localhost:8001";
  const API_TARGET = env.VITE_API_URL
    ? env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:8000";

  return {
    plugins: [TanStackRouterVite(), react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/components": path.resolve(__dirname, "./src/components"),
        "@/features": path.resolve(__dirname, "./src/features"),
        "@/hooks": path.resolve(__dirname, "./src/hooks"),
        "@/lib": path.resolve(__dirname, "./src/lib"),
        "@/services": path.resolve(__dirname, "./src/services"),
        "@/stores": path.resolve(__dirname, "./src/stores"),
        "@/types": path.resolve(__dirname, "./src/types"),
      },
    },

    server: {
      port: 3090,
      host: true,
      open: true,

      proxy: {
        // ----------------------------
        // AUTH SERVICE (SESSION OWNER)
        // ----------------------------
        "/auth": {
          target: AUTH_TARGET,
          changeOrigin: true,
          secure: false,
          ws: true,
          cookieDomainRewrite: "localhost",
          cookiePathRewrite: "/",
        },

        // ----------------------------
        // ERP BUSINESS API
        // Centralized API URL: VITE_API_URL includes /api, but proxy target needs base URL
        // ----------------------------
        "/api": {
          target: API_TARGET,
          changeOrigin: true,
          secure: false,
          ws: true,
          cookieDomainRewrite: "localhost",
          cookiePathRewrite: "/",
        },

        // ----------------------------
        // LARAVEL STORAGE (uploaded files)
        // ----------------------------
        "/storage": {
          target: API_TARGET,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      open: false,
      allowedHosts: ["rz-erp.chysev.cloud"], // Update with your production domain
    },

    build: {
      outDir: "dist",
      sourcemap: true,

      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (
                id.includes("/react/") ||
                id.includes("/react-dom/") ||
                id.includes("/scheduler/")
              ) {
                return "react-vendor";
              }

              if (id.includes("/@tanstack/")) {
                return "tanstack-vendor";
              }

              if (id.includes("/recharts/") || id.includes("/@fullcalendar/")) {
                return "react-vendor";
              }

              if (id.includes("/@hugeicons/")) {
                return "icons-vendor";
              }

              if (
                id.includes("/react-hook-form/") ||
                id.includes("/@hookform/") ||
                id.includes("/zod/")
              ) {
                return "form-vendor";
              }

              if (id.includes("/date-fns/")) {
                return "date-vendor";
              }

              if (id.includes("/zustand/")) {
                return "state-vendor";
              }

              const safeForVendor = [
                "/clsx/",
                "/tailwind-merge/",
                "/class-variance-authority/",
                "/tw-animate-css/",
              ];

              if (safeForVendor.some((p) => id.includes(p))) {
                return "vendor";
              }

              return "react-vendor";
            }
          },
        },
      },

      chunkSizeWarningLimit: 1000,
    },
  };
});
