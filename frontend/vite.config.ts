import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to the backend during development.
    // This means the frontend calls /api/... and Vite forwards it to
    // localhost:3001 — no CORS issues in dev, and no hardcoded backend URL.
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
