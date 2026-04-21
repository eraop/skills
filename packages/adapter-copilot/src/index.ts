import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BuildArtifact, NeutralSkill } from "@skills/core";

export async function buildCopilotArtifact(args: {
  skill: NeutralSkill;
  artifactRoot: string;
}): Promise<BuildArtifact> {
  await rm(args.artifactRoot, { recursive: true, force: true });
  await mkdir(args.artifactRoot, { recursive: true });

  await writeFile(
    path.join(args.artifactRoot, "README.md"),
    `# ${args.skill.document.title}\n\n${args.skill.body}`,
    "utf8"
  );

  return {
    platform: "copilot",
    skillName: args.skill.document.name,
    artifactPath: args.artifactRoot,
    manifest: {
      name: args.skill.document.name,
      platform: "copilot"
    },
    installHints: ["Install into the Copilot skill directory."]
  };
}
