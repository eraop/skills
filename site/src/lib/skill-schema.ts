export const VALID_PLATFORMS = ["codex", "copilot", "cursor"] as const
export const SKILL_NAME_PATTERN = /^[a-z0-9-]+$/

export type SkillPlatform = (typeof VALID_PLATFORMS)[number]

export type SkillSourceMeta = {
  wrapperName?: string;
  wrapperPath?: string;
  rawFrontmatter: string;
}

export type SkillOverride = {
  notes?: string[];
}

export type SkillDraft = {
  name: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  triggers: string[];
  platforms: SkillPlatform[];
  platformOverrides?: Partial<Record<SkillPlatform, SkillOverride>>;
  body: string;
  sourceMeta: SkillSourceMeta;
}

export function isSkillPlatform(value: unknown): value is SkillPlatform {
  return (
    typeof value === "string" &&
    (VALID_PLATFORMS as readonly string[]).includes(value)
  )
}

export function formatSkillTitle(name: string) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}
