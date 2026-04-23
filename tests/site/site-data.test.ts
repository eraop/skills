import { describe, expect, it } from "vitest";
import { parseArchiveSkill } from "../../site/src/lib/site-data.js";

describe("parseArchiveSkill", () => {
  it("extracts a published archive record from neutral skill files", () => {
    const record = parseArchiveSkill({
      documentSource: `
name: using-superpowers
title: Using Superpowers
description: Use when starting any conversation.
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
      body: "# Using Superpowers\n\nInvoke relevant skills first.\n",
    });

    expect(record.name).toBe("using-superpowers");
    expect(record.platforms).toEqual(["codex", "copilot", "cursor"]);
    expect(record.artifacts).toEqual([
      { platform: "codex", entryFile: "SKILL.md" },
      { platform: "copilot", entryFile: "README.md" },
      { platform: "cursor", entryFile: "SKILL.md" },
    ]);
    expect(record.bodyExcerpt).toContain("Invoke relevant skills first.");
    expect(record.platformOverrides).toEqual({
      codex: {
        notes: ["Keep this skill visible."],
      },
    });
  });
});
