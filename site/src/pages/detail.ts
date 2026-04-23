import type { PublishedSkill } from "../lib/types.js";
import { escapeHtml } from "../lib/html.js";
import { renderMarkdown } from "../lib/markdown.js";

export function renderDetailPage(skill: PublishedSkill) {
  const name = escapeHtml(skill.name);
  const title = escapeHtml(skill.title);
  const description = escapeHtml(skill.description);
  const version = escapeHtml(skill.version);
  const platforms = skill.platforms.map(escapeHtml).join(", ");

  return `
    <article class="detail">
      <p class="eyebrow">${name}</p>
      <h1>${title}</h1>
      <p class="lede">${description}</p>
      <section class="detail__meta">
        <p><strong>Version</strong> ${version}</p>
        <p><strong>Platforms</strong> ${platforms}</p>
      </section>
      <section class="detail__body">${renderMarkdown(skill.body)}</section>
    </article>
  `;
}
