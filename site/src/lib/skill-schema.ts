export const VALID_PLATFORMS = ["codex", "copilot", "cursor"] as const
export const SKILL_NAME_PATTERN = /^[a-z0-9-]+$/

export type SkillPlatform = (typeof VALID_PLATFORMS)[number]

export type SkillDraft = {
  name: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  triggers: string[];
  platforms: SkillPlatform[];
  body: string;
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
