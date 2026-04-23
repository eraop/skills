import type { PublishedSkill } from "../lib/types.js";
import { escapeHtml } from "../lib/html.js";

export function renderSkillCard(skill: PublishedSkill) {
  const skillName = escapeHtml(skill.name);
  const title = escapeHtml(skill.title);
  const description = escapeHtml(skill.description);

  return `
    <a class="skill-card" href="#/skill/${encodeURIComponent(skill.name)}">
      <p class="skill-card__name">${skillName}</p>
      <h2>${title}</h2>
      <p>${description}</p>
      <ul class="skill-card__platforms">
        ${skill.platforms
          .map((platform) => `<li>${escapeHtml(platform)}</li>`)
          .join("")}
      </ul>
    </a>
  `;
}
