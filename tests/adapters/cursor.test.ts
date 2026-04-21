import { rm } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildCursorArtifact } from "../../packages/adapter-cursor/src/index.ts";
import { loadSkill } from "../../packages/core/src/skill-loader.ts";

describe("buildCursorArtifact", () => {
  const artifactRoot = ".tmp/tests/adapters/cursor/using-superpowers";
  const testRoot = ".tmp/tests/adapters/cursor";

  beforeEach(async () => {
    await rm(testRoot, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(testRoot, { recursive: true, force: true });
  });

  it("returns a cursor artifact manifest", async () => {
    const skill = await loadSkill("tests/fixtures/using-superpowers");
    const artifact = await buildCursorArtifact({
      skill,
      artifactRoot
    });

    expect(artifact.platform).toBe("cursor");
  });
});
