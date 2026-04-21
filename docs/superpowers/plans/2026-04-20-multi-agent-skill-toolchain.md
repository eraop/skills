# Multi-Agent Skill Toolchain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js CLI that creates neutral skill sources, builds Codex/Copilot/Cursor artifacts, and installs selected skills to global or project-local targets.

**Architecture:** Use a TypeScript workspace with a small CLI package, a shared core package for schema and orchestration, and one adapter package per platform. Source skills live under `skills/<name>/`, generated artifacts live under `dist/<platform>/`, and install path resolution stays behind platform-specific locator interfaces.

**Tech Stack:** Node.js 22, TypeScript, npm workspaces, Commander, Prompts, Zod, Vitest

---

## File Structure

This plan creates the initial repository skeleton below and keeps each file focused on one responsibility.

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.build.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `README.md`
- Create: `skills/using-superpowers/skill.yaml`
- Create: `skills/using-superpowers/body.md`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/src/models.ts`
- Create: `packages/core/src/schema.ts`
- Create: `packages/core/src/filesystem.ts`
- Create: `packages/core/src/build-artifact.ts`
- Create: `packages/core/src/locators.ts`
- Create: `packages/core/src/skill-loader.ts`
- Create: `packages/core/src/build-skill.ts`
- Create: `packages/core/src/install-skill.ts`
- Create: `packages/adapter-codex/package.json`
- Create: `packages/adapter-codex/tsconfig.json`
- Create: `packages/adapter-codex/src/index.ts`
- Create: `packages/adapter-copilot/package.json`
- Create: `packages/adapter-copilot/tsconfig.json`
- Create: `packages/adapter-copilot/src/index.ts`
- Create: `packages/adapter-cursor/package.json`
- Create: `packages/adapter-cursor/tsconfig.json`
- Create: `packages/adapter-cursor/src/index.ts`
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/src/index.ts`
- Create: `packages/cli/src/commands/create.ts`
- Create: `packages/cli/src/commands/build.ts`
- Create: `packages/cli/src/commands/install.ts`
- Create: `packages/cli/src/commands/list.ts`
- Create: `tests/fixtures/using-superpowers/skill.yaml`
- Create: `tests/fixtures/using-superpowers/body.md`
- Create: `tests/core/schema.test.ts`
- Create: `tests/core/build.test.ts`
- Create: `tests/core/install.test.ts`
- Create: `tests/adapters/codex.test.ts`
- Create: `tests/adapters/copilot.test.ts`
- Create: `tests/adapters/cursor.test.ts`

## Shared Conventions

- Use npm workspaces to keep setup simple in a brand-new repository.
- Use ESM TypeScript throughout the repo.
- Keep the root `tsconfig.json` responsible for workspace-level typechecking only.
- Keep the root `tsconfig.build.json` responsible for workspace package references and build mode.
- Keep `tsconfig.base.json` limited to shared compiler defaults, not package-specific output paths.
- Keep `skills/<name>/` human-maintained and `dist/` fully generated.
- Use `npm test` for the full test suite and `npm run build` for TypeScript output.
- Use `using-superpowers` as the first real fixture skill.

### Task 1: Bootstrap the TypeScript Workspace

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.build.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `README.md`
- Test: `npm test`

- [ ] **Step 1: Write the failing workspace test command expectation**

Document the first red state before any code exists:

```bash
npm test
```

Expected: npm exits non-zero because `package.json` does not exist yet.

- [ ] **Step 2: Create the root `package.json`**

```json
{
  "name": "skills",
  "private": true,
  "type": "module",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "tsc -b tsconfig.build.json",
    "test": "vitest run",
    "lint": "tsc -p tsconfig.json --pretty false"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "typescript": "^5.8.3",
    "vitest": "^3.1.2"
  }
}
```

- [ ] **Step 3: Create the root typecheck config, root build config, and shared TypeScript base config**

