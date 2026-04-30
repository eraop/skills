import YAML from "yaml";
import { parseSkillDocument } from "../../../packages/core/src/schema.js";
import type { PublishedSkill, PublishedSkillVariant } from "./types.js";

export function parseArchiveSkill(args: {
  documentSource: string;
  body: string;
  artifactEntryFile?: string | undefined;
  skillName?: string | undefined;
  language?: string | undefined;
}): PublishedSkill {
  const document = parseSkillDocument(YAML.parse(args.documentSource));
  const firstParagraph =
    args.body.replace(/^# .+\n+/m, "").split(/\n\s*\n/)[0]?.trim() ?? "";
  const variant: PublishedSkillVariant = {
    language: args.language ?? "default",
    name: document.name,
    title: document.title,
    description: document.description,
    version: document.version,
    tags: [...document.tags],
    triggers: [...document.triggers],
    body: args.body,
    bodyExcerpt: firstParagraph,
    artifacts: [
      {
        entryFile: args.artifactEntryFile ?? "SKILL.md",
      },
    ],
  };

  return {
    ...variant,
    name: args.skillName ?? document.name,
    variants: [variant],
  };
}

export function mergeSkillVariants(
  skillName: string,
  variants: PublishedSkill[],
): PublishedSkill {
  const allVariants = variants.flatMap((skill) => skill.variants);
  const defaultVariant =
    allVariants.find((variant) => variant.language === "en") ?? allVariants[0];

  if (!defaultVariant) {
    throw new Error(`Skill "${skillName}" must include at least one language variant.`);
  }

  return {
    ...defaultVariant,
    name: skillName,
    variants: allVariants,
  };
}
