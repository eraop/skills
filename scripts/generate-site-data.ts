import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { mergeSkillVariants, parseArchiveSkill } from "../site/src/lib/site-data.js";

const repoRoot = process.cwd();
const skillsRoot = path.join(repoRoot, "skills");
const outputPath = path.join(repoRoot, "site", "public", "data", "skills.json");

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readSkillRecord(
  skillRoot: string,
  options: {
    artifactEntryFile?: string;
    skillName?: string;
    language?: string;
  } = {},
) {
  const [documentSource, body] = await Promise.all([
    readFile(path.join(skillRoot, "skill.yaml"), "utf8"),
    readFile(path.join(skillRoot, "body.md"), "utf8"),
  ]);

  return parseArchiveSkill({
    documentSource,
    body,
    artifactEntryFile: options.artifactEntryFile,
    skillName: options.skillName,
    language: options.language,
  });
}

async function readSkillRecords(skillRoot: string, skillName: string) {
  if (await fileExists(path.join(skillRoot, "skill.yaml"))) {
    return [await readSkillRecord(skillRoot)];
  }

  const entries = await readdir(skillRoot, { withFileTypes: true });
  const records = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(async (entry) => {
        const variantRoot = path.join(skillRoot, entry.name);
        const hasSkillFiles =
          (await fileExists(path.join(variantRoot, "skill.yaml"))) &&
          (await fileExists(path.join(variantRoot, "body.md")));

        if (!hasSkillFiles) {
          return null;
        }

        return readSkillRecord(variantRoot, {
          artifactEntryFile: `${entry.name}/SKILL.md`,
          skillName,
          language: entry.name,
        });
      }),
  );

  const variants = records.filter((record) => record !== null);
  return variants.length > 0 ? [mergeSkillVariants(skillName, variants)] : [];
}

const entries = await readdir(skillsRoot, { withFileTypes: true });
const skills = (
  await Promise.all(
    entries
    .filter((entry) => entry.isDirectory())
    .map(async (entry) => {
      const skillRoot = path.join(skillsRoot, entry.name);
      return readSkillRecords(skillRoot, entry.name);
    }),
  )
).flat();

skills.sort((left, right) => left.name.localeCompare(right.name));

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(skills, null, 2), "utf8");