`tsconfig.json`

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": [
    "packages/*/src/**/*.ts",
    "tests/**/*.ts"
  ]
}
```

`tsconfig.build.json`

```json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/adapter-codex" },
    { "path": "./packages/adapter-copilot" },
    { "path": "./packages/adapter-cursor" },
    { "path": "./packages/cli" }
  ]
}
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

- [ ] **Step 4: Add repo hygiene files**

`.gitignore`

```gitignore
node_modules
dist
dist-ts
coverage
.DS_Store
```

`README.md`

```md
# Skills

Multi-agent skill toolchain for authoring neutral skills, building platform artifacts, and installing them for Codex, Copilot, and Cursor.
```

- [ ] **Step 5: Run the test command to confirm the next failure is dependency-related**

```bash
npm test
```

Expected: npm now reads `package.json` and fails because dependencies are not installed yet.

- [ ] **Step 6: Commit the workspace bootstrap**

```bash
git add package.json tsconfig.json tsconfig.build.json tsconfig.base.json .gitignore README.md
git commit -m "chore: bootstrap workspace"
```

### Task 2: Add the Neutral Skill Fixture and Schema Tests

**Files:**
- Create: `skills/using-superpowers/skill.yaml`
- Create: `skills/using-superpowers/body.md`
- Create: `tests/fixtures/using-superpowers/skill.yaml`
- Create: `tests/fixtures/using-superpowers/body.md`
- Create: `tests/core/schema.test.ts`
- Test: `tests/core/schema.test.ts`

- [ ] **Step 1: Write the failing schema test**

```ts
import { describe, expect, it } from "vitest";
import { parseSkillDocument } from "../../packages/core/src/schema.js";

describe("parseSkillDocument", () => {
  it("accepts a valid neutral skill", () => {
    const parsed = parseSkillDocument({
      name: "using-superpowers",
      title: "Using Superpowers",
      description: "Use when starting any conversation.",
      version: "0.1.0",
      tags: ["workflow"],
      triggers: ["user asks to start a task"],
      platforms: ["codex", "copilot", "cursor"],
      platform_overrides: {
        codex: {},
        copilot: {},
        cursor: {}
      }
    });

    expect(parsed.name).toBe("using-superpowers");
    expect(parsed.platforms).toEqual(["codex", "copilot", "cursor"]);
    expect(parsed.platform_overrides).toEqual({
      codex: {},
      copilot: {},
      cursor: {}
    });
  });
});
```

- [ ] **Step 2: Run the schema test to verify it fails**

```bash
npx vitest run tests/core/schema.test.ts
```

Expected: FAIL with a module resolution error because `packages/core/src/schema.ts` does not exist yet.

- [ ] **Step 3: Add the first real fixture skill**

`skills/using-superpowers/skill.yaml`

```yaml
name: using-superpowers
title: Using Superpowers
description: Use when starting any conversation.
version: 0.1.0
tags:
  - workflow
triggers:
  - user asks to start a task
platforms:
  - codex
  - copilot
  - cursor
platform_overrides:
  codex: {}
  copilot: {}
  cursor: {}
```

`skills/using-superpowers/body.md`

```md
# Using Superpowers

Invoke relevant or requested skills before responding or acting.
```

- [ ] **Step 4: Mirror the fixture under `tests/fixtures` for isolated adapter tests**

`tests/fixtures/using-superpowers/skill.yaml`

```yaml
name: using-superpowers
title: Using Superpowers
description: Use when starting any conversation.
version: 0.1.0
tags:
  - workflow
triggers:
  - user asks to start a task
platforms:
  - codex
  - copilot
  - cursor
platform_overrides:
  codex: {}
  copilot: {}
  cursor: {}
```

`tests/fixtures/using-superpowers/body.md`

```md
# Using Superpowers

Invoke relevant or requested skills before responding or acting.
```

- [ ] **Step 5: Run the schema test again to confirm the failure is now isolated to missing parser code**

```bash
npx vitest run tests/core/schema.test.ts
```

Expected: FAIL with `Cannot find module '../../packages/core/src/schema.js'`.

- [ ] **Step 6: Commit the neutral fixture and failing test**

