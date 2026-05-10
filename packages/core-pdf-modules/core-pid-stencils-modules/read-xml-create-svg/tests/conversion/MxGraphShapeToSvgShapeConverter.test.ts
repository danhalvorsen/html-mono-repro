import { describe, expect, it } from "vitest";

import { MxGraphShapeTestFixture } from "../fixtures/MxGraphShapeTestFixture.js";

describe("MxGraphShapeToSvgShapeConverter", () => {
  const fixture = new MxGraphShapeTestFixture();

  it("should convert shape metadata and connections", () => {
    const shape = fixture.convertSampleShapeByName("Proportional Feeder");

    expect(shape.rootName).toBe("pid.feeders");
    expect(shape.name).toBe("Proportional Feeder");
    expect(shape.width).toBe(100);
    expect(shape.height).toBe(100);
    expect(shape.aspect).toBe("variable");
    expect(shape.strokeWidth).toBe("inherit");
    expect(shape.connections).toHaveLength(2);
  });

  it("should convert background and foreground geometry without flattening XML layers", () => {
    const shape = fixture.convertSampleShapeByName("Proportional Feeder");

    expect(shape.background).toHaveLength(1);
    expect(shape.foreground).toHaveLength(1);

    const ellipse = shape.background[0];

    if (!ellipse || ellipse.kind !== "ellipse") {
      throw new Error("Expected background SVG element to be an ellipse.");
    }

    expect(ellipse.cx).toBe(50);
    expect(ellipse.cy).toBe(50);
    expect(ellipse.rx).toBe(50);
    expect(ellipse.ry).toBe(50);
    expect(ellipse.fill).toBe("none");
    expect(ellipse.stroke).toBe("currentColor");

    const path = shape.foreground[0];

    if (!path || path.kind !== "path") {
      throw new Error("Expected foreground SVG element to be a path.");
    }

    expect(path.d).toBe("M 10 20 L 90 20 L 10 80 L 90 80");
    expect(path.fill).toBe("none");
    expect(path.stroke).toBe("currentColor");
    expect(path.strokeLineJoin).toBe("round");
  });
});