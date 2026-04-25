import { describe, expect, it } from "vitest";
import { scanRepoSkills } from "../../site/src/lib/live-repo.js";

class MemoryFileHandle {
  kind = "file" as const;

  constructor(
    public name: string,
    private contents = "",
  ) {}

  async getFile() {
    return {
      text: async () => this.contents,
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
}

describe("scanRepoSkills", () => {
  it("rescans live repository files instead of reusing stale in-memory data", async () => {
    const root = new MemoryDirectoryHandle("repo");
    const skillsRoot = await root.getDirectoryHandle("skills", { create: true });
    await root.getFileHandle("package.json", { create: true });
    const skillRoot = await skillsRoot.getDirectoryHandle("frontend-design", {
      create: true,
    });
    const skillYaml = await skillRoot.getFileHandle("skill.yaml", { create: true });
    const body = await skillRoot.getFileHandle("body.md", { create: true });

    await (await skillYaml.createWritable()).write(`name: frontend-design
title: Frontend Design
description: Initial description.
version: 0.1.0
tags: []
triggers:
  - user asks to style a page
`);
    await (await body.createWritable()).write("Initial body.");

    const initial = await scanRepoSkills(root as never);
    await (await skillYaml.createWritable()).write(`name: frontend-design
title: Frontend Design
description: Updated description.
version: 0.1.0
tags: []
triggers:
  - user asks to style a page
`);

    const rescanned = await scanRepoSkills(root as never);

    expect(initial[0]?.description).toBe("Initial description.");
    expect(rescanned[0]?.description).toBe("Updated description.");
  });
});