```bash
git add skills/using-superpowers tests/fixtures/using-superpowers tests/core/schema.test.ts
git commit -m "test: add neutral skill fixture"
```

### Task 3: Implement the Core Schema and Skill Loader

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/src/models.ts`
- Create: `packages/core/src/schema.ts`
- Create: `packages/core/src/filesystem.ts`
- Create: `packages/core/src/skill-loader.ts`
- Test: `tests/core/schema.test.ts`

- [ ] **Step 1: Create the core package manifest**

```json
{
  "name": "@skills/core",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js"
  },
  "dependencies": {
    "zod": "^3.24.4",
    "yaml": "^2.8.0"
  }
}
```

- [ ] **Step 2: Create the core package TypeScript config**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true
  },
  "include": [
    "src/**/*.ts"
  ]
}
```

- [ ] **Step 3: Define the core domain model**

`packages/core/src/models.ts`

```ts
export type Platform = "codex" | "copilot" | "cursor";

export interface SkillOverride {
  notes?: string[];
}

export interface SkillDocument {
  name: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  triggers: string[];
  platforms: Platform[];
  platform_overrides?: Partial<Record<Platform, SkillOverride>>;
}

export interface NeutralSkill {
  document: SkillDocument;
  body: string;
  rootDir: string;
}
```

- [ ] **Step 4: Implement schema parsing and validation**

`packages/core/src/schema.ts`

```ts
import { z } from "zod";
import type { SkillDocument } from "./models.js";

const platformSchema = z.enum(["codex", "copilot", "cursor"]);

const overrideSchema = z.object({
  notes: z.array(z.string()).optional()
});

const skillDocumentSchema = z.object({
  name: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  tags: z.array(z.string()).default([]),
  triggers: z.array(z.string()).min(1),
  platforms: z.array(platformSchema).min(1),
  platform_overrides: z
    .object({
      codex: overrideSchema.optional(),
      copilot: overrideSchema.optional(),
      cursor: overrideSchema.optional()
    })
    .optional()
});

export function parseSkillDocument(input: unknown): SkillDocument {
  return skillDocumentSchema.parse(input);
}
```

- [ ] **Step 5: Implement file loading helpers**

`packages/core/src/filesystem.ts`

```ts
import { readFile } from "node:fs/promises";

export async function readUtf8(path: string): Promise<string> {
  return readFile(path, "utf8");
}
```

`packages/core/src/skill-loader.ts`

```ts
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
```

- [ ] **Step 6: Export the public core API**

`packages/core/src/index.ts`

```ts
export * from "./models.js";
export * from "./schema.js";
export * from "./skill-loader.js";
```

- [ ] **Step 7: Run the schema test to verify it passes**

```bash
npx vitest run tests/core/schema.test.ts
```

Expected: PASS with one passing test.

- [ ] **Step 8: Commit the core schema**

```bash
git add packages/core tests/core/schema.test.ts
git commit -m "feat: add neutral skill schema"
```

### Task 4: Implement Build Artifacts and Platform Adapters

**Files:**
- Create: `packages/core/src/build-artifact.ts`
- Create: `packages/core/src/build-skill.ts`
- Create: `packages/adapter-codex/package.json`
- Create: `packages/adapter-codex/tsconfig.json`
- Create: `packages/adapter-codex/src/index.ts`
- Create: `packages/adapter-copilot/package.json`
- Create: `packages/adapter-copilot/tsconfig.json`
- Create: `packages/adapter-copilot/src/index.ts`
- Create: `packages/adapter-cursor/package.json`
- Create: `packages/adapter-cursor/tsconfig.json`
- Create: `packages/adapter-cursor/src/index.ts`
- Create: `tests/core/build.test.ts`
- Create: `tests/adapters/codex.test.ts`
- Create: `tests/adapters/copilot.test.ts`
- Create: `tests/adapters/cursor.test.ts`
- Test: `tests/core/build.test.ts`, `tests/adapters/*.test.ts`

- [ ] **Step 1: Write the failing build orchestration test**

