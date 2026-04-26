import "./styles.css";
import { renderArchiveShell } from "./components/archive-shell.js";
import { renderDetailPage } from "./pages/detail.js";
import { renderHomePage } from "./pages/home.js";
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

    function render() {
      const hash = window.location.hash;

      if (hash === "" || hash === "#" || hash === "#/") {
        appRoot.innerHTML = renderArchiveShell(
          renderHomePage(skills, {
            workbenchAvailable: false,
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
    render();
  } catch {
    appRoot.innerHTML = renderArchiveShell(`
      <section class="max-w-xl py-16">
        <p class="font-mono text-xs font-semibold text-copper">Unavailable</p>
        <h1 class="mt-4 font-display text-5xl leading-none text-porcelain sm:text-6xl">The archive could not be loaded.</h1>
        <p class="mt-6 text-lg leading-8 text-mist">Please refresh and try again in a moment.</p>
      </section>
    `);
  }
}

void bootstrap();
