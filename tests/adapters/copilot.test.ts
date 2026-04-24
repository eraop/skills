import { access, rm } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildCopilotArtifact } from "../../packages/adapter-copilot/src/index.ts";
import { loadSkill } from "../../packages/core/src/skill-loader.ts";

describe("buildCopilotArtifact", () => {
  const artifactRoot = ".tmp/tests/adapters/copilot/code-generation-guardrails";
  const testRoot = ".tmp/tests/adapters/copilot";

  beforeEach(async () => {
    await rm(testRoot, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(testRoot, { recursive: true, force: true });
  });

  it("returns a copilot artifact manifest", async () => {
    const skill = await loadSkill("tests/fixtures/code-generation-guardrails");
    const artifact = await buildCopilotArtifact({
      skill,
      artifactRoot
    });

    expect(artifact.platform).toBe("copilot");
    await expect(access(path.join(artifactRoot, "SKILL.md"))).resolves.toBeUndefined();
    await expect(access(path.join(artifactRoot, "README.md"))).rejects.toThrow();
  });
});
