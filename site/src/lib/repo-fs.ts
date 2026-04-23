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

export async function pickRepoRoot() {
  const pickerWindow = window as unknown as Window & {
    showDirectoryPicker(options: { mode: "readwrite" }): Promise<FileSystemDirectoryHandle>;
  };

  return pickerWindow.showDirectoryPicker({ mode: "readwrite" });
}
