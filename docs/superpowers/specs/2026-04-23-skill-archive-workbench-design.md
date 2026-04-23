# Skill Archive Workbench Design

Date: 2026-04-23
Status: Draft for review

## Summary

This repository will gain a static frontend that serves two roles from one codebase:

1. A public, read-only skill archive for GitHub Pages.
2. A local workbench that can browse, create, rebuild, and delete skills directly in a selected
   repository root without any backend service.

The archive will present every skill with a dedicated detail page, installation guidance, and
platform artifact visibility. The workbench will let the user paste a complete skill text,
validate it, generate the neutral source files under `skills/<name>/`, and generate Codex,
Copilot, and Cursor artifacts under `dist/<platform>/<name>/`.

The design must not assume a fixed filesystem path such as `/Users/example/skills-repo`. Local
management works only after the user explicitly selects a repository root through the browser's
file system permission flow.

## Goals

- Ship one static frontend that works for both GitHub Pages and local management.
- Keep GitHub Pages strictly read-only.
- Allow local creation and deletion of skills without introducing a backend.
- Allow users to paste one complete skill text instead of manually splitting metadata and body.
- Generate neutral source files and platform build artifacts from the browser in local mode.
- Keep the published site visually distinctive and easy to scan.

## Non-Goals

- No remote write operations from GitHub Pages.
- No authentication system or backend API.
- No automatic git commit, push, or pull request creation from the site.
- No direct execution of the existing Node CLI from the browser.
- No requirement that the repository live in any fixed absolute path.

## Product Boundary

The product owns four responsibilities:

1. Display a browsable archive of all skills.
2. Render a detail view for each skill.
3. Manage local repository files after explicit directory authorization.
4. Generate static data for GitHub Pages publication.

It does not own:

1. Git hosting workflows such as PR creation.
2. Server-side validation or persistence.
3. Secret management.

## User Modes

### Publish Mode

Publish Mode is used on GitHub Pages.

- Reads only static generated data.
- Shows skill archive, detail pages, and installation instructions.
- Hides all mutation controls.
- Requires no repository access and no local permissions.

### Workbench Mode

Workbench Mode is used locally through a browser running on `http://localhost`.

- Starts from the same static site shell.
- Unlocks management features only after the user selects a repository root.
- Uses the browser File System Access API to read and write repository files.
- Uses the selected repository root as the base path for all operations.

### Mode Rules

- The UI never hardcodes a repository path.
- The UI may remember a previously granted directory handle in browser storage, but must validate
  it before reuse.
- If validation fails, the site falls back to Publish Mode and asks the user to reconnect a repo.

## Repository Model

All local file operations are relative to the selected repository root.

Expected repository layout:

```text
selected-repo-root/
  package.json
  skills/
    <skill-name>/
      skill.yaml
      body.md
  dist/
    codex/
    copilot/
    cursor/
```

The site should validate the root by checking for:

- `package.json`
- `skills/`
- optional `dist/` directory, which may be created on demand

## Experience Design

### Visual Direction

The interface should feel like an editorial archive paired with a practical workshop console:

- expressive serif display typography
- precise monospace metadata
- warm paper-like surfaces with ink and signal accents
- strong section framing rather than generic dashboard cards
- clear visual separation between the public archive and the local workbench

### Home Page

The home page contains two conceptual zones:

1. Archive zone
2. Workbench zone

Archive zone responsibilities:

- skill search
- tag and platform filtering
- featured or recent skill callouts
- grid or list of skill cards

Workbench zone responsibilities:

- show current repository connection state
- expose `Add Skill`, `Refresh`, and local-only controls
- explain read-only fallback when no repository is connected

On GitHub Pages, only the archive zone is shown.

### Skill Cards

Each card should surface:

- name
- title
- short description
- tags
- supported platforms
- last-updated indicator when available

Cards link to a detail page for the selected skill.

### Detail Page

Each skill detail page contains four sections:

1. Metadata summary
2. Rendered skill body
3. Installation guide
4. Local management tools when Workbench Mode is active

