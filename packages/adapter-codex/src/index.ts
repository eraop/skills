import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BuildArtifact, NeutralSkill } from "@skills/core";

export async function buildCodexArtifact(args: {
  skill: NeutralSkill;
  artifactRoot: string;
}): Promise<BuildArtifact> {
  await rm(args.artifactRoot, { recursive: true, force: true });
  await mkdir(args.artifactRoot, { recursive: true });

  const manifest = {
    name: args.skill.document.name,
    description: args.skill.document.description,
    platform: "codex"
  } as const;

  await writeFile(
    path.join(args.artifactRoot, "SKILL.md"),
    `# ${args.skill.document.title}\n\n${args.skill.body}`,
    "utf8"
  );

  return {
    platform: "codex",
    skillName: args.skill.document.name,
    artifactPath: args.artifactRoot,
    manifest,
    installHints: ["Install into the Codex skills directory."]
  };
}
