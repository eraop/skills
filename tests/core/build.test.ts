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
    const [artifact] = await buildSkill({
      skillRoot: "tests/fixtures/code-generation-guardrails",
      outputRoot
    });

    expect(artifact?.skillName).toBe("code-generation-guardrails");
    expect(artifact?.artifactPath).toBe(path.join(outputRoot, "code-generation-guardrails"));

    const skillFile = await readFile(path.join(artifact!.artifactPath, "SKILL.md"), "utf8");
    expect(skillFile).toContain("---\nname: code-generation-guardrails");
    expect(skillFile).toContain("triggers:");
    expect(skillFile).not.toContain("## 适用场景");
  });

  it("builds localized variants under one shared skill folder", async () => {
    const artifacts = await buildSkill({
      skillRoot: "tests/fixtures/code-generation-guardrails-localized",
      outputRoot
    });

    expect(artifacts.map((artifact) => artifact.artifactPath)).toEqual([
      path.join(outputRoot, "code-generation-guardrails-localized", "en"),
      path.join(outputRoot, "code-generation-guardrails-localized", "zh")
    ]);

    const englishSkill = await readFile(
      path.join(outputRoot, "code-generation-guardrails-localized", "en", "SKILL.md"),
      "utf8"
    );
    const chineseSkill = await readFile(
      path.join(outputRoot, "code-generation-guardrails-localized", "zh", "SKILL.md"),
      "utf8"
    );

    expect(englishSkill).toContain("---\nname: code-generation-guardrails");
    expect(chineseSkill).toContain("---\nname: code-generation-guardrails-zh");
  });
});
