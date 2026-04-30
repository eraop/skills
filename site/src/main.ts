import "./styles.css";
import { renderArchiveShell } from "./components/archive-shell.js";
import { renderDetailPage } from "./pages/detail.js";
import { renderHomePage } from "./pages/home.js";
import { renderNotFoundPage } from "./pages/not-found.js";
import type { PublishedSkill } from "./lib/types.js";
import { handleCopyCommandClick } from "./lib/copy-command.js";
import { parseRoute } from "./router.js";

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
    let lastRouteKey: string | null = null;

    function focusHomeSearch() {
      const searchField = document.querySelector<HTMLInputElement>("#skill-search");
      if (!searchField) return;

      searchField.focus();
      searchField.setSelectionRange(searchField.value.length, searchField.value.length);
    }

    function routeKey(route: ReturnType<typeof parseRoute>) {
      if (route.kind === "detail") {
        return `${route.kind}:${route.skillName}:${route.language ?? ""}`;
      }

      return route.kind;
    }

    function syncRouteScroll(route: ReturnType<typeof parseRoute>) {
      const nextRouteKey = routeKey(route);
      if (nextRouteKey === lastRouteKey) return;

      lastRouteKey = nextRouteKey;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    function render() {
      const route = parseRoute(window.location.hash);

      if (route.kind === "home") {
        appRoot.innerHTML = renderArchiveShell(
          renderHomePage(skills, {
            workbenchAvailable: false,
            query: homeQuery,
          }),
        );
        syncRouteScroll(route);
        return;
      }

      if (route.kind === "detail") {
        const skill = skills.find((entry) => entry.name === route.skillName);
        appRoot.innerHTML = renderArchiveShell(
          skill
            ? renderDetailPage(skill, {
                workbenchAvailable: false,
                repoConnected: false,
                selectedLanguage: route.language,
              })
            : renderNotFoundPage(),
        );
        syncRouteScroll(route);
        return;
      }

      appRoot.innerHTML = renderArchiveShell(renderNotFoundPage());
      syncRouteScroll(route);
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
      void handleCopyCommandClick(event);
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
