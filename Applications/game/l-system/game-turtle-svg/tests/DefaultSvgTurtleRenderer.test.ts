import { describe, expect, it } from "vitest";
import {
  DefaultSvgPrimitiveAdapterRegistry,
  DefaultSvgTurtleRenderer,
  MissingAdapterError,
} from "../src/index.js";
import {
  OffsetSvgMapperPipeline,
  SvgTurtleRendererTestFixture,
} from "./fixtures/SvgTurtleRendererTestFixture.js";

describe("DefaultSvgTurtleRenderer", () => {
  it("renders a deterministic SVG document from abstract turtle primitives", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const renderer = fixture.createDefaultRenderer();

    const svg = renderer.render(
      [
        fixture.createLinePrimitive(),
        fixture.createPolylinePrimitive(),
        fixture.createCirclePrimitive(),
        fixture.createPolygonPrimitive(),
      ],
      fixture.createDefaultOptions(),
    );

    fixture.expectContainsAll(svg, [
      '<svg',
      'xmlns="http://www.w3.org/2000/svg"',
      'width="200"',
      'height="100"',
      'viewBox="0 0 200 100"',
      '<line',
      '<polyline',
      '<circle',
      '<polygon',
      '</svg>',
    ]);
  });

  it("preserves primitive rendering order", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const renderer = fixture.createDefaultRenderer();

    const svg = renderer.render(
      [
        fixture.createLinePrimitive(),
        fixture.createCirclePrimitive(),
        fixture.createPolygonPrimitive(),
      ],
      fixture.createDefaultOptions(),
    );

    const lineIndex = svg.indexOf("<line");
    const circleIndex = svg.indexOf("<circle");
    const polygonIndex = svg.indexOf("<polygon");

    expect(lineIndex).toBeGreaterThanOrEqual(0);
    expect(circleIndex).toBeGreaterThan(lineIndex);
    expect(polygonIndex).toBeGreaterThan(circleIndex);
  });

  it("applies the mapper pipeline before adapter rendering", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const renderer = fixture.createDefaultRenderer(
      new OffsetSvgMapperPipeline(100, 50),
    );

    const svg = renderer.render(
      [fixture.createLinePrimitive()],
      fixture.createDefaultOptions(),
    );

    fixture.expectContainsAll(svg, [
      'x1="100"',
      'y1="50"',
      'x2="110"',
      'y2="50"',
    ]);
  });

  it("does not mutate source primitives when mapping and rendering", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const renderer = fixture.createDefaultRenderer(
      new OffsetSvgMapperPipeline(100, 50),
    );

    const primitive = fixture.createLinePrimitive();
    const before = structuredClone(primitive);

    renderer.render([primitive], fixture.createDefaultOptions());

    fixture.expectNoMutation(before, primitive);
  });

  it("throws MissingAdapterError when no adapter exists for a primitive", () => {
    const fixture = new SvgTurtleRendererTestFixture();

    const renderer = new DefaultSvgTurtleRenderer({
      adapterRegistry: new DefaultSvgPrimitiveAdapterRegistry([]),
      mapperPipeline: new OffsetSvgMapperPipeline(0, 0),
    });

    expect(() =>
      renderer.render([fixture.createLinePrimitive()], fixture.createDefaultOptions()),
    ).toThrow(MissingAdapterError);
  });
});