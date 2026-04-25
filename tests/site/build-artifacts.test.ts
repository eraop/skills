import { describe, expect, it } from "vitest";
import { buildArtifacts } from "../../site/src/lib/build-artifacts.js";

describe("buildArtifacts", () => {
  it("maps a draft to one shared output", () => {
    const outputs = buildArtifacts({
      name: "frontend-design",
      title: "Frontend Design",
      description: "Create distinctive interfaces.",
      version: "0.1.0",
      tags: [],
      triggers: ["user asks to style a page"],
      body: "This skill guides creation of distinctive interfaces.",
      sourceMeta: {
        rawFrontmatter: "name: frontend-design",
      },
    });

    expect(outputs.shared.path).toBe("dist/frontend-design/SKILL.md");
    expect(outputs.shared.contents).toContain("---\nname: frontend-design");
    expect(outputs.shared.contents).toContain("description: Create distinctive interfaces.");
    expect(outputs.shared.contents).toContain("triggers:\n  - user asks to style a page");
    expect(outputs.shared.contents).not.toContain("## 适用场景");
    expect(outputs.shared.contents).toContain("# Frontend Design");
  });
});
