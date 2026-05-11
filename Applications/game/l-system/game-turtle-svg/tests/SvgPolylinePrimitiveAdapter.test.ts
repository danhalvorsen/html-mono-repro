import { describe, expect, it } from "vitest";
import { SvgPolylinePrimitiveAdapter } from "../src/index.js";
import { SvgTurtleRendererTestFixture } from "./fixtures/SvgTurtleRendererTestFixture.js";

describe("SvgPolylinePrimitiveAdapter", () => {
  it("supports polyline primitives only", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const adapter = new SvgPolylinePrimitiveAdapter();

    expect(adapter.canRender(fixture.createPolylinePrimitive())).toBe(true);
    expect(adapter.canRender(fixture.createLinePrimitive())).toBe(false);
  });

  it("adapts ordered points to deterministic SVG polyline output", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const adapter = new SvgPolylinePrimitiveAdapter();

    const svg = adapter.render(fixture.createPolylinePrimitive());

    fixture.expectContainsAll(svg, [
      "<polyline",
      'points="0,0 5,10 10,0"',
      'stroke="#111111"',
      'stroke-width="2"',
      'fill="none"',
      'data-primitive-id="polyline-1"',
    ]);
  });

  it("does not mutate the source primitive", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const adapter = new SvgPolylinePrimitiveAdapter();
    const primitive = fixture.createPolylinePrimitive();
    const before = structuredClone(primitive);

    adapter.render(primitive);

    fixture.expectNoMutation(before, primitive);
  });
});