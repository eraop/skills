import { describe, expect, it } from "vitest";
import { saveSkillDraft } from "../../site/src/lib/workbench-actions.js";

class MemoryFileHandle {
  kind = "file" as const;

  constructor(
    public name: string,
    private contents = "",
    private onWrite?: (value: string) => void,
  ) {}

  async getFile() {
    const text = this.contents;
    return {
      text: async () => text,
    };
  }

  async createWritable() {
    return {
      write: async (value: string) => {
        this.onWrite?.(value);
        this.contents = value;
      },
      close: async () => {},
    };
  }

  read() {
    return this.contents;
  }
}

class MemoryDirectoryHandle {
  kind = "directory" as const;
  private directories = new Map<string, MemoryDirectoryHandle>();
  private files = new Map<string, MemoryFileHandle>();

  constructor(
    public name: string,
    private fileFactory?: (name: string) => MemoryFileHandle,
  ) {}

  async getDirectoryHandle(name: string, options?: { create?: boolean }) {
    const existing = this.directories.get(name);
    if (existing) {
      return existing;
    }

    if (options?.create) {
      const created = new MemoryDirectoryHandle(name, this.fileFactory);
      this.directories.set(name, created);
      return created;
    }

    throw Object.assign(new Error(`Missing directory: ${name}`), {
      name: "NotFoundError",
    });
  }

  async getFileHandle(name: string, options?: { create?: boolean }) {
    const existing = this.files.get(name);
    if (existing) {
      return existing;
    }

    if (options?.create) {
      const created = this.fileFactory?.(name) ?? new MemoryFileHandle(name);
      this.files.set(name, created);
      return created;
    }

    throw Object.assign(new Error(`Missing file: ${name}`), {
      name: "NotFoundError",
    });
  }

  async *values() {
    for (const directory of this.directories.values()) {
      yield directory;
    }

    for (const file of this.files.values()) {
      yield file;
    }
  }

  hasDirectory(name: string) {
    return this.directories.has(name);
  }

  async removeEntry(name: string, options?: { recursive?: boolean }) {
    if (this.files.delete(name)) {
      return;
    }

    if (this.directories.has(name)) {
      if (!options?.recursive) {
        throw new Error(`Directory ${name} requires recursive removal.`);
      }

      this.directories.delete(name);
      return;
    }

    throw Object.assign(new Error(`Missing entry: ${name}`), {
      name: "NotFoundError",
    });
  }

  readFile(name: string) {
    return this.files.get(name)?.read();
  }
}

async function createRepoRoot(fileFactory?: (name: string) => MemoryFileHandle) {
  const root = new MemoryDirectoryHandle("repo", fileFactory);
  await root.getFileHandle("package.json", { create: true });
  await root.getDirectoryHandle("skills", { create: true });
  return root;
}

describe("saveSkillDraft", () => {
  it("rejects drafts that do not satisfy the neutral skill schema", async () => {
    const root = await createRepoRoot();
    const skillsRoot = await root.getDirectoryHandle("skills");

    await expect(
      saveSkillDraft(root as never, {
        name: "frontend-design",
        title: "Frontend Design",
        description: "Create distinctive interfaces.",
        version: "0.1.0",
        tags: [],
        triggers: [],
        platforms: ["codex", "copilot", "cursor"],
        body: "This skill guides creation of distinctive interfaces.",
        sourceMeta: {
          rawFrontmatter: "name: frontend-design",
        },
      }),
    ).rejects.toThrow();

    expect(skillsRoot.hasDirectory("frontend-design")).toBe(false);
  });

  it("preserves platform overrides when saving a parsed draft", async () => {
    const root = await createRepoRoot();
    const skillsRoot = await root.getDirectoryHandle("skills");

    await saveSkillDraft(root as never, {
      name: "frontend-design",
      title: "Frontend Design",
      description: "Create distinctive interfaces.",
      version: "0.1.0",
      tags: [],
      triggers: ["user asks to style a page"],
      platforms: ["codex"],
      platformOverrides: {
        codex: {
          notes: ["Keep this skill visible."],
        },
      },
      body: "This skill guides creation of distinctive interfaces.",
      sourceMeta: {
        rawFrontmatter: "name: frontend-design",
      },
    });

    const draftDir = await skillsRoot.getDirectoryHandle("frontend-design");
    expect(draftDir.readFile("skill.yaml")).toContain("platform_overrides:");
    expect(draftDir.readFile("skill.yaml")).toContain("Keep this skill visible.");
  });

  it("rolls back created files when artifact generation fails mid-save", async () => {
    const root = await createRepoRoot((name) =>
      new MemoryFileHandle(name, "", (value) => {
        if (name === "README.md" && value.includes("Frontend Design")) {
          throw new Error("Simulated artifact write failure.");
        }
      }),
    );
    const skillsRoot = await root.getDirectoryHandle("skills");

    await expect(
      saveSkillDraft(root as never, {
        name: "frontend-design",
        title: "Frontend Design",
        description: "Create distinctive interfaces.",
        version: "0.1.0",
        tags: [],
        triggers: ["user asks to style a page"],
        platforms: ["codex", "copilot", "cursor"],
        body: "This skill guides creation of distinctive interfaces.",
        sourceMeta: {
          rawFrontmatter: "name: frontend-design",
        },
      }),
    ).rejects.toThrow("Simulated artifact write failure.");

    expect(skillsRoot.hasDirectory("frontend-design")).toBe(false);
    await expect(root.getDirectoryHandle("dist")).rejects.toMatchObject({
      name: "NotFoundError",
    });
  });

  it("fails before mutating the repo when residual artifact paths already exist", async () => {
    const root = await createRepoRoot();
    const skillsRoot = await root.getDirectoryHandle("skills");
    const distRoot = await root.getDirectoryHandle("dist", { create: true });
    const codexRoot = await distRoot.getDirectoryHandle("codex", { create: true });
    const artifactRoot = await codexRoot.getDirectoryHandle("frontend-design", {
      create: true,
    });
    const existingArtifact = await artifactRoot.getFileHandle("SKILL.md", {
      create: true,
    });
    const writable = await existingArtifact.createWritable();
    await writable.write("existing artifact contents");
    await writable.close();

    await expect(
      saveSkillDraft(root as never, {
        name: "frontend-design",
        title: "Frontend Design",
        description: "Create distinctive interfaces.",
        version: "0.1.0",
        tags: [],
        triggers: ["user asks to style a page"],
        platforms: ["codex"],
        body: "This skill guides creation of distinctive interfaces.",
        sourceMeta: {
          rawFrontmatter: "name: frontend-design",
        },
      }),
    ).rejects.toThrow();

    expect(skillsRoot.hasDirectory("frontend-design")).toBe(false);
    expect(artifactRoot.readFile("SKILL.md")).toBe("existing artifact contents");
  });
});