```ts
import { describe, expect, it } from "vitest";
import { buildSkill } from "../../packages/core/src/build-skill.js";

describe("buildSkill", () => {
  it("builds enabled platform artifacts", async () => {
    const artifactMap = await buildSkill({
      skillRoot: "tests/fixtures/using-superpowers",
      outputRoot: ".tmp/dist"
    });

    expect(Object.keys(artifactMap)).toEqual(["codex", "copilot", "cursor"]);
  });
});
```

- [ ] **Step 2: Run the build tests to verify they fail**

```bash
npx vitest run tests/core/build.test.ts tests/adapters/codex.test.ts tests/adapters/copilot.test.ts tests/adapters/cursor.test.ts
```

Expected: FAIL because build orchestration and adapter modules do not exist yet.

- [ ] **Step 3: Define the build artifact contract**

`packages/core/src/build-artifact.ts`

```ts
import type { Platform } from "./models.js";

export interface BuildArtifact {
  platform: Platform;
  skillName: string;
  artifactPath: string;
  manifest: Record<string, unknown>;
  installHints: string[];
}

export interface SkillAdapter {
  platform: Platform;
  build(args: { skillRoot: string; outputRoot: string }): Promise<BuildArtifact>;
}
```

- [ ] **Step 4: Implement the build orchestrator**

`packages/core/src/build-skill.ts`

```ts
import path from "node:path";
import { loadSkill } from "./skill-loader.js";
import type { BuildArtifact } from "./build-artifact.js";
import { buildCodexArtifact } from "../../adapter-codex/src/index.js";
import { buildCopilotArtifact } from "../../adapter-copilot/src/index.js";
import { buildCursorArtifact } from "../../adapter-cursor/src/index.js";

export async function buildSkill(args: {
  skillRoot: string;
  outputRoot: string;
}): Promise<Record<string, BuildArtifact>> {
  const skill = await loadSkill(args.skillRoot);
  const builders = {
    codex: buildCodexArtifact,
    copilot: buildCopilotArtifact,
    cursor: buildCursorArtifact
  };

  const entries = await Promise.all(
    skill.document.platforms.map(async (platform) => {
      const artifact = await builders[platform]({
        skill,
        artifactRoot: path.join(args.outputRoot, platform, skill.document.name)
      });
      return [platform, artifact] as const;
    })
  );

  return Object.fromEntries(entries);
}
```

- [ ] **Step 5: Create adapter TypeScript configs**

Use the same shape for each adapter package config:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true
  },
  "include": [
    "src/**/*.ts"
  ]
}
```

- [ ] **Step 6: Implement the Codex adapter**

`packages/adapter-codex/src/index.ts`

```ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NeutralSkill } from "@skills/core";
import type { BuildArtifact } from "@skills/core/src/build-artifact.js";

export async function buildCodexArtifact(args: {
  skill: NeutralSkill;
  artifactRoot: string;
}): Promise<BuildArtifact> {
  await mkdir(args.artifactRoot, { recursive: true });

  const manifest = {
    name: args.skill.document.name,
    description: args.skill.document.description,
    platform: "codex"
  };

  await writeFile(
    path.join(args.artifactRoot, "SKILL.md"),
    `# ${args.skill.document.title}\n\n${args.skill.body}`,
    "utf8"
  );

  return {
    platform: "codex",
    skillName: args.skill.document.name,
    artifactPath: args.artifactRoot,
    manifest,
    installHints: ["Install into the Codex skills directory."]
  };
}
```

- [ ] **Step 7: Implement the Copilot and Cursor adapters with the same contract**

`packages/adapter-copilot/src/index.ts`

```ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NeutralSkill } from "@skills/core";
import type { BuildArtifact } from "@skills/core/src/build-artifact.js";

