import { describe, expect, it } from "vitest";
import { buildArtifacts } from "../../site/src/lib/build-artifacts.js";

describe("buildArtifacts", () => {
  it("maps a draft to codex, copilot, and cursor outputs", () => {
    const outputs = buildArtifacts({
      name: "frontend-design",
      title: "Frontend Design",
      description: "Create distinctive interfaces.",
      version: "0.1.0",
      tags: [],
      triggers: [],
      platforms: ["codex", "copilot", "cursor"],
      body: "This skill guides creation of distinctive interfaces.",
    });

    expect(outputs.codex.path).toBe("dist/codex/frontend-design/SKILL.md");
    expect(outputs.copilot.path).toBe("dist/copilot/frontend-design/README.md");
    expect(outputs.cursor.contents).toContain("# Frontend Design");
  });
});
