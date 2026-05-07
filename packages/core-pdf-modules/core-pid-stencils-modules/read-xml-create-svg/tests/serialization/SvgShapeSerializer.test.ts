import { describe, expect, it } from "vitest";

import { MxGraphShapeTestFixture } from "../fixtures/MxGraphShapeTestFixture.js";

describe("SvgShapeSerializer", () => {
  const fixture = new MxGraphShapeTestFixture();

  it("should serialize converted shapes to svg-shape XML", () => {
    const serializer = fixture.createSerializer();
    const shape = fixture.convertSampleShapeByName("Proportional Feeder");

    const xml = serializer.serialize({
      name: fixture.sourceName,
      rootName: fixture.rootName,
      shapes: [shape]
    });

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain(
      '<svg-shapes name="mxGraph.pid.feeders" root-name="pid.feeders">'
    );
    expect(xml).toContain(
      '<svg-shape root-name="pid.feeders" name="Proportional Feeder" w="100" h="100" aspect="variable" strokewidth="inherit">'
    );
    expect(xml).toContain(
      '<constraint name="N" perimeter="0" x="0.5" y="0" />'
    );
    expect(xml).toContain('<g data-layer="background">');
    expect(xml).toContain('<g data-layer="foreground">');
    expect(xml).toContain(
      '<ellipse cx="50" cy="50" rx="50" ry="50" fill="none" stroke="currentColor" stroke-width="inherit" />'
    );
    expect(xml).toContain(
      '<path d="M 10 20 L 90 20 L 10 80 L 90 80" fill="none" stroke="currentColor" stroke-width="inherit" stroke-linejoin="round" />'
    );
  });

  it("should escape XML attribute values", () => {
    const escaped = fixture.createEscaper().attribute('A&B"C<>');

    expect(escaped).toBe("A&amp;B&quot;C&lt;&gt;");
  });
});