import type { PublishedSkill } from "../lib/types.js";
import { renderSkillCard } from "../components/skill-card.js";
import { escapeHtml } from "../lib/html.js";
import { renderCopyCommandRow } from "../components/copy-command-button.js";
import { getSkillVariants } from "../lib/skill-variants.js";

type HomePageOptions = {
  workbenchAvailable: boolean;
  query?: string;
};

const agentTargets = [
  "Codex",
  "Claude Code",
  "Cursor",
  "GitHub Copilot",
  "Gemini",
  "Windsurf",
];

function matchesQuery(skill: PublishedSkill, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const haystack = [
    skill.name,
    ...getSkillVariants(skill).flatMap((variant) => [
      variant.name,
      variant.title,
      variant.description,
      variant.bodyExcerpt,
      ...variant.tags,
      ...variant.triggers,
      ...variant.artifacts.map((artifact) => artifact.entryFile),
    ]),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

export function filterHomeSkills(
  skills: PublishedSkill[],
  options: { query?: string } = {},
) {
  const query = options.query ?? "";
  return skills.filter((skill) => matchesQuery(skill, query));
}

export function renderHomePage(
  skills: PublishedSkill[],
  options: HomePageOptions = {
    workbenchAvailable: false,
  },
) {
  const query = options.query ?? "";
  const filteredSkills = filterHomeSkills(skills, {
    query,
  });
  const artifactCount = new Set(
    skills.flatMap((skill) =>
      getSkillVariants(skill).flatMap((variant) =>
        variant.artifacts.map((artifact) => artifact.entryFile),
      ),
    ),
  ).size;
  const triggerCount = skills.reduce(
    (count, skill) =>
      count +
      getSkillVariants(skill).reduce(
        (variantCount, variant) => variantCount + variant.triggers.length,
        0,
      ),
    0,
  );
  const modeLabel = options.workbenchAvailable ? "Archive + local" : "Read only";
  const modeDescription = options.workbenchAvailable
    ? "Browse the published archive, then connect a local repository to enter live workbench mode."
    : "Browse the published archive in read-only mode.";
  const quickInstallCommand =
    "curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - <skill-name>";

  return `
    <section class="command-surface" data-ui="command-deck-home">
      <div class="flex flex-wrap items-center gap-3">
        <p class="signal-chip">Archive grid</p>
        <p class="font-mono text-xs font-semibold uppercase text-mist">${modeLabel}</p>
      </div>
      <h1 class="mt-6 max-w-5xl font-display text-5xl font-semibold leading-none text-porcelain sm:text-6xl lg:text-7xl">
        Skills command deck.
      </h1>
      <p class="mt-6 max-w-3xl text-base leading-8 text-mist sm:text-lg">
        ${modeDescription}
      </p>
      <div class="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div class="rounded-lg border border-malachite/20 bg-black/30 p-4">
          <p class="section-kicker">Try it now</p>
          <div class="mt-3">${renderCopyCommandRow(quickInstallCommand)}</div>
        </div>
        <div class="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <p class="section-kicker">Available for these agents</p>
          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-mist">
            ${agentTargets.map((target) => `<span>${target}</span>`).join("")}
          </div>
        </div>
      </div>
      <div class="command-stat-grid">
        <div class="command-stat">
          <strong>${skills.length}</strong>
          <span>Published modules</span>
        </div>
        <div class="command-stat">
          <strong>${triggerCount}</strong>
          <span>Trigger vectors</span>
        </div>
        <div class="command-stat">
          <strong>${artifactCount || 0}</strong>
          <span>Artifact channel</span>
        </div>
      </div>
    </section>
    <section class="command-panel mt-6" data-ui="skills-leaderboard">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="section-kicker">Skills Leaderboard</p>
          <h2 class="mt-2 font-display text-3xl font-semibold leading-tight text-porcelain">Search the archive</h2>
        </div>
        <label class="block w-full lg:max-w-sm">
          <span class="sr-only">Search skills</span>
          <input
            class="directory-search"
            id="skill-search"
            type="search"
            value="${escapeHtml(query)}"
            placeholder="Search skills..."
            autocomplete="off"
          />
        </label>
      </div>
      <div class="mt-5 grid grid-cols-[3rem_minmax(0,1fr)_minmax(7rem,12rem)] gap-3 border-b border-white/10 pb-3 font-mono text-xs uppercase text-mist">
        <span>#</span>
        <span>Skill</span>
        <span>Signals</span>
      </div>
      <div class="mt-3 grid gap-3">
        ${
          filteredSkills.length > 0
            ? filteredSkills
                .map((skill, index) =>
                  renderSkillCard(skill, {
                    rank: index + 1,
                  }),
                )
                .join("")
            : `<div class="rounded-lg border border-white/10 bg-white/[0.035] p-5 text-sm text-mist">No matching skills found.</div>`
        }
      </div>
    </section>
  `;
}
