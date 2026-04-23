import { describe, expect, it } from "vitest";
import { saveSkillDraft } from "../../site/src/lib/workbench-actions.js";

class MemoryFileHandle {
  kind = "file" as const;

  constructor(
    public name: string,
    private contents = "",
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

  constructor(public name: string) {}

  async getDirectoryHandle(name: string, options?: { create?: boolean }) {
    const existing = this.directories.get(name);
    if (existing) {
      return existing;
    }

    if (options?.create) {
      const created = new MemoryDirectoryHandle(name);
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
      const created = new MemoryFileHandle(name);
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
}

async function createRepoRoot() {
  const root = new MemoryDirectoryHandle("repo");
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
});
