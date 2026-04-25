export const SKILL_NAME_PATTERN = /^[a-z0-9-]+$/

export type SkillSourceMeta = {
  wrapperName?: string;
  wrapperPath?: string;
  rawFrontmatter: string;
}

export type SkillDraft = {
  name: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  triggers: string[];
  body: string;
  sourceMeta: SkillSourceMeta;
}

export function formatSkillTitle(name: string) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}
