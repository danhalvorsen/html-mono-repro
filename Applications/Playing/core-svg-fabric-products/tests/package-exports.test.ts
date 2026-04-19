import { describe, expect, it } from "vitest";

describe("package exports", () => {
  it("can import the public API in a Node test environment", async () => {
    const api = await import("../src/index.js");

    expect(api.ProductShapeKind.Circle).toBe("circle");
    expect(api.ProductShapeKind.BoxTriangle).toBe("box-triangle");
    expect(api.ProductShapeStyleToken.BoxTriangle).toBe(
      "product-shape-box-triangle",
    );
    expect(api.SvgFabricCircleElement).toBeDefined();
    expect(api.SvgFabricBoxElement).toBeDefined();
    expect(api.SvgFabricTriangleElement).toBeDefined();
    expect(api.SvgFabricBoxTriangleElement).toBeDefined();
  });
});
