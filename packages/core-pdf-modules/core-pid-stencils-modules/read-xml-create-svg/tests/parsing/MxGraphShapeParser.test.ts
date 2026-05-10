import { describe, expect, it } from "vitest";

import { MxGraphShapeTestFixture } from "../fixtures/MxGraphShapeTestFixture.js";

describe("MxGraphShapeParser", () => {
  const fixture = new MxGraphShapeTestFixture();

  it("should parse the source document name", () => {
    const documentName = fixture
      .createParser()
      .getDocumentName(fixture.createSampleXml());

    expect(documentName).toBe("mxGraph.pid.feeders");
  });

  it("should parse the normalized root name", () => {
    const document = fixture
      .createParser()
      .parseDocument(fixture.createSampleXml());

    expect(document.sourceName).toBe("mxGraph.pid.feeders");
    expect(document.rootName).toBe("pid.feeders");
  });

  it("should parse shape metadata and connection points", () => {
    const shape = fixture.getSampleShapeByName("Proportional Feeder");

    expect(shape.name).toBe("Proportional Feeder");
    expect(shape.width).toBe(100);
    expect(shape.height).toBe(100);
    expect(shape.aspect).toBe("variable");
    expect(shape.strokeWidth).toBe("inherit");

    expect(shape.connections).toHaveLength(2);
    expect(shape.connections[0]).toEqual({
      name: "N",
      x: 0.5,
      y: 0,
      perimeter: "0"
    });
    expect(shape.connections[1]).toEqual({
      name: "S",
      x: 0.5,
      y: 1,
      perimeter: "0"
    });
  });

  it("should parse background and foreground drawables in XML structure", () => {
    const shape = fixture.getSampleShapeByName("Feeder (Rotary Table)");

    expect(shape.background).toHaveLength(1);
    expect(shape.foreground).toHaveLength(1);

    const path = shape.background[0];

    if (!path || path.kind !== "path") {
      throw new Error("Expected background drawable to be a path.");
    }

    expect(path.commands).toHaveLength(9);
    expect(path.commands[0]?.kind).toBe("move");
    expect(path.commands[1]?.kind).toBe("line");
    expect(path.commands[5]?.kind).toBe("arc");

    const stroke = shape.foreground[0];

    if (!stroke || stroke.kind !== "stroke") {
      throw new Error("Expected foreground drawable to be a stroke marker.");
    }
  });
});