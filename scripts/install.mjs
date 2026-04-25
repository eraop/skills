#!/usr/bin/env node
import { mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_BASE_URL =
  "https://raw.githubusercontent.com/eraop/skills/main";

function usage() {
  return [
    "Usage:",
    "  node scripts/install.mjs <skill-name> [--scope global|project]",
    "",
    "Remote one-line usage:",
    `  curl -fsSL ${DEFAULT_BASE_URL}/scripts/install.mjs | node - <skill-name>`,
  ].join("\n");
}

export function parseSkillDocument(source) {
  const name = source.match(/^name:\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim();
  const title = source.match(/^title:\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim();
  const description = source.match(/^description:\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim();
  const triggersBlock = source.match(/^triggers:\s*\n((?:\s*-\s*.+\n?)+)/m)?.[1] ?? "";
  const triggers = triggersBlock
    .split("\n")
    .map((line) => line.match(/^\s*-\s*"?([^"\n]+)"?\s*$/)?.[1]?.trim())
    .filter(Boolean);

  if (!name || !description || triggers.length === 0) {
    throw new Error("skill.yaml must include name, description, and triggers.");
  }

  return { name, title: title ?? name, description, triggers };
}

function formatYamlScalar(value) {
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

function buildFrontmatter(document, options = {}) {
  const includeTriggers = options.includeTriggers ?? true;
  const lines = [
    `name: ${formatYamlScalar(document.name)}`,
    `description: ${formatYamlScalar(document.description)}`,
  ];

  if (includeTriggers && document.triggers.length > 0) {
    lines.push(
      "triggers:",
      ...document.triggers.map((trigger) => `  - ${formatYamlScalar(trigger)}`),
    );
  }

  return lines.join("\n");
}

export function buildSkillMarkdown(document, body, options = {}) {
  const includeTriggers = options.includeTriggers ?? true;
  const trimmed = body.trimStart();
  const formattedBody = trimmed.startsWith("# ") ? body : `# ${document.title}\n\n${body}`;

  return ["---", buildFrontmatter(document, { ...options, includeTriggers }), "---", "", formattedBody].join("\n");
}

export function resolveInstallRoot(scope, options = {}) {
  const home = options.home ?? os.homedir();
  const cwd = options.cwd ?? process.cwd();

  if (scope === "project") {
    return path.join(cwd, ".agents", "skills");
  }

  return path.join(home, ".agents", "skills");
}

function parseArgs(argv) {
  const args = {
    skillName: undefined,
    scope: "global",
    baseUrl: process.env.SKILLS_BASE_URL ?? DEFAULT_BASE_URL,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--scope") {
      args.scope = argv[++index];
      continue;
    }

    if (value === "--base-url") {
      args.baseUrl = argv[++index];
      continue;
    }

    if (value === "--help" || value === "-h") {
      args.help = true;
      continue;
    }

    if (!args.skillName) {
      args.skillName = value;
      continue;
    }

    throw new Error(`Unexpected argument: ${value}`);
  }

  return args;
}

async function fetchText(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

export async function installRemoteSkill(args) {
  if (!args.skillName) {
    throw new Error("Skill name is required.");
  }

  if (args.scope !== "global" && args.scope !== "project") {
    throw new Error('--scope must be "global" or "project".');
  }

  const baseUrl = args.baseUrl.replace(/\/$/, "");
  const skillBaseUrl = `${baseUrl}/skills/${encodeURIComponent(args.skillName)}`;
  const [documentSource, body] = await Promise.all([
    fetchText(`${skillBaseUrl}/skill.yaml`),
    fetchText(`${skillBaseUrl}/body.md`),
  ]);
  const document = parseSkillDocument(documentSource);
  const installRoot = resolveInstallRoot(args.scope, args);
  const destination = path.join(installRoot, document.name);
  const contents = buildSkillMarkdown(document, body);

  await mkdir(installRoot, { recursive: true });
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, "SKILL.md"), contents, "utf8");

  return [{ destination }];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  const installed = await installRemoteSkill(args);

  for (const result of installed) {
    console.log(result.destination);
  }
}

const isEntrypoint = process.argv[1]
  ? process.argv[1] === "-" || fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
  : false;

if (isEntrypoint) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    console.error(usage());
    process.exitCode = 1;
  });
}
