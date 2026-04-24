const githubRepositoryUrl = "https://github.com/eraop/skills";

function renderGithubLink() {
  return `
    <a
      class="group absolute right-4 top-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-malachite/25 bg-onyx/80 text-porcelain shadow-2xl shadow-malachite/10 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-malachite/70 hover:bg-malachite hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-malachite"
      href="${githubRepositoryUrl}"
      target="_blank"
      rel="noreferrer"
      aria-label="Open GitHub repository"
      title="GitHub"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.5v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.34 9.34 0 0 1 12 6.9c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.84c0 .28.18.6.69.5A10.19 10.19 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"
        />
      </svg>
    </a>
  `;
}

export function renderArchiveShell(content: string, sidebar = "") {
  return `
    <main class="relative mx-auto min-h-screen w-full max-w-7xl px-4 py-5 text-porcelain sm:px-6 lg:px-8">
      ${renderGithubLink()}
      <div class="grid grid-cols-1 gap-5 pt-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 lg:pt-20">
        <section class="min-w-0">${content}</section>
        ${sidebar ? `<section class="min-w-0">${sidebar}</section>` : ""}
      </div>
    </main>
  `;
}
