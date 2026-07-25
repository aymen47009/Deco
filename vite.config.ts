import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { startApiServer } from "./server/vite-plugin.js";

export default defineConfig({
  plugins: [react(), startApiServer()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 5173,
  },
});
