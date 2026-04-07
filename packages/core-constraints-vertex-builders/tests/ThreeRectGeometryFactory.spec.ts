import { describe, expect, it } from "vitest";
import { RectBuilderFixture } from "./fixtures/RectBuilderFixture.js";
import { RectGeometryFixture } from "./fixtures/RectGeometryFixture.js";

describe("ThreeRectGeometryFactory", () => {
  const builderFixture = new RectBuilderFixture();
  const geometryFixture = new RectGeometryFixture();

  it("should create geometry with expected attributes", () => {
    const geometry = geometryFixture.geometryFactory.create(builderFixture.createHorizontalPair().build().rects);

    expect(geometry.getAttribute("position")).toBeTruthy();
    expect(geometry.getAttribute("normal")).toBeTruthy();
    expect(geometry.getAttribute("uv")).toBeTruthy();
    expect(geometry.getIndex()).toBeTruthy();
  });

  it("should create expected vertex count for one rectangle", () => {
    const geometry = geometryFixture.geometryFactory.create(builderFixture.createSingle().build().rects);
    expect(geometry.getAttribute("position").count).toBe(8);
  });
});
