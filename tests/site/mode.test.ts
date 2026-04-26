import { describe, expect, it } from "vitest";
import { supportsWorkbenchMode } from "../../site/src/lib/mode.js";

describe("supportsWorkbenchMode", () => {
  it("only enables workbench mode during local development", () => {
    expect(
      supportsWorkbenchMode({
        dev: false,
        hasDirectoryPicker: true,
        protocol: "https:",
      }),
    ).toBe(false);
    expect(
      supportsWorkbenchMode({
        dev: true,
        hasDirectoryPicker: true,
        protocol: "http:",
      }),
    ).toBe(true);
  });
});
