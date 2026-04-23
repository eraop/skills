import "./styles.css";
import { renderArchiveShell } from "./components/archive-shell.js";
import { renderWorkbenchPanel } from "./components/workbench-panel.js";
import { supportsWorkbenchMode } from "./lib/mode.js";
import { isValidRepoLayout, pickRepoRoot } from "./lib/repo-fs.js";
import { renderDetailPage } from "./pages/detail.js";
import { renderHomePage } from "./pages/home.js";
import { renderNotFoundPage } from "./pages/not-found.js";
import { parseRoute } from "./router.js";
import type { PublishedSkill } from "./lib/types.js";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Missing #app root");
const appRoot = root;
const workbenchAvailable = supportsWorkbenchMode();
const skillRepoNameKey = "skill-repo-name";

async function bootstrap() {
  try {
    const response = await fetch(new URL("data/skills.json", document.baseURI));
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const skills = (await response.json()) as PublishedSkill[];

    function render() {
      const route = parseRoute(window.location.hash);
      const repoLabel = workbenchAvailable
        ? window.localStorage.getItem(skillRepoNameKey) ?? undefined
        : undefined;
      const sidebar = workbenchAvailable
        ? renderWorkbenchPanel({
            enabled: Boolean(repoLabel),
            ...(repoLabel ? { repoLabel } : {}),
          })
        : "";

      if (route.kind === "home") {
        appRoot.innerHTML = renderArchiveShell(
          renderHomePage(skills, { workbenchAvailable }),
          sidebar,
        );
        return;
      }

      if (route.kind === "detail") {
        const skill = skills.find((entry) => entry.name === route.skillName);
        appRoot.innerHTML = renderArchiveShell(
          skill
            ? renderDetailPage(skill, { workbenchAvailable })
            : renderNotFoundPage(),
          sidebar,
        );
        return;
      }

      appRoot.innerHTML = renderArchiveShell(renderNotFoundPage(), sidebar);
    }

    document.addEventListener("click", async (event) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.id !== "connect-repo") return;

      const handle = await pickRepoRoot();
      if (!(await isValidRepoLayout(handle))) {
        window.alert("Selected directory is not a valid skill repository.");
        return;
      }

      window.localStorage.setItem(skillRepoNameKey, handle.name);
      render();
    });

    window.addEventListener("hashchange", render);
    render();
  } catch {
    appRoot.innerHTML = renderArchiveShell(`
      <section class="not-found">
        <p class="eyebrow">Unavailable</p>
        <h1>The archive could not be loaded.</h1>
        <p class="lede">Please refresh and try again in a moment.</p>
      </section>
    `);
  }
}

void bootstrap();
