import { describe, expect, it } from "vitest";
import {
  deleteSkill,
  rebuildSkill,
  saveSkillDraft,
} from "../../site/src/lib/workbench-actions.js";

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

async function saveFrontendDesign(
  root: MemoryDirectoryHandle,
  overrides: Partial<Parameters<typeof saveSkillDraft>[1]> = {},
) {
  await saveSkillDraft(root as never, {
    name: "frontend-design",
    title: "Frontend Design",
    description: "Create distinctive interfaces.",
    version: "0.1.0",
    tags: [],
    triggers: ["user asks to style a page"],
    body: "This skill guides creation of distinctive interfaces.",
    sourceMeta: {
      rawFrontmatter: "name: frontend-design",
    },
    ...overrides,
  });
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
        body: "This skill guides creation of distinctive interfaces.",
        sourceMeta: {
          rawFrontmatter: "name: frontend-design",
        },
      }),
    ).rejects.toThrow();

    expect(skillsRoot.hasDirectory("frontend-design")).toBe(false);
  });

  it("rolls back created files when artifact generation fails mid-save", async () => {
    const root = await createRepoRoot((name) =>
      new MemoryFileHandle(name, "", (value) => {
        if (name === "SKILL.md" && value.includes("Frontend Design")) {
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
    const artifactRoot = await distRoot.getDirectoryHandle("frontend-design", {
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
        body: "This skill guides creation of distinctive interfaces.",
        sourceMeta: {
          rawFrontmatter: "name: frontend-design",
        },
      }),
    ).rejects.toThrow();

    expect(skillsRoot.hasDirectory("frontend-design")).toBe(false);
    expect(artifactRoot.readFile("SKILL.md")).toBe("existing artifact contents");
  });

  it("fails before mutating the repo when the shared artifact path already exists", async () => {
    const root = await createRepoRoot();
    const skillsRoot = await root.getDirectoryHandle("skills");
    const distRoot = await root.getDirectoryHandle("dist", { create: true });
    const artifactRoot = await distRoot.getDirectoryHandle("frontend-design", {
      create: true,
    });
    const existingArtifact = await artifactRoot.getFileHandle("SKILL.md", {
      create: true,
    });
    const writable = await existingArtifact.createWritable();
    await writable.write("existing shared artifact");
    await writable.close();

    await expect(
      saveSkillDraft(root as never, {
        name: "frontend-design",
        title: "Frontend Design",
        description: "Create distinctive interfaces.",
        version: "0.1.0",
        tags: [],
        triggers: ["user asks to style a page"],
        body: "This skill guides creation of distinctive interfaces.",
        sourceMeta: {
          rawFrontmatter: "name: frontend-design",
        },
      }),
    ).rejects.toThrow();

    expect(skillsRoot.hasDirectory("frontend-design")).toBe(false);
    expect(artifactRoot.readFile("SKILL.md")).toBe("existing shared artifact");
  });
});

describe("deleteSkill", () => {
  it("removes the skill source and generated artifact", async () => {
    const root = await createRepoRoot();
    await saveFrontendDesign(root);

    await deleteSkill(root as never, "frontend-design");

    const skillsRoot = await root.getDirectoryHandle("skills");
    const distRoot = await root.getDirectoryHandle("dist");

    await expect(skillsRoot.getDirectoryHandle("frontend-design")).rejects.toMatchObject({
      name: "NotFoundError",
    });
    await expect(distRoot.getDirectoryHandle("frontend-design")).rejects.toMatchObject({
      name: "NotFoundError",
    });
  });
});

describe("rebuildSkill", () => {
  it("recreates the saved skill and replaces the shared artifact", async () => {
    const root = await createRepoRoot();
    await saveFrontendDesign(root);

    await rebuildSkill(root as never, {
      name: "frontend-design",
      title: "Frontend Design",
      description: "Rebuilds the live skill from scanned content.",
      version: "0.2.0",
      tags: ["ui"],
      triggers: ["user asks to rebuild a skill"],
      body: "This rebuilt skill only targets Codex.",
      bodyExcerpt: "This rebuilt skill only targets Codex.",
      artifacts: [{ entryFile: "SKILL.md" }],
    });

    const skillsRoot = await root.getDirectoryHandle("skills");
    const distRoot = await root.getDirectoryHandle("dist");
    const draftDir = await skillsRoot.getDirectoryHandle("frontend-design");
    const artifactRoot = await distRoot.getDirectoryHandle("frontend-design");

    expect(draftDir.readFile("skill.yaml")).toContain("version: 0.2.0");
    expect(draftDir.readFile("body.md")).toBe("This rebuilt skill only targets Codex.");
    expect(artifactRoot.readFile("SKILL.md")).toContain("Frontend Design");
    expect(artifactRoot.readFile("SKILL.md")).toContain("user asks to rebuild a skill");
  });

});
