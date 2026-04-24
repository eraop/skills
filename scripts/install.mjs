#!/usr/bin/env node
import { mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_BASE_URL =
  "https://raw.githubusercontent.com/eraop/skills/main";
const SUPPORTED_PLATFORMS = ["codex", "copilot", "cursor"];

function usage() {
  return [
    "Usage:",
    "  node scripts/install.mjs <skill-name> [--target codex|copilot|cursor|all] [--scope global|project]",
    "",
    "Remote one-line usage:",
    `  curl -fsSL ${DEFAULT_BASE_URL}/scripts/install.mjs | node - <skill-name>`,
  ].join("\n");
}

export function parseSkillDocument(source) {
  const name = source.match(/^name:\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim();
  const title = source.match(/^title:\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim();
  const platformsBlock = source.match(/^platforms:\s*\n((?:\s*-\s*.+\n?)+)/m)?.[1] ?? "";
  const platforms = platformsBlock
    .split("\n")
    .map((line) => line.match(/^\s*-\s*"?([^"\n]+)"?\s*$/)?.[1]?.trim())
    .filter(Boolean);

  if (!name || !title || platforms.length === 0) {
    throw new Error("skill.yaml must include name, title, and platforms.");
  }

  return { name, title, platforms };
}

export function buildSkillMarkdown(title, body) {
  const trimmed = body.trimStart();

  if (trimmed.startsWith("# ")) {
    return body;
  }

  return `# ${title}\n\n${body}`;
}

export function resolveInstallRoot(platform, scope, options = {}) {
  const home = options.home ?? os.homedir();
  const cwd = options.cwd ?? process.cwd();

  if (scope === "project") {
    const projectDirs = {
      codex: path.join(cwd, ".codex", "skills"),
      copilot: path.join(cwd, ".github", "copilot", "skills"),
      cursor: path.join(cwd, ".cursor", "skills"),
    };

    return projectDirs[platform];
  }

  const globalDirs = {
    codex: path.join(home, ".codex", "skills"),
    copilot: path.join(home, ".config", "copilot", "skills"),
    cursor: path.join(home, ".cursor", "skills"),
  };

  return globalDirs[platform];
}

function parseArgs(argv) {
  const args = {
    skillName: undefined,
    target: "all",
    scope: "global",
    baseUrl: process.env.SKILLS_BASE_URL ?? DEFAULT_BASE_URL,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--target") {
      args.target = argv[++index];
      continue;
    }

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

  if (args.target !== "all" && !SUPPORTED_PLATFORMS.includes(args.target)) {
    throw new Error('--target must be "codex", "copilot", "cursor", or "all".');
  }

  const baseUrl = args.baseUrl.replace(/\/$/, "");
  const skillBaseUrl = `${baseUrl}/skills/${encodeURIComponent(args.skillName)}`;
  const [documentSource, body] = await Promise.all([
    fetchText(`${skillBaseUrl}/skill.yaml`),
    fetchText(`${skillBaseUrl}/body.md`),
  ]);
  const document = parseSkillDocument(documentSource);
  const platforms =
    args.target === "all"
      ? document.platforms.filter((platform) => SUPPORTED_PLATFORMS.includes(platform))
      : [args.target];
  const contents = buildSkillMarkdown(document.title, body);
  const installed = [];

  for (const platform of platforms) {
    if (!document.platforms.includes(platform)) {
      throw new Error(`Skill "${document.name}" does not support platform "${platform}".`);
    }

    const installRoot = resolveInstallRoot(platform, args.scope, args);
    const destination = path.join(installRoot, document.name);

    await mkdir(installRoot, { recursive: true });
    await rm(destination, { recursive: true, force: true });
    await mkdir(destination, { recursive: true });
    await writeFile(path.join(destination, "SKILL.md"), contents, "utf8");
    installed.push({ platform, destination });
  }

  return installed;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  const installed = await installRemoteSkill(args);

  for (const result of installed) {
    console.log(`${result.platform}: ${result.destination}`);
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
