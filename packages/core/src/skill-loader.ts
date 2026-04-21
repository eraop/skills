import path from "node:path";
import YAML from "yaml";
import type { NeutralSkill } from "./models.js";
import { readUtf8 } from "./filesystem.js";
import { parseSkillDocument } from "./schema.js";

export async function loadSkill(rootDir: string): Promise<NeutralSkill> {
  const documentPath = path.join(rootDir, "skill.yaml");
  const bodyPath = path.join(rootDir, "body.md");
  const [documentSource, body] = await Promise.all([
    readUtf8(documentPath),
    readUtf8(bodyPath)
  ]);

  return {
    document: parseSkillDocument(YAML.parse(documentSource)),
    body,
    rootDir
  };
}
