import { describe, expect, it } from "vitest";
import * as astarModule from "../src/index.js";

describe("feature: visualizer adapter", () => {
  it("exports createVisualizerStepAdapter", () => {
    expect(typeof (astarModule as Record<string, unknown>).createVisualizerStepAdapter).toBe("function");
  });
});
