const githubRepositoryUrl = "https://github.com/eraop/skills";

function renderGithubLink() {
  return `
    <a
      class="command-github-link"
      href="${githubRepositoryUrl}"
      target="_blank"
      rel="noreferrer"
      aria-label="Open GitHub repository"
      title="GitHub"
    >
      GitHub
    </a>
  `;
}

function renderSiteHeader() {
  return `
    <header class="command-site-header" data-ui="site-header">
      <div class="command-site-brand">
        <span class="command-site-owner">Eraop</span>
        <span class="command-site-slash" aria-hidden="true">
          <svg data-testid="geist-icon" height="16" stroke-linejoin="round" viewBox="0 0 16 16" width="16">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z" fill="currentColor"></path>
          </svg>
        </span>
        <a class="command-site-home" href="#/">
          <span>Skills</span>
        </a>
      </div>
      <nav class="command-site-nav" aria-label="Primary navigation">
        ${renderGithubLink()}
      </nav>
    </header>
  `;
}

export function renderArchiveShell(content: string, sidebar = "") {
  const hasSidebar = sidebar.trim().length > 0;
  const layoutClass = hasSidebar
    ? "command-layout command-layout-with-sidebar"
    : "command-layout command-layout-single";

  return `
    <main class="command-shell" data-ui="command-deck-shell">
      ${renderSiteHeader()}
      <div class="${layoutClass}">
        <section class="min-w-0">${content}</section>
        ${hasSidebar ? `<section class="min-w-0">${sidebar}</section>` : ""}
      </div>
    </main>
  `;
}
