import { describe, expect, it } from "vitest";

import { CorePlotFixture } from "./fixtures/core-plot.fixture.js";

describe("MappingController", () => {
  const fixture = new CorePlotFixture();

  it("should map cartesian coordinates to svg and back consistently", () => {
    const mapping = fixture.createMappingController();
    const viewport = fixture.createViewport();
    const xRange = fixture.createAxisRange(-10, 10);
    const yRange = fixture.createAxisRange(-10, 10);
    const source = { x: 4, y: -3 };

    const mapped = mapping.mapToSvg(source, xRange, yRange, viewport);
    const roundTrip = mapping.mapToCartesian(mapped, xRange, yRange, viewport);

    expect(roundTrip.x).toBeCloseTo(source.x, 6);
    expect(roundTrip.y).toBeCloseTo(source.y, 6);
  });

  it("should map the cartesian origin to the viewport center for symmetric ranges", () => {
    const mapping = fixture.createMappingController();
    const viewport = fixture.createViewport();

    const mapped = mapping.mapToSvg(
      { x: 0, y: 0 },
      fixture.createAxisRange(-10, 10),
      fixture.createAxisRange(-10, 10),
      viewport,
    );

    expect(mapped.x).toBeCloseTo(viewport.left + viewport.width / 2, 6);
    expect(mapped.y).toBeCloseTo(viewport.top + viewport.height / 2, 6);
  });
});
