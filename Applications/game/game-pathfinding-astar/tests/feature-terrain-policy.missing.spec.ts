import { describe, expect, it } from "vitest";
import * as astarModule from "../src/index.js";

describe("feature: terrain policy", () => {
  it("exports createTerrainPolicy", () => {
    expect(typeof (astarModule as Record<string, unknown>).createTerrainPolicy).toBe("function");
  });
});
