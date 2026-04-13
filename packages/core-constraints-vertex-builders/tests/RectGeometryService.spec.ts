// tests/RectGeometryService.spec.ts

import { describe, it } from "vitest";
import { RectSemantic } from "../src/RectSemantic.js";
import { RectStateFixture } from "./fixtures/RectStateFixture.js";
import { RectGeometryFixture } from "./fixtures/RectGeometryFixture.js";
import { RectAssertionsFixture } from "./fixtures/RectAssertionsFixture.js";

describe("RectGeometryService", () => {
  const stateFixture = new RectStateFixture();
  const geometryFixture = new RectGeometryFixture();
  const assertions = new RectAssertionsFixture();

  it("should return local semantic point", () => {
    const point = geometryFixture.geometryService.getLocalSemanticPoint(
      { width: 2, height: 4, depth: 1 },
      RectSemantic.Top.Right,
    );

    assertions.assertPoint(point, 1, 2, 0);
  });

  it("should return world semantic point for axis aligned rect", () => {
    const point = geometryFixture.geometryService.getWorldSemanticPoint(
      geometryFixture.createAxisAlignedRect(),
      RectSemantic.Top.Right,
    );

    assertions.assertPoint(point, 3, 3, 0);
  });

  it("should return world semantic point for rotated rect", () => {
    const point = geometryFixture.geometryService.getWorldSemanticPoint(
      geometryFixture.createRotatedRect(),
      RectSemantic.Top.Right,
    );

    assertions.assertPoint(point, 4, 2, 0);
  });

  it("should return opposite world semantic point", () => {
    const point = geometryFixture.geometryService.getOppositeWorldSemanticPoint(
      stateFixture.createAt(0, 0, 0),
      RectSemantic.Top.Left,
    );

    assertions.assertPoint(point, -1, -2, 0);
  });
});