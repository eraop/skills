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
    <section class="relative overflow-hidden rounded-lg border border-brass/20 bg-onyx/70 p-6 pb-10 shadow-2xl shadow-brass/10 backdrop-blur sm:p-8 sm:pb-12">
      <span class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-malachite to-transparent"></span>
      <div class="flex flex-wrap items-center gap-3">
        <p class="inline-flex h-8 items-center border border-malachite/30 bg-malachite/10 px-3 font-mono text-xs font-semibold text-malachite">
          Archive
        </p>
        <p class="font-mono text-sm text-mist">${skills.length} published skills</p>
      </div>
      <h1 class="mt-6 max-w-5xl font-display text-5xl font-semibold leading-none text-porcelain sm:text-6xl lg:text-7xl">
        Skills command deck.
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
