import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const installer = await import("../../scripts/install.mjs");

describe("remote installer helpers", () => {
  it("parses skill metadata needed by the standalone installer", () => {
    const document = installer.parseSkillDocument(`
name: code-generation-guardrails
title: Code Generation Guardrails
platforms:
  - codex
  - copilot
  - cursor
`);

    expect(document).toEqual({
      name: "code-generation-guardrails",
      title: "Code Generation Guardrails",
      platforms: ["codex", "copilot", "cursor"],
    });
  });

  it("resolves global install roots for supported agents", () => {
    const home = path.join(os.tmpdir(), "skills-home");

    expect(installer.resolveInstallRoot("codex", "global", { home })).toBe(
      path.join(home, ".codex", "skills"),
    );
    expect(installer.resolveInstallRoot("copilot", "global", { home })).toBe(
      path.join(home, ".config", "copilot", "skills"),
    );
    expect(installer.resolveInstallRoot("cursor", "global", { home })).toBe(
      path.join(home, ".cursor", "skills"),
    );
  });

  it("builds the SKILL.md content without requiring the repository checkout", () => {
    expect(installer.buildSkillMarkdown("Code Generation Guardrails", "Keep code small.")).toBe(
      "# Code Generation Guardrails\n\nKeep code small.",
    );
  });

  it("runs when piped to node over stdin", () => {
    const output = execFileSync("node", ["-", "--help"], {
      input: readFileSync("scripts/install.mjs"),
      encoding: "utf8",
    });

    expect(output).toContain("Remote one-line usage");
  });
});