export async function buildCopilotArtifact(args: {
  skill: NeutralSkill;
  artifactRoot: string;
}): Promise<BuildArtifact> {
  await mkdir(args.artifactRoot, { recursive: true });

  await writeFile(
    path.join(args.artifactRoot, "README.md"),
    `# ${args.skill.document.title}\n\n${args.skill.body}`,
    "utf8"
  );

  return {
    platform: "copilot",
    skillName: args.skill.document.name,
    artifactPath: args.artifactRoot,
    manifest: {
      name: args.skill.document.name,
      platform: "copilot"
    },
    installHints: ["Install into the Copilot skill directory."]
  };
}
```

`packages/adapter-cursor/src/index.ts`

```ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NeutralSkill } from "@skills/core";
import type { BuildArtifact } from "@skills/core/src/build-artifact.js";

export async function buildCursorArtifact(args: {
  skill: NeutralSkill;
  artifactRoot: string;
}): Promise<BuildArtifact> {
  await mkdir(args.artifactRoot, { recursive: true });

  await writeFile(
    path.join(args.artifactRoot, "SKILL.md"),
    `# ${args.skill.document.title}\n\n${args.skill.body}`,
    "utf8"
  );

  return {
    platform: "cursor",
    skillName: args.skill.document.name,
    artifactPath: args.artifactRoot,
    manifest: {
      name: args.skill.document.name,
      platform: "cursor"
    },
    installHints: ["Install into the Cursor skill directory."]
  };
}
```

- [ ] **Step 8: Add adapter tests**

`tests/adapters/codex.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { buildCodexArtifact } from "../../packages/adapter-codex/src/index.js";
import { loadSkill } from "../../packages/core/src/skill-loader.js";

describe("buildCodexArtifact", () => {
  it("returns a codex artifact manifest", async () => {
    const skill = await loadSkill("tests/fixtures/using-superpowers");
    const artifact = await buildCodexArtifact({
      skill,
      artifactRoot: ".tmp/codex/using-superpowers"
    });

    expect(artifact.platform).toBe("codex");
    expect(artifact.skillName).toBe("using-superpowers");
  });
});
```

`tests/adapters/copilot.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { buildCopilotArtifact } from "../../packages/adapter-copilot/src/index.js";
import { loadSkill } from "../../packages/core/src/skill-loader.js";

describe("buildCopilotArtifact", () => {
  it("returns a copilot artifact manifest", async () => {
    const skill = await loadSkill("tests/fixtures/using-superpowers");
    const artifact = await buildCopilotArtifact({
      skill,
      artifactRoot: ".tmp/copilot/using-superpowers"
    });

    expect(artifact.platform).toBe("copilot");
  });
});
```

`tests/adapters/cursor.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { buildCursorArtifact } from "../../packages/adapter-cursor/src/index.js";
import { loadSkill } from "../../packages/core/src/skill-loader.js";

describe("buildCursorArtifact", () => {
  it("returns a cursor artifact manifest", async () => {
    const skill = await loadSkill("tests/fixtures/using-superpowers");
    const artifact = await buildCursorArtifact({
      skill,
      artifactRoot: ".tmp/cursor/using-superpowers"
    });

    expect(artifact.platform).toBe("cursor");
  });
});
```

- [ ] **Step 9: Run the build and adapter tests to verify they pass**

```bash
npx vitest run tests/core/build.test.ts tests/adapters/codex.test.ts tests/adapters/copilot.test.ts tests/adapters/cursor.test.ts
```

Expected: PASS with four passing tests.

- [ ] **Step 10: Commit the build pipeline**

```bash
git add packages/core/src/build-artifact.ts packages/core/src/build-skill.ts packages/adapter-codex packages/adapter-copilot packages/adapter-cursor tests/core/build.test.ts tests/adapters
git commit -m "feat: add platform build adapters"
```

### Task 5: Implement Install Path Resolution and Installer Flow

**Files:**
- Create: `packages/core/src/locators.ts`
- Create: `packages/core/src/install-skill.ts`
- Create: `tests/core/install.test.ts`
- Test: `tests/core/install.test.ts`

- [ ] **Step 1: Write the failing installer test**

```ts
import { describe, expect, it } from "vitest";
import { resolveInstallPath } from "../../packages/core/src/locators.js";

