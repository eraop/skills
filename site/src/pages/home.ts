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
    <section class="border-b border-white/10 pb-10 sm:pb-12">
      <div class="flex flex-wrap items-center gap-3">
        <p class="inline-flex h-8 items-center border border-copper/40 bg-copper/15 px-3 font-mono text-xs font-semibold text-copper">
          Archive
        </p>
        <p class="text-sm text-mist">${skills.length} published skills</p>
      </div>
      <h1 class="mt-6 max-w-5xl font-display text-5xl leading-none text-porcelain sm:text-6xl lg:text-7xl">
        Skills, arranged as a living manual.
      </h1>
      <p class="mt-6 max-w-2xl text-base leading-8 text-mist sm:text-lg">
        ${
          options.workbenchAvailable
            ? "Browse the published archive, or connect a local repository to enter workbench mode."
            : "Browse the published archive in read-only mode."
        }
      </p>
    </section>
    ${options.editorOpen ? renderSkillEditor() : ""}
    <section class="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-3">
      ${skills.map(renderSkillCard).join("")}
    </section>
  `;
}
