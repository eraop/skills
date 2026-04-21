import type { NeutralSkill, Platform } from "./models.js";

export interface BuildArtifact {
  platform: Platform;
  skillName: string;
  artifactPath: string;
  manifest: Record<string, unknown>;
  installHints: string[];
}

export type BuildArtifactBuilder = (args: {
  skill: NeutralSkill;
  artifactRoot: string;
}) => Promise<BuildArtifact>;

export type BuildArtifactBuilders = Partial<Record<Platform, BuildArtifactBuilder>>;
