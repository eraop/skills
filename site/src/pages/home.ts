import type { PublishedSkill } from "../lib/types.js";
import { renderSkillCard } from "../components/skill-card.js";

export function renderHomePage(skills: PublishedSkill[]) {
  return `
    <section class="hero">
      <p class="eyebrow">Archive</p>
      <h1>Skills, arranged as a living manual.</h1>
    </section>
    <section class="card-grid">
      ${skills.map(renderSkillCard).join("")}
    </section>
  `;
}
