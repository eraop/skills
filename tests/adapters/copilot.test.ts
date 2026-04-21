import { rm } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildCopilotArtifact } from "../../packages/adapter-copilot/src/index.ts";
import { loadSkill } from "../../packages/core/src/skill-loader.ts";

describe("buildCopilotArtifact", () => {
  const artifactRoot = ".tmp/tests/adapters/copilot/using-superpowers";
  const testRoot = ".tmp/tests/adapters/copilot";

  beforeEach(async () => {
    await rm(testRoot, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(testRoot, { recursive: true, force: true });
  });

  it("returns a copilot artifact manifest", async () => {
    const skill = await loadSkill("tests/fixtures/using-superpowers");
    const artifact = await buildCopilotArtifact({
      skill,
      artifactRoot
    });

    expect(artifact.platform).toBe("copilot");
  });
});
