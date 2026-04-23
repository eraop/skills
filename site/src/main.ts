import "./styles.css";
import { renderApp } from "./app.js";
import { parseRoute } from "./router.js";
import type { PublishedSkill } from "./lib/types.js";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Missing #app root");

async function bootstrap() {
  const response = await fetch("/data/skills.json");
  const skills = (await response.json()) as PublishedSkill[];

  function render() {
    const route = parseRoute(window.location.hash);
    root.innerHTML = renderApp(route, skills);
  }

  window.addEventListener("hashchange", render);
  render();
}

void bootstrap();
