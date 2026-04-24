import type { PublishedSkill } from "../lib/types.js";
import { escapeHtml } from "../lib/html.js";

export function renderSkillCard(skill: PublishedSkill) {
  const skillName = escapeHtml(skill.name);
  const title = escapeHtml(skill.title);
  const description = escapeHtml(skill.description);

  return `
    <a
      class="group relative block h-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] p-5 text-porcelain shadow-2xl shadow-black/15 backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-brass/50 hover:bg-white/[0.085] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
      href="#/skill/${encodeURIComponent(skill.name)}"
    >
      <span class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/70 to-transparent opacity-60"></span>
      <p class="font-mono text-xs font-semibold text-copper">${skillName}</p>
      <h2 class="mt-3 font-display text-2xl leading-tight text-porcelain">${title}</h2>
      <p class="mt-3 text-sm leading-6 text-mist">${description}</p>
      <ul class="mt-5 flex flex-wrap gap-2">
        ${skill.platforms
          .map(
            (platform) =>
              `<li class="border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-xs text-mist">${escapeHtml(platform)}</li>`,
          )
          .join("")}
      </ul>
    </a>
  `;
}
