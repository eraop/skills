import YAML from "yaml"
import {
  formatSkillTitle,
  isSkillPlatform,
  SKILL_NAME_PATTERN,
  VALID_PLATFORMS,
  type SkillDraft,
} from "./skill-schema.js"

export function parsePastedSkill(source: string): SkillDraft {
  const normalized = source.replace(/\r\n?/g, "\n").trim()
  const cleaned = normalized
    .replace(/^<skill>\s*/, "")
    .replace(/\s*<\/skill>$/, "")
  const match = cleaned.match(/---\n([\s\S]+?)\n---\n?([\s\S]*)$/)

  if (!match) {
    throw new Error("Skill text must contain a YAML frontmatter block.")
  }

  const [, documentSource = "", bodySource = ""] = match
  const document = YAML.parse(documentSource)
  if (!document || typeof document !== "object") {
    throw new Error("Skill metadata must be a YAML object.")
  }

  const body = bodySource.trim()
  if (!body) {
    throw new Error("Skill body is required.")
  }

  const name = String((document as Record<string, unknown>).name ?? "").trim()
  if (!SKILL_NAME_PATTERN.test(name)) {
    throw new Error(
      "Skill name must use lowercase letters, digits, and hyphens only.",
    )
  }

  const description = String(
    (document as Record<string, unknown>).description ?? "",
  ).trim()
  if (!description) {
    throw new Error("Skill description is required.")
  }

  const rawPlatforms = (document as Record<string, unknown>).platforms
  const platforms =
    Array.isArray(rawPlatforms) && rawPlatforms.length > 0
      ? rawPlatforms.map((value) => String(value).trim())
      : [...VALID_PLATFORMS]

  if (!platforms.every(isSkillPlatform)) {
    throw new Error("Skill platforms must be codex, copilot, or cursor.")
  }

  return {
    name,
    title: String((document as Record<string, unknown>).title ?? "").trim() || formatSkillTitle(name),
    description,
    version: String((document as Record<string, unknown>).version ?? "0.1.0").trim() || "0.1.0",
    tags: Array.isArray((document as Record<string, unknown>).tags)
      ? ((document as Record<string, unknown>).tags as unknown[]).map((value) =>
          String(value),
        )
      : [],
    triggers: Array.isArray((document as Record<string, unknown>).triggers)
      ? ((document as Record<string, unknown>).triggers as unknown[]).map((value) =>
          String(value),
        )
      : [],
    platforms,
    body,
  }
}
