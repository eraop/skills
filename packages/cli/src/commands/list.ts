import { readdir } from "node:fs/promises";
import path from "node:path";

export async function runListCommand(repoRoot: string) {
  return readdir(path.join(repoRoot, "skills"), { withFileTypes: true }).then((entries) =>
    entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  );
}
