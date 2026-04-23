import YAML from "yaml"
import { parseSkillDocument } from "../../../packages/core/src/schema.js"
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

  const documentRecord = document as Record<string, unknown>
  const name = String(documentRecord.name ?? "").trim()
  if (!SKILL_NAME_PATTERN.test(name)) {
    throw new Error(
      "Skill name must use lowercase letters, digits, and hyphens only.",
    )
  }

  const description = String(documentRecord.description ?? "").trim()
  if (!description) {
    throw new Error("Skill description is required.")
  }

  const rawPlatforms = documentRecord.platforms
  if (Array.isArray(rawPlatforms) && rawPlatforms.length === 0) {
    throw new Error("Skill platforms must include at least one platform when provided.")
  }

  const platforms =
    Array.isArray(rawPlatforms) && rawPlatforms.length > 0
      ? rawPlatforms.map((value) => String(value).trim())
      : [...VALID_PLATFORMS]

  if (!platforms.every(isSkillPlatform)) {
    throw new Error("Skill platforms must be codex, copilot, or cursor.")
  }

  const rawTriggers = documentRecord.triggers
  if (!Array.isArray(rawTriggers) || rawTriggers.length === 0) {
    throw new Error("Skill triggers must include at least one item.")
  }

  const triggers = rawTriggers.map((value) => String(value).trim())
  if (triggers.some((value) => value.length === 0)) {
    throw new Error("Skill triggers must not be empty.")
  }

  parseSkillDocument({
    name,
    title: String(documentRecord.title ?? "").trim() || formatSkillTitle(name),
    description,
    version: String(documentRecord.version ?? "0.1.0").trim() || "0.1.0",
    tags: Array.isArray(documentRecord.tags)
      ? documentRecord.tags.map((value) => String(value))
      : [],
    triggers,
    platforms,
  })

  const wrapperNameMatch = normalized.match(/<name>([\s\S]*?)<\/name>/)
  const wrapperPathMatch = normalized.match(/<path>([\s\S]*?)<\/path>/)

  return {
    name,
    title: String(documentRecord.title ?? "").trim() || formatSkillTitle(name),
    description,
    version: String(documentRecord.version ?? "0.1.0").trim() || "0.1.0",
    tags: Array.isArray(documentRecord.tags)
      ? (documentRecord.tags as unknown[]).map((value) => String(value))
      : [],
    triggers,
    platforms,
    body,
    sourceMeta: {
      ...(wrapperNameMatch?.[1]?.trim()
        ? { wrapperName: wrapperNameMatch[1].trim() }
        : {}),
      ...(wrapperPathMatch?.[1]?.trim()
        ? { wrapperPath: wrapperPathMatch[1].trim() }
        : {}),
      rawFrontmatter: documentSource,
    },
  }
}
