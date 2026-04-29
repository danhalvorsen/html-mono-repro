import { describe, expect, it } from "vitest";

describe("core-graph-visualisation exports", () => {
  it("loads the built module entrypoint", async () => {
    const mod = await import("../dist/index.js");

    expect(mod).toBeDefined();
    expect(typeof mod.GridGraphConstraintEngine).toBe("function");
    expect(typeof mod.GraphSvgSceneFactory).toBe("function");
    expect(typeof mod.SvgCartesianCoordinateMapper).toBe("function");
  });
});
