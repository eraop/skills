import type { PublishedSkill } from "../lib/types.js";

export function renderSkillCard(skill: PublishedSkill) {
  return `
    <a class="skill-card" href="#/skill/${skill.name}">
      <p class="skill-card__name">${skill.name}</p>
      <h2>${skill.title}</h2>
      <p>${skill.description}</p>
      <ul class="skill-card__platforms">
        ${skill.platforms.map((platform) => `<li>${platform}</li>`).join("")}
      </ul>
    </a>
  `;
}
