import { describe, expect, it } from "vitest";
import { parseRoute } from "../../site/src/router.js";

describe("parseRoute", () => {
  it("routes the home hash", () => {
    expect(parseRoute("#/")).toEqual({ kind: "home" });
  });

  it("routes a skill detail hash", () => {
    expect(parseRoute("#/skill/using-superpowers")).toEqual({
      kind: "detail",
      skillName: "using-superpowers"
    });
  });
});
