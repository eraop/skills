import { access, readdir } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { NeutralSkill, SkillSource } from "./models.js";
import { readUtf8 } from "./filesystem.js";
import { parseSkillDocument } from "./schema.js";

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadSkill(rootDir: string): Promise<NeutralSkill> {
  const documentPath = path.join(rootDir, "skill.yaml");
  const bodyPath = path.join(rootDir, "body.md");
  const [documentSource, body] = await Promise.all([
    readUtf8(documentPath),
    readUtf8(bodyPath)
  ]);

  return {
    document: parseSkillDocument(YAML.parse(documentSource)),
    documentSource,
    body,
    rootDir
  };
}

export async function loadSkillSources(rootDir: string): Promise<SkillSource[]> {
  if (await fileExists(path.join(rootDir, "skill.yaml"))) {
    const skill = await loadSkill(rootDir);
    return [
      {
        ...skill,
        artifactPathSegments: [skill.document.name]
      }
    ];
  }

  const entries = await readdir(rootDir, { withFileTypes: true });
  const variantEntries = entries
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name));
  const groupName = path.basename(rootDir);
  const skills: SkillSource[] = [];

  for (const entry of variantEntries) {
    const variantRoot = path.join(rootDir, entry.name);
    const hasSkillFiles =
      (await fileExists(path.join(variantRoot, "skill.yaml"))) &&
      (await fileExists(path.join(variantRoot, "body.md")));

    if (!hasSkillFiles) {
      continue;
    }

    const skill = await loadSkill(variantRoot);
    skills.push({
      ...skill,
      artifactPathSegments: [groupName, entry.name],
      variantName: entry.name
    });
  }

  if (skills.length === 0) {
    throw new Error(
      `Skill root "${rootDir}" must contain skill.yaml or variant folders with skill.yaml and body.md.`
    );
  }

  return skills;
}
