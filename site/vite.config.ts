import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  root: rootDir,
  publicDir: path.resolve(rootDir, "public"),
  build: {
    outDir: path.resolve(rootDir, "../site-dist"),
    emptyOutDir: true,
  },
});
