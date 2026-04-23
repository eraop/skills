import { describe, expect, it } from "vitest";
import { renderSkillCard } from "../../site/src/components/skill-card.js";
import { renderDetailPage } from "../../site/src/pages/detail.js";
import type { PublishedSkill } from "../../site/src/lib/types.js";

function makeSkill(overrides: Partial<PublishedSkill> = {}): PublishedSkill {
  return {
    name: "using-superpowers",
    title: "Using Superpowers",
    description: "Use when starting any conversation.",
    version: "1.0.0",
    tags: [],
    triggers: [],
    platforms: ["codex"],
    body: "# Hello\n\nSafe body.",
    bodyExcerpt: "Safe body.",
    artifacts: [{ platform: "codex", entryFile: "SKILL.md" }],
    ...overrides,
  };
}

describe("site rendering", () => {
  it("escapes plain-text metadata in skill cards", () => {
    const html = renderSkillCard(
      makeSkill({
        name: `name"><img src=x onerror="alert('name')">`,
        title: `<script>alert("title")</script>`,
        description: `<img src=x onerror="alert('description')">`,
      }),
    );

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;alert(&quot;title&quot;)&lt;/script&gt;");
  });

  it("sanitizes markdown html and escapes detail metadata", () => {
    const html = renderDetailPage(
      makeSkill({
        name: `<img src=x onerror="alert('name')">`,
        title: `<b onclick="alert('title')">Bold</b>`,
        description: `<script>alert("description")</script>`,
        version: `1.0.0"><img src=x onerror="alert('version')">`,
        body: `# Heading\n\n<script>alert("body")</script>\n\nParagraph with <em>allowed</em> html.`,
      }),
    );

    expect(html).not.toContain("<script>");
    expect(html).not.toContain('<img src=x onerror=');
    expect(html).not.toContain('<b onclick=');
    expect(html).toContain("&lt;b onclick=&quot;alert(&#39;title&#39;)&quot;&gt;Bold&lt;/b&gt;");
    expect(html).toContain("<em>allowed</em>");
  });
});
