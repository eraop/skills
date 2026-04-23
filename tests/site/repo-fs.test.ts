import { describe, expect, it } from "vitest";
import { isValidRepoLayout } from "../../site/src/lib/repo-fs.js";

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
