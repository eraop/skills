import { describe, expect, it } from "vitest";
import { parseRoute } from "../../site/src/router.js";

describe("parseRoute", () => {
  it("routes an empty hash to home", () => {
    expect(parseRoute("")).toEqual({ kind: "home" });
  });

  it("routes the home hash", () => {
    expect(parseRoute("#/")).toEqual({ kind: "home" });
  });

  it("routes a skill detail hash", () => {
    expect(parseRoute("#/skill/code-generation-guardrails")).toEqual({
      kind: "detail",
      skillName: "code-generation-guardrails"
    });
  });

  it("routes unknown hashes to not-found", () => {
    expect(parseRoute("#/missing/route")).toEqual({ kind: "not-found" });
  });
});
