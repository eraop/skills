import path from "node:path";
import { mkdir, rm, writeFile } from "node:fs/promises";
import type { BuildArtifact } from "./build-artifact.js";
import { renderSkillMarkdown } from "./render-skill.js";
import { loadSkill } from "./skill-loader.js";

export async function buildSkill(args: {
  skillRoot: string;
  outputRoot: string;
}): Promise<BuildArtifact> {
  const skill = await loadSkill(args.skillRoot);
  const artifactRoot = path.join(args.outputRoot, skill.document.name);

  await rm(artifactRoot, { recursive: true, force: true });
  await mkdir(artifactRoot, { recursive: true });
  await writeFile(
    path.join(artifactRoot, "SKILL.md"),
    renderSkillMarkdown({ document: skill.document, body: skill.body }),
    "utf8"
  );

  return {
    skillName: skill.document.name,
    artifactPath: artifactRoot,
    manifest: {
      name: skill.document.name,
      description: skill.document.description
    },
    installHints: ["Install into the shared .agents skills directory."]
  };
}
