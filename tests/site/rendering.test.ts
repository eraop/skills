import { describe, expect, it } from "vitest";
import { renderArchiveShell } from "../../site/src/components/archive-shell.js";
import { renderSkillCard } from "../../site/src/components/skill-card.js";
import { renderWorkbenchPanel } from "../../site/src/components/workbench-panel.js";
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
  it("renders a GitHub repository link in the archive shell", () => {
    const html = renderArchiveShell("<section>Archive</section>");

    expect(html).toContain("https://github.com/eraop/skills");
    expect(html).toContain('aria-label="Open GitHub repository"');
    expect(html).toContain("<svg");
  });

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

  it("shows local rebuild and delete actions only when a live repo is connected", () => {
    const connectedHtml = renderDetailPage(makeSkill(), {
      workbenchAvailable: true,
      repoConnected: true,
    });
    const readOnlyHtml = renderDetailPage(makeSkill(), {
      workbenchAvailable: true,
      repoConnected: false,
    });

    expect(connectedHtml).toContain('id="rebuild-skill"');
    expect(connectedHtml).toContain('id="delete-skill"');
    expect(connectedHtml).toContain(
      "This local view can rebuild or delete the connected skill.",
    );
    expect(connectedHtml).toContain(
      "Delete removes skills/using-superpowers and all generated dist artifacts for this skill.",
    );
    expect(readOnlyHtml).not.toContain('id="rebuild-skill"');
    expect(readOnlyHtml).not.toContain('id="delete-skill"');
  });

  it("escapes repository labels in the workbench panel", () => {
    const connectedHtml = renderWorkbenchPanel({
      enabled: true,
      repoLabel: `<img src=x onerror="alert('repo')">`,
    });
    const rememberedHtml = renderWorkbenchPanel({
      enabled: false,
      rememberedRepoLabel: `<script>alert("saved")</script>`,
    });

    expect(connectedHtml).not.toContain("<img");
    expect(connectedHtml).toContain(
      "&lt;img src=x onerror=&quot;alert(&#39;repo&#39;)&quot;&gt;",
    );
    expect(rememberedHtml).not.toContain("<script>");
    expect(rememberedHtml).toContain(
      "&lt;script&gt;alert(&quot;saved&quot;)&lt;/script&gt;",
    );
  });
});
