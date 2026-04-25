import YAML from "yaml"
import { parseSkillDocument } from "../../../packages/core/src/schema.js"
import { buildArtifacts, type BuildArtifactsResult } from "./build-artifacts.js"
import { isValidRepoLayout, removeDirectoryIfPresent } from "./repo-fs.js"
import type { SkillDraft } from "./skill-schema.js"
import type { PublishedSkill } from "./types.js"

function isNotFoundError(error: unknown) {
  return (
    (typeof DOMException !== "undefined" &&
      error instanceof DOMException &&
      error.name === "NotFoundError") ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "NotFoundError")
  )
}

type RemovableDirectoryHandle = FileSystemDirectoryHandle & {
  removeEntry?: (name: string, options?: { recursive?: boolean }) => Promise<void>;
}

type CreatedEntry = {
  parent: RemovableDirectoryHandle;
  name: string;
}

async function removeEntryIfPresent(
  parent: RemovableDirectoryHandle,
  name: string,
  options?: { recursive?: boolean },
) {
  if (typeof parent.removeEntry !== "function") {
    return
  }

  try {
    await parent.removeEntry(name, options)
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error
    }
  }
}

async function rollbackCreatedEntries(entries: CreatedEntry[]) {
  for (const entry of [...entries].reverse()) {
    await removeEntryIfPresent(entry.parent, entry.name, { recursive: true })
  }
}

async function ensureDirectory(
  parent: RemovableDirectoryHandle,
  name: string,
  createdEntries: CreatedEntry[],
) {
  try {
    return await parent.getDirectoryHandle(name)
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error
    }

    const created = await parent.getDirectoryHandle(name, { create: true })
    createdEntries.push({ parent, name })
    return created
  }
}

async function directoryExists(
  parent: FileSystemDirectoryHandle,
  name: string,
) {
  try {
    await parent.getDirectoryHandle(name)
    return true
  } catch (error) {
    if (isNotFoundError(error)) {
      return false
    }

    throw error
  }
}

async function fileExists(
  parent: FileSystemDirectoryHandle,
  name: string,
) {
  try {
    await parent.getFileHandle(name)
    return true
  } catch (error) {
    if (isNotFoundError(error)) {
      return false
    }

    throw error
  }
}

async function getExistingParentDirectory(
  root: FileSystemDirectoryHandle,
  segments: string[],
) {
  let directory = root

  for (const segment of segments) {
    try {
      directory = await directory.getDirectoryHandle(segment)
    } catch (error) {
      if (isNotFoundError(error)) {
        return null
      }

      throw error
    }
  }

  return directory
}

async function assertArtifactTargetsDoNotExist(
  root: FileSystemDirectoryHandle,
  artifacts: Array<BuildArtifactsResult[keyof BuildArtifactsResult]>,
) {
  for (const artifact of artifacts) {
    const segments = artifact.path.split("/")
    const fileName = segments.pop()
    const artifactDirectoryName = segments.pop()

    if (!fileName || !artifactDirectoryName) {
      throw new Error("Artifact path must include a directory and file name.")
    }

    const parentDirectory = await getExistingParentDirectory(root, segments)
    if (!parentDirectory) {
      continue
    }

    if (await directoryExists(parentDirectory, artifactDirectoryName)) {
      throw new Error(`Artifact target "${artifact.path}" already exists. Clean it up before saving.`)
    }

    if (await fileExists(parentDirectory, fileName)) {
      throw new Error(`Artifact target "${artifact.path}" already exists. Clean it up before saving.`)
    }
  }
}

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
  root: RemovableDirectoryHandle,
  artifact: { path: string; contents: string },
  createdEntries: CreatedEntry[],
) {
  const segments = artifact.path.split("/")
  const fileName = segments.pop()
  if (!fileName) {
    throw new Error("Artifact path must include a file name.")
  }

  let directory: RemovableDirectoryHandle = root
  for (const segment of segments) {
    directory = await ensureDirectory(directory, segment, createdEntries)
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
    if (isNotFoundError(error)) {
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

  const document = parseSkillDocument({
    name: draft.name,
    title: draft.title,
    description: draft.description,
    version: draft.version,
    tags: draft.tags,
    triggers: draft.triggers,
  })
  const artifacts = buildArtifacts(draft)
  await assertArtifactTargetsDoNotExist(
    root,
    Object.values(artifacts),
  )
  const skillYaml = YAML.stringify(document)
  const createdEntries: CreatedEntry[] = []
  const draftDir = await ensureDirectory(
    skillsRoot as RemovableDirectoryHandle,
    draft.name,
    createdEntries,
  )

  try {
    await writeTextFile(draftDir, "skill.yaml", skillYaml)
    await writeTextFile(draftDir, "body.md", draft.body)

    for (const artifact of Object.values(artifacts)) {
      await writeArtifactFile(root as RemovableDirectoryHandle, artifact, createdEntries)
    }

    return artifacts
  } catch (error) {
    await rollbackCreatedEntries(createdEntries)
    throw error
  }
}

export async function deleteSkill(
  root: FileSystemDirectoryHandle,
  name: string,
) {
  await Promise.all([
    removeDirectoryIfPresent(root, ["skills", name]),
    removeDirectoryIfPresent(root, ["dist", name]),
  ])
}

export async function rebuildSkill(
  root: FileSystemDirectoryHandle,
  skill: PublishedSkill,
) {
  await deleteSkill(root, skill.name)

  return saveSkillDraft(root, {
    name: skill.name,
    title: skill.title,
    description: skill.description,
    version: skill.version,
    tags: [...skill.tags],
    triggers: [...skill.triggers],
    body: skill.body,
    sourceMeta: {
      rawFrontmatter: `name: ${skill.name}`,
    },
  })
}
