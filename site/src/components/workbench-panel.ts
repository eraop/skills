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
      <aside class="workbench-panel">
        <p class="eyebrow">Workbench</p>
        <p>Connect a local repository to unlock create, rebuild, and delete actions.</p>
        ${
          rememberedRepoLabel
            ? `<p>Last selected repository: ${rememberedRepoLabel}. Reconnect to enable local actions.</p>`
            : ""
        }
        <button id="connect-repo" type="button">Select Skill Repo</button>
      </aside>
    `;
  }

  const repoLabel = escapeHtml(args.repoLabel ?? "selected repository");

  return `
    <aside class="workbench-panel">
      <p class="eyebrow">Workbench</p>
      <p>Connected to ${repoLabel}.</p>
      <button id="add-skill" type="button">Add Skill</button>
      <button id="refresh-skills" type="button">Refresh</button>
    </aside>
  `;
}
