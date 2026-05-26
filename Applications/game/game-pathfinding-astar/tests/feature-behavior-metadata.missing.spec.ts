import { describe, expect, it } from "vitest";
import * as astarModule from "../src/index.js";

describe("feature: behavior metadata", () => {
  it("exports behavior/version constants", () => {
    const api = astarModule as Record<string, unknown>;
    expect(typeof api.ASTAR_BEHAVIOR_VERSION).toBe("string");
    expect(typeof api.ASTAR_TIEBREAKER_POLICY).toBe("string");
  });
});
