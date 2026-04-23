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
});
