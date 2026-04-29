import { readdir } from "node:fs/promises";
import path from "node:path";
import { buildSkill } from "../packages/core/src/build-skill.js";
import type { BuildArtifact } from "../packages/core/src/build-artifact.js";

export async function buildAllSkills(args: {
  repoRoot: string;
}): Promise<BuildArtifact[]> {
  const skillsRoot = path.join(args.repoRoot, "skills");
  const outputRoot = path.join(args.repoRoot, "dist");
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const skillDirectories = entries
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name));
  const artifacts: BuildArtifact[] = [];

  for (const entry of skillDirectories) {
    artifacts.push(
      ...await buildSkill({
        skillRoot: path.join(skillsRoot, entry.name),
        outputRoot,
      }),
    );
  }

  return artifacts;
}

const isEntrypoint = import.meta.url === `file://${process.argv[1]}`;

if (isEntrypoint) {
  buildAllSkills({ repoRoot: process.cwd() })
    .then((artifacts) => {
      for (const artifact of artifacts) {
        console.log(artifact.artifactPath);
      }
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
