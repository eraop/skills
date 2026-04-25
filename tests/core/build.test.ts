import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { buildSkill } from "../../packages/core/src/build-skill.ts";

describe("buildSkill", () => {
  const outputRoot = ".tmp/tests/core/build";

  beforeEach(async () => {
    await rm(outputRoot, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(outputRoot, { recursive: true, force: true });
  });

  it("builds a single shared skill artifact", async () => {
    const artifact = await buildSkill({
      skillRoot: "tests/fixtures/code-generation-guardrails",
      outputRoot
    });

    expect(artifact.skillName).toBe("code-generation-guardrails");
    expect(artifact.artifactPath).toBe(path.join(outputRoot, "code-generation-guardrails"));

    const skillFile = await readFile(path.join(artifact.artifactPath, "SKILL.md"), "utf8");
    expect(skillFile).toContain("---\nname: code-generation-guardrails");
    expect(skillFile).toContain("triggers:");
    expect(skillFile).not.toContain("## 适用场景");
  });
});
