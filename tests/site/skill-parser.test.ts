import { describe, expect, it } from "vitest";
import { parsePastedSkill } from "../../site/src/lib/skill-parser.js";

describe("parsePastedSkill", () => {
  it("extracts neutral skill data from wrapped skill text", () => {
    const draft = parsePastedSkill(`
<skill>
<name>frontend-design</name>
---
name: frontend-design
description: Create distinctive interfaces.
platforms:
  - codex
  - copilot
  - cursor
---
This skill guides creation of distinctive interfaces.
</skill>
`);

    expect(draft.name).toBe("frontend-design");
    expect(draft.platforms).toEqual(["codex", "copilot", "cursor"]);
    expect(draft.body).toContain("This skill guides");
  });
});
