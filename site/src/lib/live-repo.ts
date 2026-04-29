import { parseArchiveSkill } from "./site-data.js"
import { isValidRepoLayout } from "./repo-fs.js"
import type { PublishedSkill } from "./types.js"

async function readTextFile(
  directory: FileSystemDirectoryHandle,
  name: string,
) {
  const handle = await directory.getFileHandle(name)
  const file = await handle.getFile()
  return file.text()
}

async function fileExists(
  directory: FileSystemDirectoryHandle,
  name: string,
) {
  try {
    await directory.getFileHandle(name)
    return true
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "NotFoundError"
    ) {
      return false
    }

    throw error
  }
}

function isDirectoryHandle(
  handle: FileSystemHandle,
): handle is FileSystemDirectoryHandle {
  return handle.kind === "directory"
}

async function scanSkillDirectory(
  skillRoot: FileSystemDirectoryHandle,
): Promise<PublishedSkill[]> {
  if (await fileExists(skillRoot, "skill.yaml")) {
    const [documentSource, body] = await Promise.all([
      readTextFile(skillRoot, "skill.yaml"),
      readTextFile(skillRoot, "body.md"),
    ])

    return [parseArchiveSkill({ documentSource, body })]
  }

  const skills: PublishedSkill[] = []

  for await (const entry of skillRoot.values()) {
    if (!isDirectoryHandle(entry) || !(await fileExists(entry, "skill.yaml"))) {
      continue
    }

    const [documentSource, body] = await Promise.all([
      readTextFile(entry, "skill.yaml"),
      readTextFile(entry, "body.md"),
    ])

    skills.push(parseArchiveSkill({
      documentSource,
      body,
      artifactEntryFile: `${entry.name}/SKILL.md`,
    }))
  }

  return skills
}

export async function scanRepoSkills(
  root: FileSystemDirectoryHandle,
): Promise<PublishedSkill[]> {
  if (!(await isValidRepoLayout(root))) {
    throw new Error("Connected directory is not a valid skill repository.")
  }

  const skillsRoot = await root.getDirectoryHandle("skills")
  const skills: PublishedSkill[] = []

  for await (const entry of skillsRoot.values()) {
    if (!isDirectoryHandle(entry)) {
      continue
    }

    skills.push(...await scanSkillDirectory(entry))
  }

  return skills.sort((left, right) => left.name.localeCompare(right.name))
}
