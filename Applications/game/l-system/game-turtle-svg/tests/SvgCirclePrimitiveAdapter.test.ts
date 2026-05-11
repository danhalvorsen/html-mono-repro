import { describe, expect, it } from "vitest";
import { SvgCirclePrimitiveAdapter } from "../src/index.js";
import { SvgTurtleRendererTestFixture } from "./fixtures/SvgTurtleRendererTestFixture.js";

describe("SvgCirclePrimitiveAdapter", () => {
  it("supports circle primitives only", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const adapter = new SvgCirclePrimitiveAdapter();

    expect(adapter.canRender(fixture.createCirclePrimitive())).toBe(true);
    expect(adapter.canRender(fixture.createLinePrimitive())).toBe(false);
  });

  it("adapts a circle primitive on the XY plane to deterministic SVG circle output", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const adapter = new SvgCirclePrimitiveAdapter();

    const svg = adapter.render(fixture.createCirclePrimitive());

    fixture.expectContainsAll(svg, [
      "<circle",
      'cx="20"',
      'cy="30"',
      'r="10"',
      'stroke="#222222"',
      'stroke-width="3"',
      'fill="none"',
      'data-primitive-id="circle-1"',
    ]);
  });

  it("does not mutate the source primitive", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const adapter = new SvgCirclePrimitiveAdapter();
    const primitive = fixture.createCirclePrimitive();
    const before = structuredClone(primitive);

    adapter.render(primitive);

    fixture.expectNoMutation(before, primitive);
  });
});