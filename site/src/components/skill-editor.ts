export function renderSkillEditor() {
  return `
    <section class="mt-6 rounded-lg border border-brass/20 bg-black/25 p-5 shadow-2xl shadow-black/20">
      <label class="font-mono text-xs font-semibold text-copper" for="skill-source">Paste a complete skill</label>
      <textarea class="mt-4 min-h-[28rem] w-full resize-y border border-white/10 bg-ink/80 p-4 font-mono text-sm leading-6 text-porcelain outline-none transition placeholder:text-mist/60 focus:border-malachite" id="skill-source" rows="18" spellcheck="false"></textarea>
      <div class="mt-5 grid gap-3 border-y border-white/10 py-4 text-sm text-mist sm:grid-cols-3">
        <p><strong class="block font-mono text-xs text-porcelain">Name</strong> <span id="skill-preview-name">Not parsed yet.</span></p>
        <p><strong class="block font-mono text-xs text-porcelain">Platforms</strong> <span id="skill-preview-platforms">-</span></p>
        <p><strong class="block font-mono text-xs text-porcelain">Description</strong> <span id="skill-preview-description">-</span></p>
        <pre class="max-h-64 overflow-auto border border-white/10 bg-black/30 p-4 font-mono text-xs leading-5 text-mist sm:col-span-3" id="skill-body-preview"></pre>
      </div>
      <button class="mt-5 inline-flex h-10 items-center justify-center border border-malachite/50 bg-malachite px-4 text-sm font-semibold text-ink transition hover:bg-porcelain focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-malachite disabled:hover:bg-malachite" id="save-skill" type="button">Save and Build</button>
      <pre class="mt-4 whitespace-pre-wrap border border-white/10 bg-white/[0.04] p-4 font-mono text-xs leading-5 text-mist" id="skill-validation"></pre>
    </section>
  `
}
