import path from "node:path";
import { buildSkill } from "@skills/core";

export async function runBuildCommand(repoRoot: string, skillName: string) {
  return buildSkill({
    skillRoot: path.join(repoRoot, "skills", skillName),
    outputRoot: path.join(repoRoot, "dist")
  });
}
