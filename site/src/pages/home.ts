import type { PublishedSkill } from "../lib/types.js";
import { renderSkillCard } from "../components/skill-card.js";
import { renderSkillEditor } from "../components/skill-editor.js";

export function renderHomePage(
  skills: PublishedSkill[],
  options: { workbenchAvailable: boolean; editorOpen?: boolean } = {
    workbenchAvailable: false,
  },
) {
  return `
    <section class="hero">
      <p class="eyebrow">Archive</p>
      <h1>Skills, arranged as a living manual.</h1>
      <p class="lede">
        ${
          options.workbenchAvailable
            ? "Browse the published archive, or connect a local repository to enter workbench mode."
            : "Browse the published archive in read-only mode."
        }
      </p>
    </section>
    ${options.editorOpen ? renderSkillEditor() : ""}
    <section class="card-grid">
      ${skills.map(renderSkillCard).join("")}
    </section>
  `;
}
