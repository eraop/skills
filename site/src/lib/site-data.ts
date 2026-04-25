import YAML from "yaml";
import { parseSkillDocument } from "../../../packages/core/src/schema.js";
import type { PublishedSkill } from "./types.js";

export function parseArchiveSkill(args: {
  documentSource: string;
  body: string;
}): PublishedSkill {
  const document = parseSkillDocument(YAML.parse(args.documentSource));
  const firstParagraph =
    args.body.replace(/^# .+\n+/m, "").split(/\n\s*\n/)[0]?.trim() ?? "";

  return {
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
        entryFile: "SKILL.md",
      },
    ],
  };
}
