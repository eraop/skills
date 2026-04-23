export function renderSkillEditor() {
  return `
    <section class="skill-editor">
      <label for="skill-source">Paste a complete skill</label>
      <textarea id="skill-source" rows="18" spellcheck="false"></textarea>
      <div class="skill-editor__preview">
        <p><strong>Name:</strong> <span id="skill-preview-name">Not parsed yet.</span></p>
        <p><strong>Platforms:</strong> <span id="skill-preview-platforms">-</span></p>
        <p><strong>Description:</strong> <span id="skill-preview-description">-</span></p>
        <pre id="skill-body-preview"></pre>
      </div>
      <button id="save-skill" type="button">Save and Build</button>
      <pre id="skill-validation"></pre>
    </section>
  `
}
