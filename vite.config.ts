import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use custom domain base path if CNAME file exists, otherwise GitHub Pages subdirectory
  base: process.env.CUSTOM_DOMAIN === 'true' ? '/' : 
        (process.env.NODE_ENV === 'production' ? '/LaFontaine-Pulse/' : '/'),
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize bundle size for GitHub Pages
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-switch', '@radix-ui/react-toast'],
        },
      },
    },
    chunkSizeWarningLimit: 800, // Increase limit for data visualization apps
  },
}));
