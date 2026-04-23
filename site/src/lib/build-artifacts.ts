import type { SkillDraft, SkillPlatform } from "./skill-schema.js"

type ArtifactOutput = {
  path: string;
  contents: string;
}

export type BuildArtifactsResult = Record<SkillPlatform, ArtifactOutput>

export function buildArtifacts(draft: SkillDraft): BuildArtifactsResult {
  const contents = `# ${draft.title}\n\n${draft.body}`

  return {
    codex: {
      path: `dist/codex/${draft.name}/SKILL.md`,
      contents,
    },
    copilot: {
      path: `dist/copilot/${draft.name}/README.md`,
      contents,
    },
    cursor: {
      path: `dist/cursor/${draft.name}/SKILL.md`,
      contents,
    },
  }
}
