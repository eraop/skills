# Multi-Agent Skill Toolchain Design

Date: 2026-04-20
Status: Draft for review

## Summary

This repository will become a multi-agent skill toolchain rather than a passive document store.
It will provide one neutral source format for authoring skills, generate platform-specific
artifacts for Codex, Copilot, and Cursor, and install a selected skill into global or
project-local destinations with a single command.

The first milestone is a narrow, complete workflow:

1. Create a skill through an interactive CLI.
2. Store the skill in a neutral source format.
3. Build platform-specific artifacts for Codex, Copilot, and Cursor.
4. Install a selected skill into global or project scope.
5. Validate outputs with schema checks and snapshot tests.

## Goals

- Keep one source of truth per skill.
- Support interactive skill creation.
- Support Codex, Copilot, and Cursor in the first release.
- Support both global and project-local installation targets.
- Keep the architecture small enough to evolve safely.

## Non-Goals

- Publishing to a remote registry in the first release.
- Full automatic semantic rewriting of skill bodies per platform.
- Dependency management between skills in the first release.
- Runtime agent orchestration beyond file generation and installation.

## Product Boundary

The toolchain owns three responsibilities:

1. Authoring: create and maintain a neutral skill source.
2. Adaptation: generate platform-specific artifacts from that source.
3. Installation: copy or sync a selected skill into the correct platform location.

It does not try to become a package registry, a cloud sync service, or a general automation
framework in the first version.

## Repository Layout

```text
skills/
  packages/
    cli/
    core/
    adapter-codex/
    adapter-copilot/
    adapter-cursor/
  skills/
    <skill-name>/
      skill.yaml
      body.md
      assets/
      references/
  dist/
    codex/
    copilot/
    cursor/
  docs/
    superpowers/
      specs/
```

### Layout Rules

- `skills/<skill-name>/` contains only source files that humans maintain.
- `dist/` contains generated artifacts and can be rebuilt at any time.
- `packages/core` holds the neutral schema, validation, path rules, and shared abstractions.
- Each adapter package is responsible only for one platform.

## Neutral Skill Model

Each skill is split into:

1. `skill.yaml` for structured metadata.
2. `body.md` for the main skill content.

### Suggested `skill.yaml` fields

```yaml
name: code-generation-guardrails
title: Code Generation Guardrails
description: Keep generated code simple, consistent, and narrowly scoped.
version: 0.1.0
tags:
  - workflow
triggers:
  - write code
platforms:
  - codex
  - copilot
  - cursor
platform_overrides:
  codex: {}
  copilot: {}
  cursor: {}
```

### Model Constraints

- `name` must be stable and filesystem-safe.
- `body.md` remains the primary content source for all platforms.
- `platform_overrides` may adjust limited metadata or platform notes, but must not replace the
  full body with unrelated content.
- Assets and references are optional and are copied only when a platform artifact needs them.

## CLI Surface

The initial CLI exposes four commands:

### `skills create`

Interactive authoring flow that asks for:

- `name`
- `title`
- `description`
- `triggers`
- `tags`
- enabled target platforms

Output:

- `skills/<name>/skill.yaml`
- `skills/<name>/body.md`
- optional supporting directories

This command creates source files only. It does not write platform artifacts directly.

### `skills build [skill-name]`

Builds one skill or all skills into platform-specific outputs under `dist/`.

Behavior:

- Loads source files.
- Validates the neutral model.
- Runs the requested adapters.
- Writes build artifacts to `dist/<platform>/...`.

### `skills install <skill-name>`

Installs a skill into one or more platform destinations.

Supported options:

- `--target codex|copilot|cursor|all`
- `--scope global|project`
- `--from local|dist`

Default behavior:

- target all supported platforms
- install to global scope
- auto-build if no current artifact exists

### `skills list`

Lists available skills and their key metadata:

- name
- version
- supported platforms
- build status

## Adaptation Architecture

The system is split into two extension points:

1. Adapters decide how a neutral skill becomes a platform artifact.
2. Installers decide where that artifact is placed.

```text
neutral skill -> adapter -> platform artifact -> installer -> target location
```

### Adapter Interface

