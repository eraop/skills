import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArchiveSkill } from "../site/src/lib/site-data.js";

const repoRoot = process.cwd();
const skillsRoot = path.join(repoRoot, "skills");
const outputPath = path.join(repoRoot, "site", "public", "data", "skills.json");

const entries = await readdir(skillsRoot, { withFileTypes: true });
const skills = await Promise.all(
  entries
    .filter((entry) => entry.isDirectory())
    .map(async (entry) => {
      const skillRoot = path.join(skillsRoot, entry.name);
      const [documentSource, body] = await Promise.all([
        readFile(path.join(skillRoot, "skill.yaml"), "utf8"),
        readFile(path.join(skillRoot, "body.md"), "utf8"),
      ]);

      return parseArchiveSkill({ documentSource, body });
    }),
);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(skills, null, 2), "utf8");
