import type { PublishedSkill } from "../lib/types.js";
import { escapeHtml } from "../lib/html.js";
import { renderMarkdown } from "../lib/markdown.js";

export function renderDetailPage(
  skill: PublishedSkill,
  options: { workbenchAvailable: boolean; repoConnected?: boolean } = {
    workbenchAvailable: false,
    repoConnected: false,
  },
) {
  const name = escapeHtml(skill.name);
  const title = escapeHtml(skill.title);
  const description = escapeHtml(skill.description);
  const version = escapeHtml(skill.version);
  const platforms = skill.platforms.map(escapeHtml).join(", ");
  const showWorkbenchActions = options.repoConnected === true;
  const detailMessage = showWorkbenchActions
    ? "This local view can rebuild or delete the connected skill."
    : options.workbenchAvailable
      ? "This published view stays read-only until a local repository is connected."
      : "This published view is read-only.";
  const actions = showWorkbenchActions
    ? `
      <section class="detail__actions">
        <button id="rebuild-skill" data-skill="${name}" type="button">Rebuild</button>
        <button id="delete-skill" data-skill="${name}" type="button">Delete</button>
        <p class="detail__warning">
          Delete removes skills/${name} and all generated dist artifacts for this skill.
        </p>
      </section>
    `
    : "";

  return `
    <article class="detail">
      <p class="eyebrow">${name}</p>
      <h1>${title}</h1>
      <p class="lede">${description}</p>
      <p>${detailMessage}</p>
      <section class="detail__meta">
        <p><strong>Version</strong> ${version}</p>
        <p><strong>Platforms</strong> ${platforms}</p>
      </section>
      ${actions}
      <section class="detail__body">${renderMarkdown(skill.body)}</section>
    </article>
  `;
}
