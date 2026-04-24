import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("GitHub Pages workflow", () => {
  it("deploys the Vite site-dist artifact instead of a root Jekyll site", () => {
    const pagesWorkflow = readFileSync(".github/workflows/pages.yml", "utf8");

    expect(pagesWorkflow).toContain("npm run site:build");
    expect(pagesWorkflow).toContain("path: ./site-dist");
    expect(pagesWorkflow).toContain("actions/deploy-pages");
    expect(existsSync(".github/workflows/jekyll-gh-pages.yml")).toBe(false);
  });
});
