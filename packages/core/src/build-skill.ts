import path from "node:path";
import type { BuildArtifact, BuildArtifactBuilders } from "./build-artifact.js";
import { loadSkill } from "./skill-loader.js";

export async function buildSkill(args: {
  skillRoot: string;
  outputRoot: string;
  builders: BuildArtifactBuilders;
}): Promise<Partial<Record<string, BuildArtifact>>> {
  const skill = await loadSkill(args.skillRoot);

  const entries = await Promise.all(
    skill.document.platforms.map(async (platform) => {
      const builder = args.builders[platform];

      if (!builder) {
        throw new Error(`Missing builder for platform "${platform}"`);
      }

      const artifact = await builder({
        skill,
        artifactRoot: path.join(args.outputRoot, platform, skill.document.name)
      });

      return [platform, artifact] as const;
    })
  );

  return Object.fromEntries(entries);
}
