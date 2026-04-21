import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
// prompts has no bundled typings in this workspace, so the import is intentionally untyped.
// @ts-expect-error prompts does not currently ship declarations here.
import prompts from "prompts";

type CreateAnswers = {
  name: string;
  title: string;
  description: string;
  triggers: string[];
  tags: string[];
  platforms: Array<"codex" | "copilot" | "cursor">;
};

const NAME_PATTERN = /^[a-z0-9-]+$/;

function quoteYaml(value: string) {
  return JSON.stringify(value);
}

function toYamlList(values: string[]) {
  return values.map((value) => `  - ${quoteYaml(value)}`);
}

export async function runCreateCommand(repoRoot: string) {
  const answers = await prompts<CreateAnswers>(
    [
      {
        type: "text",
        name: "name",
        message: "Skill name",
        validate: (value: string) =>
          NAME_PATTERN.test(value) ? true : "Use lowercase letters, numbers, and hyphens only."
      },
      {
        type: "text",
        name: "title",
        message: "Skill title",
        validate: (value: string) => (value.trim() ? true : "Title is required.")
      },
      {
        type: "text",
        name: "description",
        message: "Description",
        validate: (value: string) => (value.trim() ? true : "Description is required.")
      },
      {
        type: "list",
        name: "triggers",
        message: "Triggers (comma separated)",
        validate: (value: string[]) => (value.length > 0 ? true : "At least one trigger is required.")
      },
      {
        type: "list",
        name: "tags",
        message: "Tags (comma separated)"
      },
      {
        type: "multiselect",
        name: "platforms",
        message: "Platforms",
        choices: [
          { title: "Codex", value: "codex" },
          { title: "Copilot", value: "copilot" },
          { title: "Cursor", value: "cursor" }
        ],
        min: 1
      }
    ],
    {
      onCancel: () => {
        throw new Error("Skill creation cancelled.");
      }
    }
  );

  const skillsRoot = path.join(repoRoot, "skills");
  const skillDir = path.join(skillsRoot, answers.name);

  try {
    await access(skillDir);
    throw new Error(`Skill "${answers.name}" already exists.`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  const documentLines = [
    `name: ${quoteYaml(answers.name)}`,
    `title: ${quoteYaml(answers.title)}`,
    `description: ${quoteYaml(answers.description)}`,
    'version: "0.1.0"',
    ...(answers.tags.length > 0 ? ["tags:", ...toYamlList(answers.tags)] : ["tags: []"]),
    "triggers:",
    ...toYamlList(answers.triggers),
    "platforms:",
    ...toYamlList(answers.platforms),
    ""
  ];

  await mkdir(skillsRoot, { recursive: true });
  await mkdir(skillDir, { recursive: true });
  await writeFile(path.join(skillDir, "skill.yaml"), documentLines.join("\n"), "utf8");
  await writeFile(path.join(skillDir, "body.md"), `# ${answers.title}\n`, "utf8");
}
