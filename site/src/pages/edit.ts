import { renderSkillEditor } from "../components/skill-editor.js";

export function renderEditPage(args: { repoConnected: boolean }) {
  if (!args.repoConnected) {
    return `
      <section class="command-empty">
        <p class="section-kicker">Local Workbench</p>
        <h1 class="mt-4 font-display text-5xl leading-none text-porcelain sm:text-6xl">Connect a repository first.</h1>
        <p class="mt-6 text-lg leading-8 text-mist">Use the workbench panel to select this skills repository before creating or editing local skills.</p>
      </section>
    `;
  }

  return `
    <section class="max-w-4xl">
      <a class="console-link" href="#/">Back to archive</a>
      <p class="section-kicker mt-8">Local Workbench</p>
      <h1 class="mt-4 max-w-3xl font-display text-5xl font-semibold leading-none text-porcelain sm:text-6xl">Create or edit a skill.</h1>
      ${renderSkillEditor()}
    </section>
  `;
}
