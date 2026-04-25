import { access, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { installSkill } from "../../packages/core/src/install-skill.ts";
import { resolveInstallPath } from "../../packages/core/src/locators.ts";

describe("resolveInstallPath", () => {
  it("returns a project agents path", async () => {
    const resolved = await resolveInstallPath({
      scope: "project",
      projectRoot: path.join(path.sep, "repo", "demo")
    });

    expect(resolved).toBe(path.join(path.sep, "repo", "demo", ".agents", "skills"));
  });

  it("returns the default global agents path", async () => {
    const home = path.join(path.sep, "home", "demo");
    const resolved = await resolveInstallPath({
      scope: "global",
      home
    });

    expect(resolved).toBe(path.join(home, ".agents", "skills"));
  });
});

describe("installSkill", () => {
  const outputRoot = ".tmp/dist";
  const projectRoot = ".tmp/project";

  beforeEach(async () => {
    await rm(outputRoot, { recursive: true, force: true });
    await rm(projectRoot, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(outputRoot, { recursive: true, force: true });
    await rm(projectRoot, { recursive: true, force: true });
  });

  it("installs a skill into project .agents", async () => {
    const results = await installSkill({
      skillRoot: "tests/fixtures/code-generation-guardrails",
      outputRoot,
      scope: "project",
      projectRoot
    });

    expect(results[0]?.destination).toBe(
      path.join(projectRoot, ".agents", "skills", "code-generation-guardrails")
    );

    const skillFile = path.join(results[0]!.destination, "SKILL.md");
    await expect(access(skillFile)).resolves.toBeUndefined();
  });

  it("installs a skill into global .agents", async () => {
    const home = path.join(projectRoot, "home");
    const results = await installSkill({
      skillRoot: "tests/fixtures/code-generation-guardrails",
      outputRoot,
      scope: "global",
      home
    });

    expect(results).toEqual([
      {
        destination: path.join(home, ".agents", "skills", "code-generation-guardrails")
      }
    ]);
    await expect(
      access(path.join(home, ".agents", "skills", "code-generation-guardrails", "SKILL.md"))
    ).resolves.toBeUndefined();
  });

  it("reinstall removes stale files from an existing destination", async () => {
    const [firstInstall] = await installSkill({
      skillRoot: "tests/fixtures/code-generation-guardrails",
      outputRoot,
      scope: "project",
      projectRoot
    });

    const staleFile = path.join(firstInstall!.destination, "stale.txt");
    await writeFile(staleFile, "stale");

    await installSkill({
      skillRoot: "tests/fixtures/code-generation-guardrails",
      outputRoot,
      scope: "project",
      projectRoot
    });

    await expect(access(staleFile)).rejects.toThrow();
  });

  it("installs a new skill into .agents without platform metadata", async () => {
    const skillRoot = path.join(projectRoot, "plain-skill");
    await mkdir(skillRoot, { recursive: true });
    await writeFile(
      path.join(skillRoot, "skill.yaml"),
      [
        'name: "plain-skill"',
        'title: "Plain Skill"',
        'description: "Uses the shared agents format"',
        'version: "0.1.0"',
        "tags:",
        '  - "test"',
        "triggers:",
        '  - "test"',
        ""
      ].join("\n")
    );
    await writeFile(path.join(skillRoot, "body.md"), "# Plain Skill\n");

    const results = await installSkill({
      skillRoot,
      outputRoot,
      scope: "project",
      projectRoot
    });

    expect(results[0]?.destination).toBe(
      path.join(projectRoot, ".agents", "skills", "plain-skill")
    );
  });
});
