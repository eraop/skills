import { renderSkillMarkdown } from "../../../packages/core/src/render-skill.js"
import type { SkillDraft } from "./skill-schema.js"

type ArtifactOutput = {
  path: string;
  contents: string;
}

export type BuildArtifactsResult = {
  shared: ArtifactOutput;
}

export function buildArtifacts(draft: SkillDraft): BuildArtifactsResult {
  const contents = renderSkillMarkdown({
    document: {
      name: draft.name,
      title: draft.title,
      description: draft.description,
      version: draft.version,
      tags: draft.tags,
      triggers: draft.triggers,
    },
    body: draft.body,
  })

  return {
    shared: {
      path: `dist/${draft.name}/SKILL.md`,
      contents,
    },
  }
}