describe("resolveInstallPath", () => {
  it("returns a project Codex path", async () => {
    const resolved = await resolveInstallPath({
      platform: "codex",
      scope: "project",
      projectRoot: "/repo/demo"
    });

    expect(resolved).toBe("/repo/demo/.codex/skills");
  });
});
```

- [ ] **Step 2: Run the installer test to verify it fails**

```bash
npx vitest run tests/core/install.test.ts
```

Expected: FAIL because the locator module does not exist yet.

- [ ] **Step 3: Implement platform locators**

`packages/core/src/locators.ts`

```ts
import path from "node:path";
import os from "node:os";
import type { Platform } from "./models.js";

export type InstallScope = "global" | "project";

export async function resolveInstallPath(args: {
  platform: Platform;
  scope: InstallScope;
  projectRoot?: string;
}): Promise<string> {
  if (args.scope === "project") {
    if (!args.projectRoot) {
      throw new Error("projectRoot is required for project installs");
    }

    const projectDirs = {
      codex: path.join(args.projectRoot, ".codex", "skills"),
      copilot: path.join(args.projectRoot, ".github", "copilot", "skills"),
      cursor: path.join(args.projectRoot, ".cursor", "skills")
    };

    return projectDirs[args.platform];
  }

  const home = os.homedir();
  const globalDirs = {
    codex: path.join(home, ".codex", "skills"),
    copilot: path.join(home, ".config", "copilot", "skills"),
    cursor: path.join(home, ".cursor", "skills")
  };

  return globalDirs[args.platform];
}
```

- [ ] **Step 4: Implement install orchestration**

`packages/core/src/install-skill.ts`

```ts
import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { buildSkill } from "./build-skill.js";
import { resolveInstallPath, type InstallScope } from "./locators.js";
import type { Platform } from "./models.js";

export async function installSkill(args: {
  skillRoot: string;
  outputRoot: string;
  target: Platform | "all";
  scope: InstallScope;
  projectRoot?: string;
}) {
  const artifacts = await buildSkill({
    skillRoot: args.skillRoot,
    outputRoot: args.outputRoot
  });

  const platforms = args.target === "all" ? Object.keys(artifacts) : [args.target];
  const results = [];

  for (const platform of platforms) {
    const artifact = artifacts[platform];
    const installRoot = await resolveInstallPath({
      platform,
      scope: args.scope,
      projectRoot: args.projectRoot
    });
    const destination = path.join(installRoot, artifact.skillName);
    await mkdir(installRoot, { recursive: true });
    await cp(artifact.artifactPath, destination, { recursive: true, force: true });
    results.push({ platform, destination });
  }

  return results;
}
```

- [ ] **Step 5: Replace the failing test with install path and install summary coverage**

`tests/core/install.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { resolveInstallPath } from "../../packages/core/src/locators.js";

describe("resolveInstallPath", () => {
  it("returns a project Codex path", async () => {
    const resolved = await resolveInstallPath({
      platform: "codex",
      scope: "project",
      projectRoot: "/repo/demo"
    });

    expect(resolved).toBe("/repo/demo/.codex/skills");
  });

  it("returns a global Cursor path suffix", async () => {
    const resolved = await resolveInstallPath({
      platform: "cursor",
      scope: "global"
    });

    expect(resolved.endsWith("/.cursor/skills")).toBe(true);
  });
});
```

- [ ] **Step 6: Run the install tests to verify they pass**

```bash
npx vitest run tests/core/install.test.ts
```

Expected: PASS with two passing tests.

- [ ] **Step 7: Commit the install flow**

```bash
git add packages/core/src/locators.ts packages/core/src/install-skill.ts tests/core/install.test.ts
git commit -m "feat: add install path resolution"
```

### Task 6: Implement the CLI Commands

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/src/index.ts`
- Create: `packages/cli/src/commands/create.ts`
- Create: `packages/cli/src/commands/build.ts`
- Create: `packages/cli/src/commands/install.ts`
- Create: `packages/cli/src/commands/list.ts`
- Test: `npm run build`

- [ ] **Step 1: Create the CLI package manifest**

