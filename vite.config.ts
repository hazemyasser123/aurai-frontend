import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Any request starting with /api will be forwarded to localhost:3000
      "/api": {
        target: "https://api-sales.aurai.solutions",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // removes /api prefix
      },
    },
  },
});
