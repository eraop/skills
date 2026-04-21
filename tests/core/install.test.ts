import { access, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildCodexArtifact } from "../../packages/adapter-codex/src/index.ts";
import { buildCopilotArtifact } from "../../packages/adapter-copilot/src/index.ts";
import { buildCursorArtifact } from "../../packages/adapter-cursor/src/index.ts";
import { installSkill } from "../../packages/core/src/install-skill.ts";
import { resolveInstallPath } from "../../packages/core/src/locators.ts";

describe("resolveInstallPath", () => {
  it("returns a project Codex path", async () => {
    const resolved = await resolveInstallPath({
      platform: "codex",
      scope: "project",
      projectRoot: path.join(path.sep, "repo", "demo")
    });

    expect(resolved).toBe(path.join(path.sep, "repo", "demo", ".codex", "skills"));
  });

  it("returns a global Cursor path suffix", async () => {
    const resolved = await resolveInstallPath({
      platform: "cursor",
      scope: "global"
    });

    expect(resolved.endsWith(path.join(".cursor", "skills"))).toBe(true);
  });
});

describe("installSkill", () => {
  const outputRoot = ".tmp/dist";
  const projectRoot = ".tmp/project";
  const builders = {
    codex: buildCodexArtifact,
    copilot: buildCopilotArtifact,
    cursor: buildCursorArtifact
  };

  beforeEach(async () => {
    await rm(outputRoot, { recursive: true, force: true });
    await rm(projectRoot, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(outputRoot, { recursive: true, force: true });
    await rm(projectRoot, { recursive: true, force: true });
  });

  it("installs a skill into project scope", async () => {
    const results = await installSkill({
      skillRoot: "tests/fixtures/using-superpowers",
      outputRoot,
      target: "codex",
      scope: "project",
      projectRoot,
      builders
    });

    expect(results[0]?.destination).toBe(
      path.join(projectRoot, ".codex", "skills", "using-superpowers")
    );
  });

  it("reinstall removes stale files from an existing destination", async () => {
    const [firstInstall] = await installSkill({
      skillRoot: "tests/fixtures/using-superpowers",
      outputRoot,
      target: "codex",
      scope: "project",
      projectRoot,
      builders
    });

    const staleFile = path.join(firstInstall!.destination, "stale.txt");
    await writeFile(staleFile, "stale");

    await installSkill({
      skillRoot: "tests/fixtures/using-superpowers",
      outputRoot,
      target: "codex",
      scope: "project",
      projectRoot,
      builders
    });

    await expect(access(staleFile)).rejects.toThrow();
  });

  it("throws a clear error when the requested artifact was not built", async () => {
    const skillRoot = path.join(projectRoot, "single-platform-skill");
    await mkdir(skillRoot, { recursive: true });
    await writeFile(
      path.join(skillRoot, "skill.yaml"),
      [
        'name: "single-platform-skill"',
        'title: "Single Platform Skill"',
        'description: "Only supports Codex"',
        'version: "0.1.0"',
        "tags:",
        '  - "test"',
        "triggers:",
        '  - "test"',
        "platforms:",
        '  - "codex"',
        ""
      ].join("\n")
    );
    await writeFile(path.join(skillRoot, "body.md"), "# Single Platform Skill\n");

    await expect(
      installSkill({
        skillRoot,
        outputRoot,
        target: "cursor",
        scope: "project",
        builders,
        projectRoot
      })
    ).rejects.toThrow('No build artifact was produced for platform "cursor"');
  });
});
