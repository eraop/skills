export function renderArchiveShell(content: string, sidebar = "") {
  return `
    <main class="archive-shell">
      <section class="archive-shell__main">${content}</section>
      ${sidebar ? `<aside class="archive-shell__aside">${sidebar}</aside>` : ""}
    </main>
  `;
}