```ts
interface SkillAdapter {
  platform: "codex" | "copilot" | "cursor";
  build(skill: NeutralSkill, ctx: BuildContext): Promise<BuildArtifact>;
}
```

### Installer Interface

```ts
interface SkillInstaller {
  platform: "codex" | "copilot" | "cursor";
  resolveInstallPath(scope: "global" | "project", ctx: InstallContext): Promise<string>;
  install(artifact: BuildArtifact, ctx: InstallContext): Promise<InstallResult>;
}
```

### Artifact Contract

Each `BuildArtifact` should include:

- `platform`
- `skillName`
- `artifactPath`
- `manifest`
- `installHints`

This keeps CLI behavior generic and isolates platform differences inside adapter and installer
implementations.

## Platform Strategy

The first release will adapt each skill in a conservative way.

### Included in scope

- Generate platform-specific directory structures.
- Map neutral metadata into platform-specific headers or manifests.
- Generate platform-oriented install notes where useful.
- Apply small `platform_overrides` patches for allowed fields.

### Excluded from scope

- Automatic full-body semantic rewrites.
- Aggressive tool-name translation inside the body.
- Divergent full-content branches per platform.

This keeps the neutral source trustworthy and reduces hidden drift between platforms.

## Installation Strategy

Each platform owns its install path rules behind a locator abstraction:

```ts
interface PlatformLocator {
  getGlobalSkillDir(): Promise<string>;
  getProjectSkillDir(projectRoot: string): Promise<string>;
}
```

The CLI coordinates:

1. resolving project root when needed
2. selecting global or project scope
3. ensuring target directories exist
4. reporting results per platform

Installation should be non-destructive by default. The tool should update the selected skill
artifact without blindly deleting unrelated files in the destination.

## User Experience

### Create flow

The create command should be short and predictable:

1. Collect core metadata.
2. Select target platforms.
3. Collect trigger hints.
4. Generate editable source files.
5. Show next steps such as `skills build <name>` or `skills install <name>`.

### Install flow

The common happy path should be:

```bash
skills install code-generation-guardrails
```

Expected behavior:

- auto-build if needed
- install to all enabled platforms by default
- default to global scope
- skip unsupported or unresolved platforms with clear messaging
- print a per-platform result summary with resolved target paths

Power users can narrow the action with flags such as:

```bash
skills install code-generation-guardrails --target codex --scope project
```

## Validation, Versioning, and Testing

### Versioning

Each skill carries an independent `version` field in `skill.yaml`.

### Validation

`skills build` should fail fast on schema or filesystem problems, including:

- missing required fields
- invalid skill names
- missing referenced files
- invalid override keys

### Testing

The first release should include:

- schema validation tests
- adapter snapshot tests
- installer path resolution tests
- fixture skills used as regression samples

`code-generation-guardrails` is a good initial fixture because it already represents a realistic skill.

## Error Handling

The CLI should distinguish between:

- authoring errors, such as invalid metadata
- build errors, such as adapter failures
- install errors, such as unresolved target directories

Preferred behavior:

- fail fast for invalid source files
- continue per platform where safe during install
- return a clear summary of successes, skips, and failures

## Recommended Implementation Phases

### Phase 1

- set up workspace structure
- implement neutral schema and validation
- implement `skills create`

### Phase 2

- implement adapter contracts
- implement Codex, Copilot, and Cursor build outputs
- implement `skills build`

### Phase 3

- implement installer contracts and platform locators
- implement `skills install`
- implement `skills list`

### Phase 4

- add tests, fixtures, and snapshot coverage
- improve logs and install summaries

## Open Assumptions

- The repository will use Node.js for the CLI and shared tooling.
- The first supported platforms are Codex, Copilot, and Cursor only.
- Platform-specific notes may exist, but the main body remains neutral.
- Global and project-local install paths will be resolved by per-platform locators.

## Acceptance Criteria for the First Release

The first release is successful when:

1. A new skill can be created interactively.
2. The generated source files can be built into Codex, Copilot, and Cursor artifacts.
3. A selected skill can be installed into global or project scope.
4. Validation catches malformed skill sources before build output is written.
5. Snapshot tests protect the generated platform structures from accidental drift.
