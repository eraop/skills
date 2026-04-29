import path from "node:path";
import { mkdir, rm, writeFile } from "node:fs/promises";
import type { BuildArtifact } from "./build-artifact.js";
import { renderSkillMarkdown } from "./render-skill.js";
import { loadSkillSources } from "./skill-loader.js";

export async function buildSkill(args: {
  skillRoot: string;
  outputRoot: string;
}): Promise<BuildArtifact[]> {
  const skills = await loadSkillSources(args.skillRoot);
  const cleanupRoots = new Set(
    skills.map((skill) => path.join(args.outputRoot, skill.artifactPathSegments[0]!))
  );

  for (const cleanupRoot of cleanupRoots) {
    await rm(cleanupRoot, { recursive: true, force: true });
  }

  const artifacts: BuildArtifact[] = [];

  for (const skill of skills) {
    const artifactRoot = path.join(args.outputRoot, ...skill.artifactPathSegments);

    await mkdir(artifactRoot, { recursive: true });
    await writeFile(
      path.join(artifactRoot, "SKILL.md"),
      renderSkillMarkdown({ document: skill.document, body: skill.body }),
      "utf8"
    );

    artifacts.push({
      skillName: skill.document.name,
      artifactPath: artifactRoot,
      manifest: {
        name: skill.document.name,
        description: skill.document.description
      },
      installHints: ["Install into the shared .agents skills directory."]
    });
  }

  return artifacts;
}
