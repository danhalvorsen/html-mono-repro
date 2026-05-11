import { describe, expect, it } from "vitest";
import { SvgPolygonPrimitiveAdapter } from "../src/index.js";
import { SvgTurtleRendererTestFixture } from "./fixtures/SvgTurtleRendererTestFixture.js";

describe("SvgPolygonPrimitiveAdapter", () => {
  it("supports polygon primitives only", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const adapter = new SvgPolygonPrimitiveAdapter();

    expect(adapter.canRender(fixture.createPolygonPrimitive())).toBe(true);
    expect(adapter.canRender(fixture.createLinePrimitive())).toBe(false);
  });

  it("adapts ordered points to deterministic SVG polygon output", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const adapter = new SvgPolygonPrimitiveAdapter();

    const svg = adapter.render(fixture.createPolygonPrimitive());

    fixture.expectContainsAll(svg, [
      "<polygon",
      'points="0,0 10,0 10,10"',
      'stroke="#333333"',
      'stroke-width="4"',
      'fill="none"',
      'data-primitive-id="polygon-1"',
    ]);
  });

  it("does not mutate the source primitive", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const adapter = new SvgPolygonPrimitiveAdapter();
    const primitive = fixture.createPolygonPrimitive();
    const before = structuredClone(primitive);

    adapter.render(primitive);

    fixture.expectNoMutation(before, primitive);
  });
});