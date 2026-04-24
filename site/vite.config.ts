import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  root: rootDir,
  publicDir: path.resolve(rootDir, "public"),
  plugins: [tailwindcss()],
  build: {
    outDir: path.resolve(rootDir, "../site-dist"),
    emptyOutDir: true,
  },
});
