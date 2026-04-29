import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { afterEach, describe, expect, it, vi } from "vitest";

// @ts-expect-error The standalone installer is executable JavaScript without TS declarations.
const installer = await import("../../scripts/install.mjs");

describe("remote installer helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses skill metadata needed by the standalone installer", () => {
    const document = installer.parseSkillDocument(`
name: code-generation-guardrails
description: Keep generated code simple, consistent, and narrowly scoped.
triggers:
  - write code
`);

    expect(document).toEqual({
      name: "code-generation-guardrails",
      title: "code-generation-guardrails",
      description: "Keep generated code simple, consistent, and narrowly scoped.",
      triggers: ["write code"],
    });
  });

  it("resolves global and project install roots under .agents", () => {
    const home = path.join(os.tmpdir(), "skills-home");
    const cwd = path.join(os.tmpdir(), "skills-project");

    expect(installer.resolveInstallRoot("global", { home })).toBe(
      path.join(home, ".agents", "skills"),
    );
    expect(installer.resolveInstallRoot("project", { cwd })).toBe(
      path.join(cwd, ".agents", "skills"),
    );
  });

  it("builds the SKILL.md content without requiring the repository checkout", () => {
    const output = installer.buildSkillMarkdown(
      {
        name: "code-generation-guardrails",
        title: "Code Generation Guardrails",
        description: "Keep generated code simple.",
        triggers: ["write code"],
      },
      "Keep code small.",
    );

    expect(output).toContain("---\nname: code-generation-guardrails");
    expect(output).toContain("description: Keep generated code simple.");
    expect(output).toContain("triggers:");
    expect(output).not.toContain("title:");
    expect(output).not.toContain("platforms:");
    expect(output).toContain("- write code");
    expect(output).not.toContain("## 适用场景");
    expect(output).toContain("# Code Generation Guardrails\n\nKeep code small.");
  });

  it("installs to .agents using the selected scope", async () => {
    const root = path.join(os.tmpdir(), "skills-install-default");
    const home = path.join(root, "home");
    const cwd = path.join(root, "project");
    await rm(root, { recursive: true, force: true });

    vi.stubGlobal("fetch", async (url: string) => ({
      ok: true,
      text: async () =>
        url.endsWith("/skill.yaml")
          ? [
              "name: code-generation-guardrails",
              "description: Keep generated code simple.",
              "triggers:",
              "  - write code",
              "",
            ].join("\n")
          : "Keep code small.",
    }));

    const installed = await installer.installRemoteSkill({
      skillName: "code-generation-guardrails",
      scope: "project",
      baseUrl: "https://example.test",
      home,
      cwd,
    });

    const destination = path.join(cwd, ".agents", "skills", "code-generation-guardrails");
    expect(installed).toEqual([{ destination }]);

    const skillFile = await readFile(path.join(destination, "SKILL.md"), "utf8");
    expect(skillFile).toContain("---\nname: code-generation-guardrails");
    expect(skillFile).toContain("triggers:");
    expect(skillFile).not.toContain("## 适用场景");

    await rm(root, { recursive: true, force: true });
  });

  it("installs a generated skill from site data", async () => {
    const root = path.join(os.tmpdir(), "skills-install-site-data");
    const home = path.join(root, "home");
    const cwd = path.join(root, "project");
    await rm(root, { recursive: true, force: true });

    vi.stubGlobal("fetch", async (url: string) => {
      if (url.endsWith("/site/public/data/skills.json")) {
        return {
          ok: true,
          text: async () => JSON.stringify([
            {
              name: "code-generation-guardrails-zh",
              title: "代码生成约束",
              description: "保持生成代码简单。",
              triggers: ["编写代码"],
              body: "# 代码生成约束\n\n保持代码小而清晰。"
            }
          ]),
        };
      }

      return {
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: async () => "",
      };
    });

    const installed = await installer.installRemoteSkill({
      skillName: "code-generation-guardrails-zh",
      scope: "project",
      baseUrl: "https://example.test",
      home,
      cwd,
    });

    const destination = path.join(cwd, ".agents", "skills", "code-generation-guardrails-zh");
    expect(installed).toEqual([{ destination }]);

    const skillFile = await readFile(path.join(destination, "SKILL.md"), "utf8");
    expect(skillFile).toContain("---\nname: code-generation-guardrails-zh");
    expect(skillFile).toContain("保持代码小而清晰。");

    await rm(root, { recursive: true, force: true });
  });

  it("runs when piped to node over stdin", () => {
    const output = execFileSync("node", ["-", "--help"], {
      input: readFileSync("scripts/install.mjs"),
      encoding: "utf8",
    });

    expect(output).toContain("Remote one-line usage");
    expect(output).not.toContain("--target");
    expect(output).not.toContain("--platform");
  });
});
