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
  const addSkillLabel = args.editorOpen ? "Close Editor" : "Add Skill"

  return `
    <aside class="workbench-panel">
      <p class="eyebrow">Workbench</p>
      <p>Connected to ${repoLabel}.</p>
      <p>Paste a full wrapped skill to create source files and local artifacts.</p>
      <button id="add-skill" type="button">${addSkillLabel}</button>
      <button id="refresh-skills" type="button">Refresh</button>
    </aside>
  `;
}
