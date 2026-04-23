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

function isDirectoryHandle(
  handle: FileSystemHandle,
): handle is FileSystemDirectoryHandle {
  return handle.kind === "directory"
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

    const [documentSource, body] = await Promise.all([
      readTextFile(entry, "skill.yaml"),
      readTextFile(entry, "body.md"),
    ])

    skills.push(parseArchiveSkill({ documentSource, body }))
  }

  return skills.sort((left, right) => left.name.localeCompare(right.name))
}
