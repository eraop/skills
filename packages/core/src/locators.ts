import os from "node:os";
import path from "node:path";

export type InstallScope = "global" | "project";

export async function resolveInstallPath(args: {
  scope: InstallScope;
  projectRoot?: string;
  home?: string;
}): Promise<string> {
  if (args.scope === "project") {
    if (!args.projectRoot) {
      throw new Error("projectRoot is required for project installs");
    }

    return path.join(args.projectRoot, ".agents", "skills");
  }

  const home = args.home ?? os.homedir();
  return path.join(home, ".agents", "skills");
}
