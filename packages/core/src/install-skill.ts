import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolveInstallPath, type InstallScope } from "./locators.js";
import { renderSkillMarkdown } from "./render-skill.js";
import { loadSkill } from "./skill-loader.js";

export async function installSkill(args: {
  skillRoot: string;
  outputRoot?: string;
  scope: InstallScope;
  projectRoot?: string;
  home?: string;
}) {
  const skill = await loadSkill(args.skillRoot);
  const installRoot = await resolveInstallPath({
    scope: args.scope,
    ...(args.projectRoot ? { projectRoot: args.projectRoot } : {}),
    ...(args.home ? { home: args.home } : {})
  });
  const destination = path.join(installRoot, skill.document.name);

  await mkdir(installRoot, { recursive: true });
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await writeFile(
    path.join(destination, "SKILL.md"),
    renderSkillMarkdown({ document: skill.document, body: skill.body }),
    "utf8"
  );

  return [{ destination }];
}
