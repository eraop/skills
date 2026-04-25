import { describe, expect, it, vi } from "vitest";
import {
  isValidRepoLayout,
  removeDirectoryIfPresent,
} from "../../site/src/lib/repo-fs.js";

describe("isValidRepoLayout", () => {
  it("accepts a repo with package.json and skills directory", async () => {
    const handle = {
      values: async function* () {
        yield { kind: "file", name: "package.json" };
        yield { kind: "directory", name: "skills" };
      },
    };

    await expect(isValidRepoLayout(handle as never)).resolves.toBe(true);
  });

  it("rejects a repo without a skills directory", async () => {
    const handle = {
      values: async function* () {
        yield { kind: "file", name: "package.json" };
      },
    };

    await expect(isValidRepoLayout(handle as never)).resolves.toBe(false);
  });

  it("rejects a repo without a package.json file", async () => {
    const handle = {
      values: async function* () {
        yield { kind: "directory", name: "skills" };
      },
    };

    await expect(isValidRepoLayout(handle as never)).resolves.toBe(false);
  });
});

describe("removeDirectoryIfPresent", () => {
  it("removes nested directories and ignores missing paths", async () => {
    const removeEntry = vi.fn(async () => {});
    const skillRoot = {
      removeEntry,
    };
    const distRoot = {
      getDirectoryHandle: async (name: string) => {
        if (name === "frontend-design") {
          return skillRoot;
        }

        throw Object.assign(new Error(`Missing directory: ${name}`), {
          name: "NotFoundError",
        });
      },
    };
    const repoRoot = {
      getDirectoryHandle: async (name: string) => {
        expect(name).toBe("dist");
        return distRoot;
      },
    };

    await expect(
      removeDirectoryIfPresent(repoRoot as never, ["dist", "frontend-design", "SKILL.md"]),
    ).resolves.toBeUndefined();
    await expect(
      removeDirectoryIfPresent(repoRoot as never, ["dist", "missing-skill", "SKILL.md"]),
    ).resolves.toBeUndefined();

    expect(removeEntry).toHaveBeenCalledOnce();
    expect(removeEntry).toHaveBeenCalledWith("SKILL.md", { recursive: true });
  });
});
