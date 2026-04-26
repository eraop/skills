import { describe, expect, it } from "vitest";
import { renderArchiveShell } from "../../site/src/components/archive-shell.js";
import { renderSkillCard } from "../../site/src/components/skill-card.js";
import { renderWorkbenchPanel } from "../../site/src/components/workbench-panel.js";
import { renderDetailPage } from "../../site/src/pages/detail.js";
import { renderEditPage } from "../../site/src/pages/edit.js";
import { renderHomePage } from "../../site/src/pages/home.js";
import type { PublishedSkill } from "../../site/src/lib/types.js";

function makeSkill(overrides: Partial<PublishedSkill> = {}): PublishedSkill {
  return {
    name: "code-generation-guardrails",
    title: "Code Generation Guardrails",
    description: "Keep generated code simple, consistent, and narrowly scoped.",
    version: "1.0.0",
    tags: [],
    triggers: [],
    body: "# Hello\n\nSafe body.",
    bodyExcerpt: "Safe body.",
    artifacts: [{ entryFile: "SKILL.md" }],
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

  it("only reserves sidebar layout space when sidebar content exists", () => {
    const singleColumnHtml = renderArchiveShell("<section>Archive</section>");
    const withSidebarHtml = renderArchiveShell(
      "<section>Archive</section>",
      "<aside>Workbench</aside>",
    );

    expect(singleColumnHtml).toContain("command-layout-single");
    expect(singleColumnHtml).not.toContain("command-layout-with-sidebar");
    expect(withSidebarHtml).toContain("command-layout-with-sidebar");
    expect(withSidebarHtml).not.toContain("command-layout-single");
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

  it("renders triggers from skill metadata on detail pages", () => {
    const html = renderDetailPage(
      makeSkill({
        triggers: [
          "write code",
          `<img src=x onerror="alert('trigger')">`,
        ],
      }),
    );

    expect(html).toContain("Triggers");
    expect(html).toContain("write code");
    expect(html).not.toContain("<img");
    expect(html).toContain(
      "&lt;img src=x onerror=&quot;alert(&#39;trigger&#39;)&quot;&gt;",
    );
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
      "Delete removes skills/code-generation-guardrails and all generated dist artifacts for this skill.",
    );
    expect(readOnlyHtml).not.toContain('id="rebuild-skill"');
    expect(readOnlyHtml).not.toContain('id="delete-skill"');
  });

  it("renders one install command on detail pages", () => {
    const html = renderDetailPage(makeSkill());

    expect(html).toContain("Install");
    expect(html).not.toContain("npm exec -- skills");
    expect(html).not.toContain("node packages/cli/dist/index.js install");
    expect(html).toContain(
      "curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails",
    );
    expect(html).not.toContain("--target");
    expect(html).not.toContain("--platform");
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

  it("links local workbench creation to a dedicated edit page", () => {
    const html = renderWorkbenchPanel({
      enabled: true,
      repoLabel: "skills",
    });

    expect(html).toContain('href="#/edit"');
    expect(html).not.toContain('id="add-skill"');
  });

  it("renders command deck visual contracts across archive surfaces", () => {
    const skill = makeSkill({
      triggers: ["write code", "refactor"],
    });

    expect(renderArchiveShell(renderHomePage([skill]))).toContain(
      'data-ui="command-deck-shell"',
    );
    expect(renderHomePage([skill])).toContain('data-ui="command-deck-home"');
    expect(renderSkillCard(skill)).toContain('data-ui="skill-module-card"');
    expect(renderSkillCard(skill)).toContain("Trigger vectors");
    expect(renderDetailPage(skill)).toContain('data-ui="skill-detail-command"');
    expect(renderDetailPage(skill)).toContain("Install vector");
    expect(renderWorkbenchPanel({ enabled: true, repoLabel: "skills" })).toContain(
      'data-ui="workbench-command-panel"',
    );
    expect(renderEditPage({ repoConnected: true })).toContain(
      'data-ui="skill-editor-command"',
    );
  });

  it("renders skills.sh-inspired home directory controls", () => {
    const html = renderHomePage([
      makeSkill({
        triggers: ["write code"],
      }),
    ]);

    expect(html).toContain("Try it now");
    expect(html).toContain("Available for these agents");
    expect(html).toContain('id="skill-search"');
    expect(html).toContain('data-home-filter="all"');
    expect(html).toContain("All Time");
    expect(html).toContain("Trending");
    expect(html).toContain("Hot");
    expect(html).toContain("Skills Leaderboard");
    expect(html).toContain("#");
    expect(html).toContain("Skill");
    expect(html).toContain("Signals");
  });

  it("renders skills.sh-inspired detail sections and side rail", () => {
    const html = renderDetailPage(
      makeSkill({
        triggers: ["write code", "refactor"],
      }),
    );

    expect(html).toContain("skills</a>");
    expect(html).toContain("Installation");
    expect(html).toContain("Summary");
    expect(html).toContain("SKILL.md");
    expect(html).toContain("Repository");
    expect(html).toContain("Security checks");
    expect(html).toContain("Schema Pass");
    expect(html).toContain("Markdown Sanitized");
  });
});
