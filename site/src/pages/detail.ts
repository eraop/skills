import type { PublishedSkill } from "../lib/types.js";
import { renderCopyCommandRow } from "../components/copy-command-button.js";
import { escapeHtml } from "../lib/html.js";
import { renderMarkdown } from "../lib/markdown.js";
import {
  getLanguageLabel,
  getPreferredSkillVariant,
  getSkillVariants,
} from "../lib/skill-variants.js";

const remoteInstallerUrl =
  "https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs";
const repositoryUrl = "https://github.com/eraop/skills";

export function renderDetailPage(
  skill: PublishedSkill,
  options: {
    workbenchAvailable: boolean;
    repoConnected?: boolean;
    selectedLanguage?: string | undefined;
  } = {
    workbenchAvailable: false,
    repoConnected: false,
  },
) {
  const variants = getSkillVariants(skill);
  const selectedVariant = getPreferredSkillVariant(skill, options.selectedLanguage);
  const rawName = selectedVariant.name;
  const routeName = escapeHtml(skill.name);
  const name = escapeHtml(rawName);
  const title = escapeHtml(selectedVariant.title);
  const description = escapeHtml(selectedVariant.description);
  const version = escapeHtml(selectedVariant.version);
  const bodyExcerpt = selectedVariant.bodyExcerpt || selectedVariant.description;
  const triggerSummary = selectedVariant.triggers.slice(0, 3);
  const triggers =
    selectedVariant.triggers.length > 0
      ? selectedVariant.triggers
          .map(
            (trigger) =>
              `<li class="info-chip">${escapeHtml(trigger)}</li>`,
          )
          .join("")
      : `<li class="font-mono text-xs text-mist">-</li>`;
  const globalInstallCommand = `curl -fsSL ${remoteInstallerUrl} | node - ${rawName} --scope global`;
  const projectInstallCommand = `curl -fsSL ${remoteInstallerUrl} | node - ${rawName} --scope project`;
  const languageSwitcher =
    variants.length > 1
      ? `
        <section class="command-panel language-panel" data-ui="language-switcher">
          <p class="section-kicker">Language</p>
          <div class="mt-4 grid gap-2" aria-label="Language versions">
          ${variants
            .map((variant) => {
              const isActive = variant.language === selectedVariant.language;
              const href = `#/skill/${encodeURIComponent(skill.name)}/${encodeURIComponent(variant.language)}`;
              return `
                <a
                  class="${isActive ? "language-option-active" : "language-option"}"
                  href="${href}"
                  aria-pressed="${isActive ? "true" : "false"}"
                >
                  ${escapeHtml(getLanguageLabel(variant.language))}
                </a>
              `;
            })
            .join("")}
          </div>
        </section>
      `
      : "";
  const showWorkbenchActions = options.repoConnected === true;
  const detailMessage = showWorkbenchActions
    ? "This local view can rebuild or delete the connected skill."
    : options.workbenchAvailable
      ? "This published view stays read-only until a local repository is connected."
      : "This published view is read-only.";
  const actions = showWorkbenchActions
    ? `
      <section class="command-panel danger-panel mt-8">
        <p class="section-kicker text-copper">Local mutation controls</p>
        <div class="mt-4 flex flex-wrap gap-3">
          <button class="command-button-primary" id="rebuild-skill" data-skill="${routeName}" type="button">Rebuild</button>
          <button class="command-button-danger" id="delete-skill" data-skill="${routeName}" type="button">Delete</button>
        </div>
        <p class="mt-4 text-sm leading-6 text-mist">
          Delete removes skills/${routeName} and all generated dist artifacts for this skill.
        </p>
      </section>
    `
    : "";

  return `
    <article class="pb-16" data-ui="skill-detail-command">
      <nav class="flex flex-wrap items-center gap-2 font-mono text-sm text-mist" aria-label="Breadcrumb">
        <a class="console-link min-h-0" href="#/">skills</a>
        <span>/</span>
        <span class="text-porcelain">${routeName}</span>
      </nav>
      <div class="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div class="min-w-0">
          <header class="command-surface">
            <p class="section-kicker">${name}</p>
            <h1 class="mt-4 max-w-3xl font-display text-5xl font-semibold leading-none text-porcelain sm:text-6xl">${title}</h1>
            <p class="mt-6 max-w-2xl text-lg leading-8 text-mist">${description}</p>
            <p class="mt-5 max-w-2xl text-sm leading-6 text-mist">${detailMessage}</p>
          </header>
          <section class="command-panel mt-6">
            <p class="section-kicker">Installation</p>
            <h2 class="mt-2 font-display text-3xl font-semibold leading-tight text-porcelain">Install vector</h2>
            <div class="mt-4 grid gap-3">
              <div>
                <p class="command-label">Global</p>
                <div class="mt-2">${renderCopyCommandRow(globalInstallCommand)}</div>
              </div>
              <div>
                <p class="command-label">Project</p>
                <div class="mt-2">${renderCopyCommandRow(projectInstallCommand)}</div>
              </div>
            </div>
          </section>
          <section class="command-panel mt-6">
            <p class="section-kicker">Summary</p>
            <div class="mt-4 grid gap-3 text-sm leading-6 text-mist">
              <div class="summary-line summary-markdown">${renderMarkdown(bodyExcerpt)}</div>
              ${
                triggerSummary.length > 0
                  ? triggerSummary
                      .map(
                        (trigger) =>
                          `<p class="summary-line">Activates when users need: ${escapeHtml(trigger)}</p>`,
                      )
                      .join("")
                  : `<p class="summary-line">No trigger vectors are declared for this skill yet.</p>`
              }
            </div>
          </section>
          ${actions}
          <section class="skill-content">
            <p class="section-kicker">SKILL.md</p>
            ${renderMarkdown(selectedVariant.body)}
          </section>
        </div>
        <aside class="grid gap-4">
          ${languageSwitcher}
          <section class="command-panel">
            <p class="section-kicker">Archive stats</p>
            <div class="mt-4 grid gap-3">
              <p class="metadata-cell"><strong>Version</strong> ${version}</p>
              <p class="metadata-cell"><strong>Language</strong> ${escapeHtml(getLanguageLabel(selectedVariant.language))}</p>
              <p class="metadata-cell"><strong>Artifact</strong> ${escapeHtml(selectedVariant.artifacts[0]?.entryFile ?? "SKILL.md")}</p>
              <p class="metadata-cell"><strong>Triggers</strong> ${selectedVariant.triggers.length}</p>
            </div>
          </section>
          <section class="command-panel">
            <p class="section-kicker">Repository</p>
            <a class="mt-3 inline-flex break-all text-sm text-malachite underline decoration-malachite/40 underline-offset-4 hover:text-porcelain focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-malachite" href="${repositoryUrl}" target="_blank" rel="noreferrer">eraop/skills</a>
          </section>
          <section class="command-panel">
            <p class="section-kicker">Security checks</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <span class="signal-chip">Schema Pass</span>
              <span class="signal-chip">Markdown Sanitized</span>
              <span class="info-chip">Local writes gated</span>
            </div>
          </section>
          <section class="command-panel">
            <p class="section-kicker">Triggers</p>
            <ul class="mt-3 flex flex-wrap gap-2">${triggers}</ul>
          </section>
        </aside>
      </div>
    </article>
  `;
}
