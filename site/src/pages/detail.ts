import type { PublishedSkill } from "../lib/types.js";
import { renderMarkdown } from "../lib/markdown.js";

export function renderDetailPage(skill: PublishedSkill) {
  return `
    <article class="detail">
      <p class="eyebrow">${skill.name}</p>
      <h1>${skill.title}</h1>
      <p class="lede">${skill.description}</p>
      <section class="detail__meta">
        <p><strong>Version</strong> ${skill.version}</p>
        <p><strong>Platforms</strong> ${skill.platforms.join(", ")}</p>
      </section>
      <section class="detail__body">${renderMarkdown(skill.body)}</section>
    </article>
  `;
}
