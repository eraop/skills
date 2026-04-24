import { describe, expect, it } from "vitest";
import { parseArchiveSkill } from "../../site/src/lib/site-data.js";

describe("parseArchiveSkill", () => {
  it("extracts a published archive record from neutral skill files", () => {
    const record = parseArchiveSkill({
      documentSource: `
name: code-generation-guardrails
title: Code Generation Guardrails
description: Keep generated code simple, consistent, and narrowly scoped.
version: 0.1.0
tags:
  - workflow
triggers:
  - user asks to start a task
platforms:
  - codex
  - copilot
  - cursor
platform_overrides:
  codex:
    notes:
      - Keep this skill visible.
`,
      body: "# Code Generation Guardrails\n\nKeep changes narrow and consistent.\n",
    });

    expect(record.name).toBe("code-generation-guardrails");
    expect(record.platforms).toEqual(["codex", "copilot", "cursor"]);
    expect(record.artifacts).toEqual([
      { platform: "codex", entryFile: "SKILL.md" },
      { platform: "copilot", entryFile: "SKILL.md" },
      { platform: "cursor", entryFile: "SKILL.md" },
    ]);
    expect(record.bodyExcerpt).toContain("Keep changes narrow and consistent.");
    expect(record.platformOverrides).toEqual({
      codex: {
        notes: ["Keep this skill visible."],
      },
    });
  });
});
