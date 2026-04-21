export type Platform = "codex" | "copilot" | "cursor";

export interface SkillOverride {
  notes?: string[];
}

export interface SkillDocument {
  name: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  triggers: string[];
  platforms: Platform[];
  platform_overrides?: Partial<Record<Platform, SkillOverride>>;
}

export interface NeutralSkill {
  document: SkillDocument;
  body: string;
  rootDir: string;
}