```json
{
  "name": "@skills/cli",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "skills": "dist/index.js"
  },
  "dependencies": {
    "@skills/core": "0.1.0",
    "commander": "^13.1.0",
    "prompts": "^2.4.2"
  }
}
```

- [ ] **Step 2: Create the CLI TypeScript config**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true
  },
  "include": [
    "src/**/*.ts"
  ]
}
```

- [ ] **Step 3: Implement `skills create`**

`packages/cli/src/commands/create.ts`

```ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import prompts from "prompts";

export async function runCreateCommand(repoRoot: string) {
  const answers = await prompts([
    { type: "text", name: "name", message: "Skill name" },
    { type: "text", name: "title", message: "Skill title" },
    { type: "text", name: "description", message: "Description" },
    { type: "list", name: "triggers", message: "Triggers (comma separated)" },
    { type: "list", name: "tags", message: "Tags (comma separated)" },
    {
      type: "multiselect",
      name: "platforms",
      message: "Platforms",
      choices: [
        { title: "Codex", value: "codex" },
        { title: "Copilot", value: "copilot" },
        { title: "Cursor", value: "cursor" }
      ]
    }
  ]);

  const skillDir = path.join(repoRoot, "skills", answers.name);
  await mkdir(skillDir, { recursive: true });
  await writeFile(
    path.join(skillDir, "skill.yaml"),
    [
      `name: ${answers.name}`,
      `title: ${answers.title}`,
      `description: ${answers.description}`,
      "version: 0.1.0",
      "tags:",
      ...answers.tags.map((tag: string) => `  - ${tag}`),
      "triggers:",
      ...answers.triggers.map((trigger: string) => `  - ${trigger}`),
      "platforms:",
      ...answers.platforms.map((platform: string) => `  - ${platform}`)
    ].join("\n"),
    "utf8"
  );
  await writeFile(path.join(skillDir, "body.md"), `# ${answers.title}\n`, "utf8");
}
```

- [ ] **Step 4: Implement `skills build`, `skills install`, and `skills list`**

`packages/cli/src/commands/build.ts`

```ts
import path from "node:path";
import { buildSkill } from "@skills/core";

export async function runBuildCommand(repoRoot: string, skillName: string) {
  return buildSkill({
    skillRoot: path.join(repoRoot, "skills", skillName),
    outputRoot: path.join(repoRoot, "dist")
  });
}
```

`packages/cli/src/commands/install.ts`

```ts
import path from "node:path";
import { installSkill } from "@skills/core/src/install-skill.js";

export async function runInstallCommand(
  repoRoot: string,
  skillName: string,
  target: "codex" | "copilot" | "cursor" | "all",
  scope: "global" | "project"
) {
  return installSkill({
    skillRoot: path.join(repoRoot, "skills", skillName),
    outputRoot: path.join(repoRoot, "dist"),
    target,
    scope,
    projectRoot: scope === "project" ? repoRoot : undefined
  });
}
```

`packages/cli/src/commands/list.ts`

```ts
import { readdir } from "node:fs/promises";
import path from "node:path";

export async function runListCommand(repoRoot: string) {
  return readdir(path.join(repoRoot, "skills"), { withFileTypes: true }).then((entries) =>
    entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  );
}
```

- [ ] **Step 5: Wire up the CLI entrypoint**

`packages/cli/src/index.ts`

```ts
#!/usr/bin/env node
import path from "node:path";
import { Command } from "commander";
import { runBuildCommand } from "./commands/build.js";
import { runCreateCommand } from "./commands/create.js";
import { runInstallCommand } from "./commands/install.js";
import { runListCommand } from "./commands/list.js";

const program = new Command();
const repoRoot = process.cwd();

program.command("create").action(() => runCreateCommand(repoRoot));

program
  .command("build")
  .argument("<skillName>")
  .action((skillName) => runBuildCommand(repoRoot, skillName));

program
  .command("install")
  .argument("<skillName>")
  .option("--target <target>", "target platform", "all")
  .option("--scope <scope>", "install scope", "global")
  .action((skillName, options) =>
    runInstallCommand(repoRoot, skillName, options.target, options.scope)
  );

