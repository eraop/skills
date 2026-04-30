import type { PublishedSkill } from "./lib/types.js";
import type { Route } from "./router.js";
import { renderArchiveShell } from "./components/archive-shell.js";
import { renderHomePage } from "./pages/home.js";
import { renderDetailPage } from "./pages/detail.js";
import { renderNotFoundPage } from "./pages/not-found.js";

export function renderApp(route: Route, skills: PublishedSkill[]) {
  if (route.kind === "home") {
    return renderArchiveShell(renderHomePage(skills));
  }

  if (route.kind === "detail") {
    const skill = skills.find((entry) => entry.name === route.skillName);
    return skill
      ? renderArchiveShell(
          renderDetailPage(skill, {
            workbenchAvailable: false,
            repoConnected: false,
            selectedLanguage: route.language,
          }),
        )
      : renderArchiveShell(renderNotFoundPage());
  }

  return renderArchiveShell(renderNotFoundPage());
}
