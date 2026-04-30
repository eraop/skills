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

  it("scans localized variants from a shared skill folder", async () => {
    const root = new MemoryDirectoryHandle("repo");
    const skillsRoot = await root.getDirectoryHandle("skills", { create: true });
    await root.getFileHandle("package.json", { create: true });
    const skillRoot = await skillsRoot.getDirectoryHandle("code-generation-guardrails", {
      create: true,
    });
    const englishRoot = await skillRoot.getDirectoryHandle("en", { create: true });
    const chineseRoot = await skillRoot.getDirectoryHandle("zh", { create: true });

    await (await (await englishRoot.getFileHandle("skill.yaml", { create: true })).createWritable()).write(`name: code-generation-guardrails
title: Code Generation Guardrails
description: Keep code small.
version: 0.1.0
tags: []
triggers:
  - write code
`);
    await (await (await englishRoot.getFileHandle("body.md", { create: true })).createWritable()).write("Keep code small.");
    await (await (await chineseRoot.getFileHandle("skill.yaml", { create: true })).createWritable()).write(`name: code-generation-guardrails-zh
title: 代码生成约束
description: 保持代码简单。
version: 0.1.0
tags: []
triggers:
  - 编写代码
`);
    await (await (await chineseRoot.getFileHandle("body.md", { create: true })).createWritable()).write("保持代码小而清晰。");

    const skills = await scanRepoSkills(root as never);

    expect(skills.map((skill) => skill.name)).toEqual([
      "code-generation-guardrails",
    ]);
    expect(skills[0]?.variants.map((variant) => variant.name)).toEqual([
      "code-generation-guardrails",
      "code-generation-guardrails-zh",
    ]);
    expect(skills[0]?.variants.map((variant) => variant.artifacts[0]?.entryFile)).toEqual([
      "en/SKILL.md",
      "zh/SKILL.md",
    ]);
  });
});
