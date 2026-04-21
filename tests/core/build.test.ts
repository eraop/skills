import { rm } from "node:fs/promises";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { buildCodexArtifact } from "../../packages/adapter-codex/src/index.ts";
import { buildCopilotArtifact } from "../../packages/adapter-copilot/src/index.ts";
import { buildCursorArtifact } from "../../packages/adapter-cursor/src/index.ts";
import { buildSkill } from "../../packages/core/src/build-skill.ts";

describe("buildSkill", () => {
  const outputRoot = ".tmp/tests/core/build";
  const builders = {
    codex: buildCodexArtifact,
    copilot: buildCopilotArtifact,
    cursor: buildCursorArtifact
  };

  beforeEach(async () => {
    await rm(outputRoot, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(outputRoot, { recursive: true, force: true });
  });

  it("builds enabled platform artifacts", async () => {
    const artifactMap = await buildSkill({
      skillRoot: "tests/fixtures/using-superpowers",
      outputRoot,
      builders
    });

    expect(Object.keys(artifactMap)).toEqual(["codex", "copilot", "cursor"]);
  });

  it("throws when a required platform builder is missing", async () => {
    await expect(
      buildSkill({
        skillRoot: "tests/fixtures/using-superpowers",
        outputRoot,
        builders: {
          codex: buildCodexArtifact,
          copilot: buildCopilotArtifact
        }
      })
    ).rejects.toThrow('Missing builder for platform "cursor"');
  });
});