program.command("list").action(() => runListCommand(repoRoot).then(console.log));

program.parseAsync(process.argv);
```

- [ ] **Step 6: Run the build to verify the CLI compiles**

```bash
npm run build
```

Expected: PASS with TypeScript emitting compiled output for all workspace packages.

- [ ] **Step 7: Commit the CLI**

```bash
git add packages/cli
git commit -m "feat: add skills cli"
```

### Task 7: Harden Test Coverage and End-to-End Verification

**Files:**
- Modify: `tests/adapters/codex.test.ts`
- Modify: `tests/adapters/copilot.test.ts`
- Modify: `tests/adapters/cursor.test.ts`
- Modify: `tests/core/build.test.ts`
- Modify: `tests/core/install.test.ts`
- Test: `npm test`

- [ ] **Step 1: Upgrade adapter tests to verify generated files**

Append these assertions to each adapter test after the existing manifest checks:

```ts
import { readFile } from "node:fs/promises";

const skillFile = await readFile(".tmp/codex/using-superpowers/SKILL.md", "utf8");
expect(skillFile).toContain("# Using Superpowers");
```

Use equivalent file paths for Copilot and Cursor:

```ts
const copilotFile = await readFile(".tmp/copilot/using-superpowers/README.md", "utf8");
expect(copilotFile).toContain("Invoke relevant or requested skills");
```

```ts
const cursorFile = await readFile(".tmp/cursor/using-superpowers/SKILL.md", "utf8");
expect(cursorFile).toContain("Invoke relevant or requested skills");
```

- [ ] **Step 2: Upgrade the build orchestration test to check all keys explicitly**

Replace the assertion body in `tests/core/build.test.ts` with:

```ts
expect(Object.keys(artifactMap)).toEqual(["codex", "copilot", "cursor"]);
expect(artifactMap.codex.skillName).toBe("using-superpowers");
expect(artifactMap.copilot.skillName).toBe("using-superpowers");
expect(artifactMap.cursor.skillName).toBe("using-superpowers");
```

- [ ] **Step 3: Add an install smoke test for project scope**

Append this test to `tests/core/install.test.ts`:

```ts
import { installSkill } from "../../packages/core/src/install-skill.js";

it("installs a skill into project scope", async () => {
  const results = await installSkill({
    skillRoot: "tests/fixtures/using-superpowers",
    outputRoot: ".tmp/dist",
    target: "codex",
    scope: "project",
    projectRoot: ".tmp/project"
  });

  expect(results[0]?.destination).toBe(".tmp/project/.codex/skills/using-superpowers");
});
```

- [ ] **Step 4: Run the full test suite**

```bash
npm test
```

Expected: PASS with all core and adapter tests green.

- [ ] **Step 5: Run a manual end-to-end CLI check**

```bash
node packages/cli/dist/index.js build using-superpowers
node packages/cli/dist/index.js install using-superpowers --target codex --scope project
```

Expected:

- First command creates `dist/codex/using-superpowers`, `dist/copilot/using-superpowers`, and `dist/cursor/using-superpowers`
- Second command creates `.codex/skills/using-superpowers` under the repo root

- [ ] **Step 6: Commit the verification pass**

```bash
git add tests
git commit -m "test: harden multi-agent skill workflow"
```

## Self-Review

### Spec Coverage Check

- Neutral source format is covered by Task 2 and Task 3.
- Adapter architecture is covered by Task 4.
- Install abstraction is covered by Task 5.
- CLI commands `create`, `build`, `install`, and `list` are covered by Task 6.
- Validation and regression safety are covered by Task 3 and Task 7.

### Placeholder Scan

- No `TODO`, `TBD`, or deferred “implement later” steps remain in this plan.
- Every code-changing step includes explicit file paths and code snippets.
- Every verification step includes a concrete command and expected result.

### Type Consistency Check

- Platforms are consistently named `codex`, `copilot`, and `cursor`.
- Skill loading flows through `loadSkill`, build flows through `buildSkill`, and install flows through `installSkill`.
- Install scope is consistently `global | project`.
