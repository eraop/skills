import { describe, expect, it } from "vitest";
import { parseSkillDocument } from "../../packages/core/src/schema.js";

describe("parseSkillDocument", () => {
  it("accepts a valid neutral skill", () => {
    const parsed = parseSkillDocument({
      name: "using-superpowers",
      title: "Using Superpowers",
      description: "Use when starting any conversation.",
      version: "0.1.0",
      tags: ["workflow"],
      triggers: ["user asks to start a task"],
      platforms: ["codex", "copilot", "cursor"],
      platform_overrides: {
        codex: {},
        copilot: {},
        cursor: {}
      }
    });

    expect(parsed.name).toBe("using-superpowers");
    expect(parsed.platforms).toEqual(["codex", "copilot", "cursor"]);
    expect(parsed.platform_overrides).toEqual({
      codex: {},
      copilot: {},
      cursor: {}
    });
  });
});
