import "./styles.css";
import { renderArchiveShell } from "./components/archive-shell.js";
import { renderDetailPage } from "./pages/detail.js";
import { type HomeFilter, renderHomePage } from "./pages/home.js";
import { renderNotFoundPage } from "./pages/not-found.js";
import type { PublishedSkill } from "./lib/types.js";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Missing #app root");
const appRoot = root;

async function bootstrap() {
  try {
    const response = await fetch(new URL("data/skills.json", document.baseURI));
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const skills = (await response.json()) as PublishedSkill[];
    let homeQuery = "";
    let homeFilter: HomeFilter = "all";

    function isHomeFilter(value: string): value is HomeFilter {
      return value === "all" || value === "trending" || value === "hot";
    }

    function focusHomeSearch() {
      const searchField = document.querySelector<HTMLInputElement>("#skill-search");
      if (!searchField) return;

      searchField.focus();
      searchField.setSelectionRange(searchField.value.length, searchField.value.length);
    }

    function render() {
      const hash = window.location.hash;

      if (hash === "" || hash === "#" || hash === "#/") {
        appRoot.innerHTML = renderArchiveShell(
          renderHomePage(skills, {
            workbenchAvailable: false,
            query: homeQuery,
            filter: homeFilter,
          }),
        );
        return;
      }

      const detailMatch = hash.match(/^#\/skill\/([a-z0-9-]+)$/);
      const skillName = detailMatch?.[1];
      if (skillName) {
        const skill = skills.find((entry) => entry.name === skillName);
        appRoot.innerHTML = renderArchiveShell(
          skill
            ? renderDetailPage(skill, {
                workbenchAvailable: false,
                repoConnected: false,
              })
            : renderNotFoundPage(),
        );
        return;
      }

      appRoot.innerHTML = renderArchiveShell(renderNotFoundPage());
    }

    window.addEventListener("hashchange", render);
    document.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target || target.id !== "skill-search") return;

      homeQuery = target.value;
      render();
      focusHomeSearch();
    });
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      const filterButton = target?.closest<HTMLElement>("[data-home-filter]");
      const nextFilter = filterButton?.dataset.homeFilter;
      if (!nextFilter || !isHomeFilter(nextFilter)) return;

      homeFilter = nextFilter;
      render();
    });
    render();
  } catch {
    appRoot.innerHTML = renderArchiveShell(`
      <section class="command-empty">
        <p class="section-kicker">Archive offline</p>
        <h1 class="mt-4 font-display text-5xl leading-none text-porcelain sm:text-6xl">The archive could not be loaded.</h1>
        <p class="mt-6 text-lg leading-8 text-mist">Please refresh and try again in a moment.</p>
      </section>
    `);
  }
}

void bootstrap();
