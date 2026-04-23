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
platforms:
  - codex
  - copilot
  - cursor
platform_overrides:
  codex:
    notes:
      - Keep this skill visible.
---
This skill guides creation of distinctive interfaces.
</skill>
`);

    expect(draft.name).toBe("frontend-design");
    expect(draft.platforms).toEqual(["codex", "copilot", "cursor"]);
    expect(draft.body).toContain("This skill guides");
    expect(draft.sourceMeta).toEqual({
      wrapperName: "frontend-design",
      wrapperPath: "/some/path/SKILL.md",
      rawFrontmatter: `name: frontend-design
description: Create distinctive interfaces.
triggers:
  - user asks to style a page
platforms:
  - codex
  - copilot
  - cursor
platform_overrides:
  codex:
    notes:
      - Keep this skill visible.`,
    });
    expect(draft.platformOverrides).toEqual({
      codex: {
        notes: ["Keep this skill visible."],
      },
    });
  });

  it("rejects an explicitly empty platform list", () => {
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
    ).toThrow();
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

  it("preserves validated platform overrides on the parsed draft", () => {
    const draft = parsePastedSkill(`
<skill>
---
name: frontend-design
description: Create distinctive interfaces.
triggers:
  - user asks to style a page
platforms:
  - codex
platform_overrides:
  codex:
    notes:
      - Keep this skill visible.
---
Body
</skill>
`);

    expect(draft.platformOverrides).toEqual({
      codex: {
        notes: ["Keep this skill visible."],
      },
    });
  });
});
