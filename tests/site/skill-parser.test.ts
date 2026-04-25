import { describe, expect, it } from "vitest";
import { parsePastedSkill } from "../../site/src/lib/skill-parser.js";

describe("parsePastedSkill", () => {
  it("extracts neutral skill data from wrapped skill text", () => {
    const draft = parsePastedSkill(`
<skill>
<name>frontend-design</name>
<path>/some/path/SKILL.md</path>
---
name: frontend-design
description: Create distinctive interfaces.
triggers:
  - user asks to style a page
---
This skill guides creation of distinctive interfaces.
</skill>
`);

    expect(draft.name).toBe("frontend-design");
    expect(draft.body).toContain("This skill guides");
    expect(draft.sourceMeta).toEqual({
      wrapperName: "frontend-design",
      wrapperPath: "/some/path/SKILL.md",
      rawFrontmatter: `name: frontend-design
description: Create distinctive interfaces.
triggers:
  - user asks to style a page`,
    });
  });

  it("rejects legacy platform metadata from pasted skills", () => {
    expect(() =>
      parsePastedSkill(`
<skill>
---
name: frontend-design
description: Create distinctive interfaces.
triggers:
  - user asks to style a page
platforms: []
---
Body
</skill>
`),
    ).toThrow("Skill platform metadata is no longer supported.");
  });

  it("requires at least one trigger before the draft is considered valid", () => {
    expect(() =>
      parsePastedSkill(`
<skill>
---
name: frontend-design
description: Create distinctive interfaces.
---
Body
</skill>
`),
    ).toThrow();
  });

  it("rejects platform overrides because shared skills no longer support them", () => {
    expect(() =>
      parsePastedSkill(`
<skill>
---
name: frontend-design
description: Create distinctive interfaces.
triggers:
  - user asks to style a page
platform_overrides:
  codex:
    notes:
      - Keep this skill visible.
---
Body
</skill>
`),
    ).toThrow();
  });
});
