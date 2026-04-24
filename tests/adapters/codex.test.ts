import { rm } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildCodexArtifact } from "../../packages/adapter-codex/src/index.ts";
import { loadSkill } from "../../packages/core/src/skill-loader.ts";

describe("buildCodexArtifact", () => {
  const artifactRoot = ".tmp/tests/adapters/codex/code-generation-guardrails";
  const testRoot = ".tmp/tests/adapters/codex";

  beforeEach(async () => {
    await rm(testRoot, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(testRoot, { recursive: true, force: true });
  });

  it("returns a codex artifact manifest", async () => {
    const skill = await loadSkill("tests/fixtures/code-generation-guardrails");
    const artifact = await buildCodexArtifact({
      skill,
      artifactRoot
    });

    expect(artifact.platform).toBe("codex");
    expect(artifact.skillName).toBe("code-generation-guardrails");
  });
});
