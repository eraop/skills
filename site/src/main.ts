import "./styles.css";
import { renderApp } from "./app.js";
import { renderArchiveShell } from "./components/archive-shell.js";
import { parseRoute } from "./router.js";
import type { PublishedSkill } from "./lib/types.js";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Missing #app root");

async function bootstrap() {
  try {
    const response = await fetch(new URL("data/skills.json", document.baseURI));
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const skills = (await response.json()) as PublishedSkill[];

    function render() {
      const route = parseRoute(window.location.hash);
      root.innerHTML = renderApp(route, skills);
    }

    window.addEventListener("hashchange", render);
    render();
  } catch {
    root.innerHTML = renderArchiveShell(`
      <section class="not-found">
        <p class="eyebrow">Unavailable</p>
        <h1>The archive could not be loaded.</h1>
        <p class="lede">Please refresh and try again in a moment.</p>
      </section>
    `);
  }
}

void bootstrap();
