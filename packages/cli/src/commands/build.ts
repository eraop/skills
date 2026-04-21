import path from "node:path";
import { buildCodexArtifact } from "@skills/adapter-codex";
import { buildCopilotArtifact } from "@skills/adapter-copilot";
import { buildCursorArtifact } from "@skills/adapter-cursor";
import { buildSkill } from "@skills/core";

export async function runBuildCommand(repoRoot: string, skillName: string) {
  return buildSkill({
    skillRoot: path.join(repoRoot, "skills", skillName),
    outputRoot: path.join(repoRoot, "dist"),
    builders: {
      codex: buildCodexArtifact,
      copilot: buildCopilotArtifact,
      cursor: buildCursorArtifact
    }
  });
}
