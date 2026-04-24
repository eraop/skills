import type { PublishedSkill } from "../lib/types.js";
import { escapeHtml } from "../lib/html.js";
import { renderMarkdown } from "../lib/markdown.js";

export function renderDetailPage(
  skill: PublishedSkill,
  options: { workbenchAvailable: boolean; repoConnected?: boolean } = {
    workbenchAvailable: false,
    repoConnected: false,
  },
) {
  const name = escapeHtml(skill.name);
  const title = escapeHtml(skill.title);
  const description = escapeHtml(skill.description);
  const version = escapeHtml(skill.version);
  const platforms = skill.platforms.map(escapeHtml).join(", ");
  const installAllCommand = `npm exec -- skills install ${name}`;
  const installCommands = skill.platforms
    .map((platform) => {
      const escapedPlatform = escapeHtml(platform);
      return `
        <li class="border border-white/10 bg-black/20 p-3">
          <span class="block font-mono text-xs font-semibold uppercase tracking-normal text-copper">${escapedPlatform}</span>
          <code class="mt-2 block overflow-x-auto whitespace-nowrap font-mono text-sm text-porcelain">${installAllCommand} --target ${escapedPlatform}</code>
        </li>
      `;
    })
    .join("");
  const showWorkbenchActions = options.repoConnected === true;
  const detailMessage = showWorkbenchActions
    ? "This local view can rebuild or delete the connected skill."
    : options.workbenchAvailable
      ? "This published view stays read-only until a local repository is connected."
      : "This published view is read-only.";
  const actions = showWorkbenchActions
    ? `
      <section class="mt-8 rounded-lg border border-copper/30 bg-copper/10 p-5 shadow-2xl shadow-black/15">
        <div class="flex flex-wrap gap-3">
          <button class="inline-flex h-10 items-center justify-center border border-brass/50 bg-brass px-4 text-sm font-semibold text-ink transition hover:bg-porcelain focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass" id="rebuild-skill" data-skill="${name}" type="button">Rebuild</button>
          <button class="inline-flex h-10 items-center justify-center border border-copper/60 bg-copper/25 px-4 text-sm font-semibold text-porcelain transition hover:bg-copper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper" id="delete-skill" data-skill="${name}" type="button">Delete</button>
        </div>
        <p class="mt-4 text-sm leading-6 text-mist">
          Delete removes skills/${name} and all generated dist artifacts for this skill.
        </p>
      </section>
    `
    : "";

  return `
    <article class="max-w-4xl pb-16">
      <a class="inline-flex items-center text-sm text-mist transition hover:text-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass" href="#/">Back to archive</a>
      <p class="mt-8 font-mono text-xs font-semibold text-copper">${name}</p>
      <h1 class="mt-4 max-w-3xl font-display text-5xl leading-none text-porcelain sm:text-6xl">${title}</h1>
      <p class="mt-6 max-w-2xl text-lg leading-8 text-mist">${description}</p>
      <p class="mt-5 max-w-2xl text-sm leading-6 text-mist">${detailMessage}</p>
      <section class="mt-8 grid grid-cols-1 gap-4 border-y border-white/10 py-5 sm:grid-cols-2">
        <p class="text-sm text-mist"><strong class="block font-mono text-xs text-porcelain">Version</strong> ${version}</p>
        <p class="text-sm text-mist"><strong class="block font-mono text-xs text-porcelain">Platforms</strong> ${platforms}</p>
      </section>
      <section class="mt-8 border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/15">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="font-mono text-xs font-semibold text-copper">Install</p>
            <h2 class="mt-2 font-display text-3xl leading-tight text-porcelain">Install this skill</h2>
          </div>
          <code class="block overflow-x-auto whitespace-nowrap border border-brass/30 bg-brass/10 px-3 py-2 font-mono text-sm text-porcelain">${installAllCommand}</code>
        </div>
        <ul class="mt-5 grid gap-3 sm:grid-cols-3">
          ${installCommands}
        </ul>
      </section>
      ${actions}
      <section class="skill-content">${renderMarkdown(skill.body)}</section>
    </article>
  `;
}
