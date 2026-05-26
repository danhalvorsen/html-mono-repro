import { describe, expect, it } from "vitest";
import { AstarPathfinder } from "../src/index.js";
import { AstarFixture } from "./fixtures/AstarFixture.js";

describe("feature: diagnostics", () => {
  it("findPath result contains diagnostics payload", () => {
    const fixture = new AstarFixture();
    const pathfinder = new AstarPathfinder();
    const result = pathfinder.findPath(fixture.createRequest()) as Record<string, unknown>;

    expect("diagnostics" in result).toBe(true);
  });
});
