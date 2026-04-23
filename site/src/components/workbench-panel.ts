export function renderWorkbenchPanel(args: {
  enabled: boolean;
  repoLabel?: string;
}) {
  if (!args.enabled) {
    return `
      <aside class="workbench-panel">
        <p class="eyebrow">Workbench</p>
        <p>Connect a local repository to unlock create, rebuild, and delete actions.</p>
        <button id="connect-repo" type="button">Select Skill Repo</button>
      </aside>
    `;
  }

  return `
    <aside class="workbench-panel">
      <p class="eyebrow">Workbench</p>
      <p>Connected to ${args.repoLabel ?? "selected repository"}.</p>
      <button id="add-skill" type="button">Add Skill</button>
      <button id="refresh-skills" type="button">Refresh</button>
    </aside>
  `;
}
