import { describe, expect, it } from "vitest";
import { SvgLinePrimitiveAdapter } from "../src/index.js";
import { SvgTurtleRendererTestFixture } from "./fixtures/SvgTurtleRendererTestFixture.js";

describe("SvgLinePrimitiveAdapter", () => {
  it("supports line primitives only", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const adapter = new SvgLinePrimitiveAdapter();

    expect(adapter.canRender(fixture.createLinePrimitive())).toBe(true);
    expect(adapter.canRender(fixture.createCirclePrimitive())).toBe(false);
  });

  it("adapts a line primitive to deterministic SVG output", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const adapter = new SvgLinePrimitiveAdapter();

    const svg = adapter.render(fixture.createLinePrimitive());

    fixture.expectContainsAll(svg, [
      "<line",
      'x1="0"',
      'y1="0"',
      'x2="10"',
      'y2="0"',
      'stroke="#000000"',
      'stroke-width="1"',
      'fill="none"',
      'data-primitive-id="line-1"',
    ]);
  });

  it("does not mutate the source primitive", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const adapter = new SvgLinePrimitiveAdapter();
    const primitive = fixture.createLinePrimitive();
    const before = structuredClone(primitive);

    adapter.render(primitive);

    fixture.expectNoMutation(before, primitive);
  });
});