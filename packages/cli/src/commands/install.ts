import path from "node:path";
import { installSkill } from "@skills/core";

export async function runInstallCommand(
  repoRoot: string,
  skillName: string,
  scope: "global" | "project"
) {
  return installSkill({
    skillRoot: path.join(repoRoot, "skills", skillName),
    scope,
    ...(scope === "project" ? { projectRoot: repoRoot } : {})
  });
}
