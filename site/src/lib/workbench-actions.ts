import YAML from "yaml"
import { buildArtifacts, type BuildArtifactsResult } from "./build-artifacts.js"
import { isValidRepoLayout } from "./repo-fs.js"
import type { SkillDraft } from "./skill-schema.js"

async function writeTextFile(
  directory: FileSystemDirectoryHandle,
  name: string,
  contents: string,
) {
  const fileHandle = await directory.getFileHandle(name, { create: true })
  const writable = await fileHandle.createWritable()

  try {
    await writable.write(contents)
  } finally {
    await writable.close()
  }
}

async function writeArtifactFile(
  root: FileSystemDirectoryHandle,
  artifact: { path: string; contents: string },
) {
  const segments = artifact.path.split("/")
  const fileName = segments.pop()
  if (!fileName) {
    throw new Error("Artifact path must include a file name.")
  }

  let directory = root
  for (const segment of segments) {
    directory = await directory.getDirectoryHandle(segment, { create: true })
  }

  await writeTextFile(directory, fileName, artifact.contents)
}

async function assertSkillDoesNotExist(
  skillsRoot: FileSystemDirectoryHandle,
  name: string,
) {
  try {
    await skillsRoot.getDirectoryHandle(name)
    throw new Error(`Skill "${name}" already exists.`)
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") {
      return
    }

    throw error
  }
}

export async function saveSkillDraft(
  root: FileSystemDirectoryHandle,
  draft: SkillDraft,
): Promise<BuildArtifactsResult> {
  if (!(await isValidRepoLayout(root))) {
    throw new Error("Connected directory is not a valid skill repository.")
  }

  const skillsRoot = await root.getDirectoryHandle("skills")
  await assertSkillDoesNotExist(skillsRoot, draft.name)

  const draftDir = await skillsRoot.getDirectoryHandle(draft.name, { create: true })
  const skillYaml = YAML.stringify({
    name: draft.name,
    title: draft.title,
    description: draft.description,
    version: draft.version,
    tags: draft.tags,
    triggers: draft.triggers,
    platforms: draft.platforms,
  })

  await writeTextFile(draftDir, "skill.yaml", skillYaml)
  await writeTextFile(draftDir, "body.md", draft.body)

  const artifacts = buildArtifacts(draft)
  for (const platform of draft.platforms) {
    await writeArtifactFile(root, artifacts[platform])
  }

  return artifacts
}
