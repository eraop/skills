import { escapeHtml } from "../lib/html.js";

export function renderWorkbenchPanel(args: {
  enabled: boolean;
  repoLabel?: string;
  rememberedRepoLabel?: string;
  editorOpen?: boolean;
}) {
  if (!args.enabled) {
    const rememberedRepoLabel = args.rememberedRepoLabel
      ? escapeHtml(args.rememberedRepoLabel)
      : undefined;

    return `
      <section class="sticky top-20 rounded-lg border border-white/10 bg-white/[0.065] p-5 text-sm text-mist shadow-2xl shadow-black/20 backdrop-blur">
        <p class="font-mono text-xs font-semibold text-copper">Workbench</p>
        <p class="mt-4 leading-6">Connect a local repository to unlock create, rebuild, and delete actions.</p>
        ${
          rememberedRepoLabel
            ? `<p class="mt-3 leading-6">Last selected repository: ${rememberedRepoLabel}. Reconnect to enable local actions.</p>`
            : ""
        }
        <button class="mt-5 inline-flex h-10 w-full items-center justify-center border border-brass/50 bg-brass px-4 font-semibold text-ink transition hover:bg-porcelain focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass" id="connect-repo" type="button">Select Skill Repo</button>
      </section>
    `;
  }

  const repoLabel = escapeHtml(args.repoLabel ?? "selected repository");
  const addSkillLabel = args.editorOpen ? "Close Editor" : "Add Skill"

  return `
    <section class="sticky top-20 rounded-lg border border-white/10 bg-white/[0.065] p-5 text-sm text-mist shadow-2xl shadow-black/20 backdrop-blur">
      <p class="font-mono text-xs font-semibold text-copper">Workbench</p>
      <p class="mt-4 leading-6">Connected to ${repoLabel}.</p>
      <p class="mt-3 leading-6">Paste a full wrapped skill to create source files and local artifacts.</p>
      <div class="mt-5 grid grid-cols-2 gap-3">
        <button class="inline-flex h-10 items-center justify-center border border-brass/50 bg-brass px-4 font-semibold text-ink transition hover:bg-porcelain focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass" id="add-skill" type="button">${addSkillLabel}</button>
        <button class="inline-flex h-10 items-center justify-center border border-white/15 bg-white/10 px-4 font-semibold text-porcelain transition hover:border-brass/50 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass" id="refresh-skills" type="button">Refresh</button>
      </div>
    </section>
  `;
}
