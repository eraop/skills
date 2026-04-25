import type { SkillDocument } from "./models.js";

function formatSkillBody(title: string, body: string) {
  if (body.trimStart().startsWith("# ")) {
    return body;
  }

  return `# ${title}\n\n${body}`;
}

function formatYamlScalar(value: string) {
  if (
    value === "" ||
    /^\s|\s$/.test(value) ||
    /[\n\r\t]/.test(value) ||
    /(^[-?:,[\]{}#&*!|>'"%@`])|(:\s)|(\s#)/.test(value) ||
    /^(true|false|null|~|\d)/i.test(value)
  ) {
    return JSON.stringify(value);
  }

  return value;
}

function renderSkillFrontmatter(document: SkillDocument, includeTriggers: boolean) {
  const lines = [
    `name: ${formatYamlScalar(document.name)}`,
    `description: ${formatYamlScalar(document.description)}`
  ];

  if (includeTriggers && document.triggers.length > 0) {
    lines.push(
      "triggers:",
      ...document.triggers.map((trigger) => `  - ${formatYamlScalar(trigger)}`)
    );
  }

  return lines.join("\n");
}

export function renderSkillMarkdown(args: {
  document: SkillDocument;
  body: string;
  includeTriggers?: boolean;
}) {
  const includeTriggers = args.includeTriggers ?? true;
  const body = formatSkillBody(args.document.title, args.body);

  return [
    "---",
    renderSkillFrontmatter(args.document, includeTriggers),
    "---",
    "",
    body
  ].join("\n");
}
