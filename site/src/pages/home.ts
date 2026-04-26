import type { PublishedSkill } from "../lib/types.js";
import { renderSkillCard } from "../components/skill-card.js";
import { escapeHtml } from "../lib/html.js";

export type HomeFilter = "all" | "trending" | "hot";

type HomePageOptions = {
  workbenchAvailable: boolean;
  query?: string;
  filter?: HomeFilter;
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
    skill.title,
    skill.description,
    skill.bodyExcerpt,
    ...skill.tags,
    ...skill.triggers,
    ...skill.artifacts.map((artifact) => artifact.entryFile),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

function matchesFilter(skill: PublishedSkill, filter: HomeFilter) {
  if (filter === "trending") {
    return skill.triggers.length > 0;
  }

  if (filter === "hot") {
    return skill.artifacts.length > 0;
  }

  return true;
}

export function filterHomeSkills(
  skills: PublishedSkill[],
  options: { query?: string; filter?: HomeFilter } = {},
) {
  const query = options.query ?? "";
  const filter = options.filter ?? "all";
  return skills.filter(
    (skill) => matchesQuery(skill, query) && matchesFilter(skill, filter),
  );
}

function renderHomeFilterButton(args: {
  filter: HomeFilter;
  activeFilter: HomeFilter;
  label: string;
  count: number;
}) {
  const isActive = args.filter === args.activeFilter;

  return `
    <button
      class="${isActive ? "directory-tab-active" : "directory-tab"}"
      data-home-filter="${args.filter}"
      type="button"
      aria-pressed="${isActive ? "true" : "false"}"
    >
      ${args.label} <span>${args.count}</span>
    </button>
  `;
}

export function renderHomePage(
  skills: PublishedSkill[],
  options: HomePageOptions = {
    workbenchAvailable: false,
  },
) {
  const query = options.query ?? "";
  const activeFilter = options.filter ?? "all";
  const filteredSkills = filterHomeSkills(skills, {
    query,
    filter: activeFilter,
  });
  const artifactCount = new Set(
    skills.flatMap((skill) => skill.artifacts.map((artifact) => artifact.entryFile)),
  ).size;
  const triggerCount = skills.reduce(
    (count, skill) => count + skill.triggers.length,
    0,
  );
  const modeLabel = options.workbenchAvailable ? "Archive + local" : "Read only";
  const modeDescription = options.workbenchAvailable
    ? "Browse the published archive, then connect a local repository to enter live workbench mode."
    : "Browse the published archive in read-only mode.";
  const sampleSkillName = skills[0]?.name ?? "<skill-name>";
  const quickInstallCommand = `curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - ${sampleSkillName}`;

  return `
    <section class="command-surface" data-ui="command-deck-home">
      <div class="flex flex-wrap items-center gap-3">
        <p class="signal-chip">Archive grid</p>
        <p class="muted-chip">${modeLabel}</p>
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
          <code class="command-code mt-3"><span class="text-copper">$</span> ${escapeHtml(quickInstallCommand)}</code>
        </div>
        <div class="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <p class="section-kicker">Available for these agents</p>
          <div class="mt-3 flex flex-wrap gap-2">
            ${agentTargets.map((target) => `<span class="muted-chip">${target}</span>`).join("")}
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
      <div class="mt-5 flex flex-wrap gap-2">
        ${renderHomeFilterButton({
          filter: "all",
          activeFilter,
          label: "All Time",
          count: skills.length,
        })}
        ${renderHomeFilterButton({
          filter: "trending",
          activeFilter,
          label: "Trending",
          count: skills.filter((skill) => skill.triggers.length > 0).length,
        })}
        ${renderHomeFilterButton({
          filter: "hot",
          activeFilter,
          label: "Hot",
          count: skills.filter((skill) => skill.artifacts.length > 0).length,
        })}
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
