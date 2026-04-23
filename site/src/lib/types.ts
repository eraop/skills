import type { SkillOverride, SkillPlatform } from "./skill-schema.js";

export type PublishedSkill = {
  name: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  triggers: string[];
  platforms: SkillPlatform[];
  platformOverrides?: Partial<Record<SkillPlatform, SkillOverride>>;
  body: string;
  bodyExcerpt: string;
  artifacts: Array<{ platform: SkillPlatform; entryFile: string }>;
};
