import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  base: "./",
  root: rootDir,
  publicDir: path.resolve(rootDir, "public"),
  plugins: [
    tailwindcss(),
    {
      name: "skills-dev-entry",
      transformIndexHtml(html) {
        if (command !== "serve") {
          return html;
        }

        return html.replace("/src/main.ts", "/src/main-dev.ts");
      },
    },
  ],
  build: {
    outDir: path.resolve(rootDir, "../site-dist"),
    emptyOutDir: true,
  },
}));
