import { describe, expect, it } from "vitest";
import { RectSemantic } from "../src/RectSemantic.js";
import { RectGeometryFixture } from "./fixtures/RectGeometryFixture.js";
import { RectStateFixture } from "./fixtures/RectStateFixture.js";

describe("RectPlacementSolver", () => {
  const geometryFixture = new RectGeometryFixture();
  const stateFixture = new RectStateFixture();

  it("should solve translation to align semantic points", () => {
    const source = stateFixture.createAt(0, 0, 0);
    const target = stateFixture.createAt(0, 0, 0);

    const transform = geometryFixture.placementSolver.solve(source, target, RectSemantic.Top.Left);
    expect(transform.translateX).toBe(0);
    expect(transform.translateY).toBe(4);
    expect(transform.rotationDegrees).toBe(0);
  });
});
