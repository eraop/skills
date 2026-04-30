import type { PublishedSkill } from "../lib/types.js";
import { escapeHtml } from "../lib/html.js";
import { getPreferredSkillVariant } from "../lib/skill-variants.js";

export function renderSkillCard(
  skill: PublishedSkill,
  options: { rank?: number } = {},
) {
  const skillName = escapeHtml(skill.name);
  const primaryVariant = getPreferredSkillVariant(skill);
  const title = escapeHtml(primaryVariant.title);
  const description = escapeHtml(primaryVariant.description);
  const triggerPreview =
    primaryVariant.triggers.length > 0
      ? escapeHtml(primaryVariant.triggers[0] ?? "No trigger vectors")
      : "No trigger vectors";

  return `
    <a
      class="module-card group grid gap-4 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(7rem,12rem)] sm:items-center"
      data-ui="skill-module-card"
      href="#/skill/${encodeURIComponent(skill.name)}"
    >
      <span class="pointer-events-none absolute bottom-0 right-0 h-20 w-20 border-b border-r border-malachite/20"></span>
      <p class="font-mono text-sm font-semibold text-mist">${options.rank ? String(options.rank).padStart(2, "0") : ">"}</p>
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-3">
          <p class="section-kicker">${skillName}</p>
        </div>
        <h2 class="mt-3 font-display text-2xl font-semibold leading-tight text-porcelain">${title}</h2>
        <p class="mt-2 text-sm leading-6 text-mist">${description}</p>
      </div>
      <div class="rounded-lg border border-white/10 bg-white/[0.035] p-3">
        <p class="font-mono text-[0.68rem] font-semibold uppercase text-mist">Trigger vectors</p>
        <p class="mt-1 text-sm text-porcelain">${triggerPreview}</p>
      </div>
    </a>
  `;
}