Metadata summary includes:

- name
- title
- description
- version
- tags
- triggers
- platforms

Installation guide includes:

- source file locations
- generated artifact locations
- platform-specific output names such as `SKILL.md` or `README.md`

Local management tools include:

- rebuild
- delete
- validation report

These controls must not appear in Publish Mode.

## Routing Strategy

The site will use hash routing so that it works on GitHub Pages without server rewrites.

Primary routes:

- `#/` for the archive home page
- `#/skill/<name>` for the skill detail page
- `#/local/new` for the add-skill flow when useful as a dedicated route

Modal or drawer state may still be used for local creation, but all important views should have a
stable route when it improves refresh safety or linking.

## Technical Stack

The frontend should be implemented as a lightweight static app inside this repository.

Recommended stack:

- Vite
- TypeScript
- native CSS
- a markdown renderer such as `marked`

The design intentionally avoids a backend and avoids depending on the existing Node CLI at runtime.

## Proposed File Structure

```text
site/
  index.html
  public/
    data/
      skills.json
  src/
    main.ts
    app.ts
    router.ts
    styles.css
    components/
    pages/
      home.ts
      detail.ts
      not-found.ts
    lib/
      mode.ts
      markdown.ts
      skill-parser.ts
      skill-schema.ts
      repo-fs.ts
      build-artifacts.ts
scripts/
  generate-site-data.ts
```

## Data Sources

### Published Data

GitHub Pages reads from a generated static index file:

- `site/public/data/skills.json`

This file should contain enough information to render the archive and detail pages without reading
repository source files at runtime.

Suggested fields per skill:

- `name`
- `title`
- `description`
- `version`
- `tags`
- `triggers`
- `platforms`
- `body`
- `bodyExcerpt`
- `artifacts`

### Local Data

Workbench Mode reads directly from the selected repository root and uses live repository files as
the source of truth.

Priority rules:

1. If a valid repository handle is connected, read live repository data.
2. Otherwise, fall back to `skills.json`.

## Local Repository Access

Workbench Mode uses the File System Access API.

Connection flow:

1. User clicks `Select Skill Repo`.
2. Browser prompts for a directory.
3. The app validates the selected directory structure.
4. The app stores the directory handle in browser storage when allowed.
5. The app scans live skills and enables local controls.

Compatibility assumptions:

- Local management requires a Chromium-based browser.
- Local management should run from `http://localhost`, not `file://`.

## Skill Input Model

The add-skill experience accepts one complete pasted skill text. The user should not need to
manually prepare `skill.yaml` and `body.md`.

Supported input shape should include wrapped skill text such as:

```text
<skill>
<name>frontend-design</name>
<path>/some/path/SKILL.md</path>
---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality.
platforms:
  - codex
  - copilot
  - cursor
---
This skill guides creation of distinctive, production-grade frontend interfaces.
</skill>
```

The parser should tolerate optional wrapper metadata and focus on extracting the meaningful skill
content.

### Parsed Draft Model

Before writing files, the app converts raw input into a parsed draft object containing:

- `name`
- `title`
- `description`
- `version`
- `tags`
- `triggers`
- `platforms`
- `body`
- `sourceMeta`

## Validation Rules

The app validates pasted input before saving.

Required checks:

1. `name` exists.
2. `name` matches the repository schema pattern: lowercase letters, digits, and hyphens only.
3. `description` exists.
4. `body` exists after wrapper removal.
5. `platforms` are valid when provided.
6. duplicate skill names are rejected.
7. the selected repository root still passes structural validation.

Defaulting behavior:

- `version` defaults to `0.1.0` if absent.
- `platforms` default to `codex`, `copilot`, and `cursor` if absent.
- missing optional fields such as `tags` default to empty arrays.

## Neutral Skill Generation

After validation, the app writes:

- `skills/<name>/skill.yaml`
- `skills/<name>/body.md`

The generated `skill.yaml` must conform to the repository schema already used by the toolchain.

