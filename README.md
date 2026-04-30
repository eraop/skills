# Skills

This repository maintains reusable agent skills as source files, builds them into
portable `SKILL.md` artifacts, and publishes a small site plus a remote installer.

## Install a Skill

Install the default English version globally:

```bash
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails
```

Install the Chinese version:

```bash
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails --lang zh
```

Install into the current project instead of the global agent directory:

```bash
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails --scope project
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails --scope project --lang zh
```

Always pass the base skill name, such as `code-generation-guardrails`. Do not pass
localized artifact names such as `code-generation-guardrails-zh`; use `--lang zh`
instead.

Supported installer options:

| Option | Default | Description |
| --- | --- | --- |
| <code>--scope global&#124;project</code> | `global` | Choose the install destination. |
| <code>--lang en&#124;zh</code> | `en` | Choose the language version. |

## Install Locations

Global installs are written to:

```text
~/.agents/skills/<skill-name>
```

Project installs are written to:

```text
.agents/skills/<skill-name>
```

The destination folder name comes from the generated `SKILL.md` frontmatter. For
example, the Chinese artifact currently installs as
`.agents/skills/code-generation-guardrails-zh`.

## How the Remote Installer Works

The installer tries sources in this order:

1. `dist/<skill-name>/<lang>/SKILL.md`
2. `skills/<skill-name>/skill.yaml` plus `skills/<skill-name>/body.md`
3. `site/public/data/skills.json`

The preferred path is the prebuilt `dist/` artifact. That means the root `dist/`
directory is part of the published output and should be committed when skill
content changes.

## Repository Structure

```text
skills/
  skills/
    <skill-name>/
      en/
        skill.yaml
        body.md
      zh/
        skill.yaml
        body.md
  dist/
    <skill-name>/
      en/SKILL.md
      zh/SKILL.md
  scripts/
    install.mjs
    build-all-skills.ts
    generate-site-data.ts
  site/
    src/
    public/data/skills.json
  packages/
    cli/
    core/
```

Most content edits happen in `skills/<skill-name>/<lang>/skill.yaml` and
`skills/<skill-name>/<lang>/body.md`.

## Build

Build all skill artifacts:

```bash
npm run skills:build
```

Generate site data and build the site:

```bash
npm run site:build
```

Start the local site:

```bash
npm run site:dev
```

The generated files are:

| Artifact | Example |
| --- | --- |
| English skill | `dist/code-generation-guardrails/en/SKILL.md` |
| Chinese skill | `dist/code-generation-guardrails/zh/SKILL.md` |
| Site data | `site/public/data/skills.json` |

## Git Hook

This repo includes a pre-commit hook that runs:

```bash
npm run skills:build
git add dist
```

Install the hook once after cloning:

```bash
npm run hooks:install
```

The `prepare` script also attempts to configure the hook automatically during
dependency installation.

## Create a Skill

Build the packages first if the CLI has not been compiled:

```bash
npm run build
```

Create a new skill:

```bash
node packages/cli/dist/index.js create
```

For multilingual skills, keep each language in its own directory:

```text
skills/<skill-name>/en/skill.yaml
skills/<skill-name>/en/body.md
skills/<skill-name>/zh/skill.yaml
skills/<skill-name>/zh/body.md
```

Minimal `skill.yaml` example:

```yaml
name: code-generation-guardrails
title: Code Generation Guardrails
description: Keep generated code simple, consistent, and narrowly scoped.
version: 0.1.0
tags:
  - workflow
triggers:
  - user asks to start a code generation task
```

## Common Commands

```bash
# Type-check the workspace
npm run lint

# Run tests
npm test

# Build package outputs
npm run build

# Build all SKILL.md artifacts
npm run skills:build

# Build the public site
npm run site:build

# Start the local site
npm run site:dev
```

## Troubleshooting

If a remote install cannot find a skill, make sure the matching
`dist/<skill-name>/<lang>/SKILL.md` file exists on the `main` branch.

If the installed agent does not detect the skill, confirm that you installed to
the intended scope and restart the agent so it rescans `.agents/skills`.
