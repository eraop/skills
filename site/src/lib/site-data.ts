import YAML from "yaml";
import type { PublishedSkill } from "./types.js";

type SkillDocument = Omit<PublishedSkill, "body" | "bodyExcerpt" | "artifacts">;

export function parseArchiveSkill(args: {
  documentSource: string;
  body: string;
}): PublishedSkill {
  const document = YAML.parse(args.documentSource) as SkillDocument;
  const firstParagraph =
    args.body.replace(/^# .+\n+/m, "").split(/\n\s*\n/)[0]?.trim() ?? "";

  return {
    ...document,
    body: args.body,
    bodyExcerpt: firstParagraph,
    artifacts: document.platforms.map((platform) => ({
      platform,
      entryFile: platform === "copilot" ? "README.md" : "SKILL.md",
    })),
  };
}