Example output:

```yaml
name: "frontend-design"
title: "Frontend Design"
description: "Create distinctive, production-grade frontend interfaces."
version: "0.1.0"
tags:
  - "design"
triggers:
  - "user asks to build or style UI"
platforms:
  - "codex"
  - "copilot"
  - "cursor"
```

`body.md` contains only the actual skill body and excludes any outer `<skill>` wrapper.

## Platform Artifact Generation

The local workbench should replicate the current adapter behavior in browser code rather than
trying to invoke the Node CLI.

Generated outputs:

### Codex

- path: `dist/codex/<name>/SKILL.md`
- content:

```md
# <title>

<body>
```

### Cursor

- path: `dist/cursor/<name>/SKILL.md`
- content matches Codex output structure

### Copilot

- path: `dist/copilot/<name>/README.md`
- content:

```md
# <title>

<body>
```

The workbench may later add manifest-level metadata displays, but the initial release only needs
to match the repository's current artifact output behavior.

## Create Flow

1. User clicks `Add Skill`.
2. The app opens a large local-only editor drawer or view.
3. User pastes the full skill text.
4. The app parses and validates input in real time.
5. The UI previews extracted metadata and body.
6. User clicks `Save and Build`.
7. The app writes neutral source files.
8. The app generates platform artifacts.
9. The app refreshes the live archive and navigates to the new skill detail page.

## Delete Flow

Delete is local-only and requires explicit confirmation.

When confirmed, the app removes:

- `skills/<name>/`
- `dist/codex/<name>/`
- `dist/copilot/<name>/`
- `dist/cursor/<name>/`

The UI should list the exact directories that will be deleted before the final confirmation.

## Refresh and Rebuild

### Refresh

Refresh rescans the connected repository root and updates the in-memory skill list without
reloading the page.

### Rebuild

Rebuild regenerates the selected skill's platform artifacts from the current source files.

## Error Handling

The UI should present errors in plain language and keep the user in control.

Important cases:

- repository root missing required directories
- browser does not support File System Access API
- pasted skill text cannot be parsed
- duplicate skill name
- write failure while generating source files
- write failure while generating platform artifacts

If local management is unavailable, the site should still function as a read-only archive.

## Accessibility and Responsiveness

- The site must work on desktop and mobile for archive browsing.
- Workbench controls should remain usable on laptop screens.
- Keyboard navigation should be supported for search, card selection, dialogs, and the add-skill
  flow.
- Color contrast should remain strong despite the editorial styling.

## Build and Publication Flow

The frontend should be added to this repository and published as static assets.

Suggested flow:

1. Generate `site/public/data/skills.json` from repository skill sources.
2. Build the static frontend.
3. Publish the built site to GitHub Pages.

Local updates follow a separate flow:

1. Run the site locally.
2. Connect a repository root.
3. Create or delete skills locally.
4. Review resulting file changes.
5. Commit and open a PR manually.

## Implementation Strategy

Build the feature in five phases:

1. Read-only archive with generated `skills.json`.
2. Local repository connection and live skill scanning.
3. Add-skill flow with parser and validation.
4. Local browser-side artifact generation.
5. Delete flow and final UX polish.

This ordering ensures the public archive is useful early while keeping local mutation features
incremental and testable.

## Open Questions Resolved By This Design

- Repository path handling: resolved by explicit directory selection rather than hardcoded paths.
- GitHub Pages writes: intentionally unsupported.
- Local create/delete without backend: supported through the File System Access API.
- Platform artifact generation in local mode: implemented in browser code to match current adapter
  output.

## Acceptance Criteria

- GitHub Pages can display all skills from static generated data.
- Every skill has a detail page with metadata, rendered body, and install guidance.
- Local mode can connect to an arbitrary valid repository root selected by the user.
- Pasting one complete skill text can produce `skill.yaml`, `body.md`, and all three platform
  artifacts.
- Delete removes the source directory and all generated artifact directories for the selected skill.
- No backend service is required for any supported flow.
