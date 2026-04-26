export function renderSkillEditor() {
  return `
    <section class="command-panel mt-6" data-ui="skill-editor-command">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <label class="section-kicker" for="skill-source">Paste a complete skill</label>
        <span class="muted-chip">Local parser</span>
      </div>
      <textarea class="command-input mt-4" id="skill-source" rows="18" spellcheck="false"></textarea>
      <div class="metadata-grid mt-5 text-sm text-mist">
        <p class="metadata-cell"><strong>Name</strong> <span id="skill-preview-name">Not parsed yet.</span></p>
        <p class="metadata-cell"><strong>Description</strong> <span id="skill-preview-description">-</span></p>
        <pre class="command-output max-h-64 sm:col-span-2" id="skill-body-preview"></pre>
      </div>
      <button class="command-button-primary mt-5 disabled:hover:translate-y-0" id="save-skill" type="button">Save and Build</button>
      <pre class="command-output mt-4 whitespace-pre-wrap" id="skill-validation"></pre>
    </section>
  `
}
