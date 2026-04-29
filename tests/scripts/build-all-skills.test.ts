import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildAllSkills } from "../../scripts/build-all-skills.ts";

describe("buildAllSkills", () => {
  const repoRoot = ".tmp/tests/scripts/build-all-skills";

  beforeEach(async () => {
    await rm(repoRoot, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(repoRoot, { recursive: true, force: true });
  });

  async function writeSkill(root: string, name: string) {
    await mkdir(root, { recursive: true });
    await writeFile(
      path.join(root, "skill.yaml"),
      [
        `name: ${name}`,
        `title: ${name}`,
        "description: Build test skill.",
        "version: 0.1.0",
        "tags: []",
        "triggers:",
        "  - test build",
        "",
      ].join("\n"),
      "utf8",
    );
    await writeFile(path.join(root, "body.md"), "Build test body.", "utf8");
  }

  it("builds every skill directory into dist", async () => {
    await writeSkill(path.join(repoRoot, "skills", "alpha"), "alpha");
    await writeSkill(path.join(repoRoot, "skills", "beta"), "beta");

    const artifacts = await buildAllSkills({ repoRoot });

    expect(artifacts.map((artifact) => artifact.skillName)).toEqual([
      "alpha",
      "beta",
    ]);
    expect(await readdir(path.join(repoRoot, "dist"))).toEqual([
      "alpha",
      "beta",
    ]);
  });
});
