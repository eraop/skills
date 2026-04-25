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
`,
      body: "# Code Generation Guardrails\n\nKeep changes narrow and consistent.\n",
    });

    expect(record.name).toBe("code-generation-guardrails");
    expect(record.description).toBe("Keep generated code simple, consistent, and narrowly scoped.");
    expect(record.triggers).toEqual(["user asks to start a task"]);
    expect(record.body).toBe("# Code Generation Guardrails\n\nKeep changes narrow and consistent.\n");
    expect(record.body).not.toContain("---\nname: code-generation-guardrails");
    expect(record.body).not.toContain("triggers:\n  - user asks to start a task");
    expect(record.body).not.toContain("## 适用场景");
    expect(record.artifacts).toEqual([{ entryFile: "SKILL.md" }]);
    expect(record.bodyExcerpt).toContain("Keep changes narrow and consistent.");
  });
});
