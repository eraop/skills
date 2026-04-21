import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import type { BuildArtifactBuilders } from "./build-artifact.js";
import { buildSkill } from "./build-skill.js";
import { resolveInstallPath, type InstallScope } from "./locators.js";
import type { Platform } from "./models.js";

export async function installSkill(args: {
  skillRoot: string;
  outputRoot: string;
  target: Platform | "all";
  scope: InstallScope;
  builders: BuildArtifactBuilders;
  projectRoot?: string;
}) {
  const artifacts = await buildSkill({
    skillRoot: args.skillRoot,
    outputRoot: args.outputRoot,
    builders: args.builders
  });

  const platforms =
    args.target === "all" ? (Object.keys(artifacts) as Platform[]) : [args.target];
  const results: Array<{ platform: Platform; destination: string }> = [];

  for (const platform of platforms) {
    const artifact = artifacts[platform];
    const installRoot = await resolveInstallPath({
      platform,
      scope: args.scope,
      ...(args.projectRoot ? { projectRoot: args.projectRoot } : {})
    });

    if (!artifact) {
      throw new Error(`No build artifact was produced for platform "${platform}"`);
    }

    await mkdir(installRoot, { recursive: true });

    const destination = path.join(installRoot, artifact.skillName);
    await rm(destination, { recursive: true, force: true });
    await cp(artifact.artifactPath, destination, { recursive: true, force: true });
    results.push({ platform, destination });
  }

  return results;
}
