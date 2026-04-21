import os from "node:os";
import path from "node:path";
import type { Platform } from "./models.js";

export type InstallScope = "global" | "project";

export async function resolveInstallPath(args: {
  platform: Platform;
  scope: InstallScope;
  projectRoot?: string;
}): Promise<string> {
  if (args.scope === "project") {
    if (!args.projectRoot) {
      throw new Error("projectRoot is required for project installs");
    }

    const projectDirs: Record<Platform, string> = {
      codex: path.join(args.projectRoot, ".codex", "skills"),
      copilot: path.join(args.projectRoot, ".github", "copilot", "skills"),
      cursor: path.join(args.projectRoot, ".cursor", "skills")
    };

    return projectDirs[args.platform];
  }

  const home = os.homedir();
  const globalDirs: Record<Platform, string> = {
    codex: path.join(home, ".codex", "skills"),
    copilot: path.join(home, ".config", "copilot", "skills"),
    cursor: path.join(home, ".cursor", "skills")
  };

  return globalDirs[args.platform];
}
