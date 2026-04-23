export async function isValidRepoLayout(root: FileSystemDirectoryHandle) {
  let hasPackageJson = false;
  let hasSkillsDir = false;

  for await (const entry of root.values()) {
    if (entry.kind === "file" && entry.name === "package.json") {
      hasPackageJson = true;
    }

    if (entry.kind === "directory" && entry.name === "skills") {
      hasSkillsDir = true;
    }
  }

  return hasPackageJson && hasSkillsDir;
}

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

export async function removeDirectoryIfPresent(
  root: FileSystemDirectoryHandle,
  parts: string[],
) {
  const [head, ...rest] = parts;
  if (!head) return;

  if (rest.length === 0) {
    const removableRoot = root as RemovableDirectoryHandle;
    if (typeof removableRoot.removeEntry !== "function") {
      return;
    }

    try {
      await removableRoot.removeEntry(head, { recursive: true });
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }
    }

    return;
  }

  try {
    const next = await root.getDirectoryHandle(head);
    await removeDirectoryIfPresent(next, rest);
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }
  }
}

export async function pickRepoRoot() {
  const pickerWindow = window as unknown as Window & {
    showDirectoryPicker(options: { mode: "readwrite" }): Promise<FileSystemDirectoryHandle>;
  };

  return pickerWindow.showDirectoryPicker({ mode: "readwrite" });
}
