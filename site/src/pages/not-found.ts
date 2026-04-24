export function renderNotFoundPage() {
  return `
    <section class="max-w-xl py-16">
      <p class="font-mono text-xs font-semibold text-copper">Missing</p>
      <h1 class="mt-4 font-display text-5xl leading-none text-porcelain sm:text-6xl">That skill page does not exist.</h1>
      <a class="mt-8 inline-flex h-11 items-center border border-brass/50 bg-brass px-4 text-sm font-semibold text-ink transition hover:bg-porcelain focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass" href="#/">Return to the archive</a>
    </section>
  `;
}
