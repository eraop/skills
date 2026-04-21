import path from "node:path";
import { buildCodexArtifact } from "@skills/adapter-codex";
import { buildCopilotArtifact } from "@skills/adapter-copilot";
import { buildCursorArtifact } from "@skills/adapter-cursor";
import { installSkill } from "@skills/core";

export async function runInstallCommand(
  repoRoot: string,
  skillName: string,
  target: "codex" | "copilot" | "cursor" | "all",
  scope: "global" | "project"
) {
  return installSkill({
    skillRoot: path.join(repoRoot, "skills", skillName),
    outputRoot: path.join(repoRoot, "dist"),
    target,
    scope,
    builders: {
      codex: buildCodexArtifact,
      copilot: buildCopilotArtifact,
      cursor: buildCursorArtifact
    },
    ...(scope === "project" ? { projectRoot: repoRoot } : {})
  });
}
