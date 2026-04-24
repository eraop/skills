import { describe, expect, it } from "vitest";
import { parseSkillDocument } from "../../packages/core/src/schema.js";

describe("parseSkillDocument", () => {
  it("accepts a valid neutral skill", () => {
    const parsed = parseSkillDocument({
      name: "code-generation-guardrails",
      title: "Code Generation Guardrails",
      description: "Keep generated code simple, consistent, and narrowly scoped.",
      version: "0.1.0",
      tags: ["workflow"],
      triggers: ["write code"],
      platforms: ["codex", "copilot", "cursor"],
      platform_overrides: {
        codex: {},
        copilot: {},
        cursor: {}
      }
    });

    expect(parsed.name).toBe("code-generation-guardrails");
    expect(parsed.platforms).toEqual(["codex", "copilot", "cursor"]);
    expect(parsed.platform_overrides).toEqual({
      codex: {},
      copilot: {},
      cursor: {}
    });
  });
});
