export function renderNotFoundPage() {
  return `
    <section class="command-empty">
      <p class="section-kicker">Missing route</p>
      <h1 class="mt-4 font-display text-5xl leading-none text-porcelain sm:text-6xl">That skill page does not exist.</h1>
      <a class="command-button-primary mt-8" href="#/">Return to the archive</a>
    </section>
  `;
}
