import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolveInstallPath, type InstallScope } from "./locators.js";
import { renderSkillMarkdown } from "./render-skill.js";
import { loadSkillSources } from "./skill-loader.js";

export async function installSkill(args: {
  skillRoot: string;
  outputRoot?: string;
  scope: InstallScope;
  projectRoot?: string;
  home?: string;
}) {
  const skills = await loadSkillSources(args.skillRoot);
  const installRoot = await resolveInstallPath({
    scope: args.scope,
    ...(args.projectRoot ? { projectRoot: args.projectRoot } : {}),
    ...(args.home ? { home: args.home } : {})
  });
  const results: Array<{ destination: string }> = [];

  await mkdir(installRoot, { recursive: true });

  for (const skill of skills) {
    const destination = path.join(installRoot, skill.document.name);

    await rm(destination, { recursive: true, force: true });
    await mkdir(destination, { recursive: true });
    await writeFile(
      path.join(destination, "SKILL.md"),
      renderSkillMarkdown({ document: skill.document, body: skill.body }),
      "utf8"
    );

    results.push({ destination });
  }

  return results;
}
