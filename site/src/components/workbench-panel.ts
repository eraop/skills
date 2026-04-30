import { escapeHtml } from "../lib/html.js";

export function renderWorkbenchPanel(args: {
  enabled: boolean;
  repoLabel?: string;
  rememberedRepoLabel?: string;
}) {
  if (!args.enabled) {
    const rememberedRepoLabel = args.rememberedRepoLabel
      ? escapeHtml(args.rememberedRepoLabel)
      : undefined;

    return `
      <section class="command-panel sticky top-20 text-sm text-mist" data-ui="workbench-command-panel">
        <div class="flex items-center justify-between gap-3">
          <p class="section-kicker">Workbench</p>
          <span class="info-chip">Offline</span>
        </div>
        <p class="mt-4 leading-6">Connect a local repository to unlock create, rebuild, and delete actions.</p>
        ${
          rememberedRepoLabel
            ? `<p class="mt-3 leading-6">Last selected repository: ${rememberedRepoLabel}. Reconnect to enable local actions.</p>`
            : ""
        }
        <button class="command-button-primary mt-5 w-full" id="connect-repo" type="button">Select Skill Repo</button>
      </section>
    `;
  }

  const repoLabel = escapeHtml(args.repoLabel ?? "selected repository");
  return `
    <section class="command-panel sticky top-20 text-sm text-mist" data-ui="workbench-command-panel">
      <div class="flex items-center justify-between gap-3">
        <p class="section-kicker">Workbench</p>
        <span class="signal-chip">Connected</span>
      </div>
      <p class="mt-4 leading-6"><strong class="font-mono text-xs uppercase text-porcelain">Repository link</strong><br />Connected to ${repoLabel}.</p>
      <p class="mt-3 leading-6">Paste a full wrapped skill to create source files and local artifacts.</p>
      <div class="mt-5 grid grid-cols-2 gap-3">
        <a class="command-button-primary" href="#/edit">New Skill</a>
        <button class="command-button-secondary" id="refresh-skills" type="button">Refresh</button>
      </div>
    </section>
  `;
}
