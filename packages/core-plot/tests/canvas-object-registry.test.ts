import { describe, expect, it } from "vitest";

import { CanvasObjectRegistry } from "../src/core/canvas-object-registry.js";
import { CorePlotFixture } from "./fixtures/core-plot.fixture.js";

describe("CanvasObjectRegistry", () => {
  const fixture = new CorePlotFixture();

  it("should keep canvas object ids stable through registration", () => {
    const object = fixture.createCanvasObject("stable-id");

    expect(object.id).toBe("stable-id");
    expect(object.id).toBe("stable-id");
  });

  it("should preserve deterministic registration order", () => {
    const registry = new CanvasObjectRegistry();
    registry.register(fixture.createCanvasObject("lower"));
    registry.register(fixture.createCanvasObject("upper"));

    expect(registry.getAll().map((object) => object.id)).toEqual(["lower", "upper"]);
  });

  it("should return the top-most hit object", () => {
    const registry = new CanvasObjectRegistry();
    registry.register(fixture.createCanvasObject("lower", 0, 0, 40, 40));
    registry.register(fixture.createCanvasObject("upper", 10, 10, 50, 50));

    expect(registry.hitTestTopMost({ x: 20, y: 20 })?.id).toBe("upper");
  });

  it("should reject duplicate canvas object ids", () => {
    const registry = new CanvasObjectRegistry();
    registry.register(fixture.createCanvasObject("duplicate"));

    expect(() => registry.register(fixture.createCanvasObject("duplicate"))).toThrow(
      "Duplicate CanvasObject id: duplicate",
    );
  });
});
