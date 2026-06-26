import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Standalone Vite config for the Capacitor / Android build.
// Produces a static SPA in "www/" — no SSR, no TanStack Start.
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  // Capacitor loads files from the local filesystem via file:// protocol,
  // so all asset references must be relative (./assets/…), not absolute (/assets/…).
  base: "./",
  build: {
    outDir: "www",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html",
    },
  },
});
