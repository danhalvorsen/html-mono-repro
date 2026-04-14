import { describe, expect, it } from "vitest";

import { CorePlotFixture } from "./fixtures/core-plot.fixture.js";

describe("CoordinateSystem", () => {
  const fixture = new CorePlotFixture();

  it("should render points through mapping into hit-testable svg positions", () => {
    const coordinateSystem = fixture.createCoordinateSystem();
    const renderContext = fixture.createRenderContext();
    const pointSvg = coordinateSystem.mapSvgToCartesian({ x: 430, y: 254 }, renderContext);

    expect(pointSvg.x).toBeCloseTo(0, 1);
    expect(pointSvg.y).toBeCloseTo(0, 1);
  });

  it("should produce grid lines aligned to cartesian unit intervals", () => {
    const coordinateSystem = fixture.createCoordinateSystem();
    const renderContext = fixture.createRenderContext();

    const gridLines = coordinateSystem.getGridLines(renderContext);
    const verticalLines = gridLines.filter((line) => line.y1 !== line.y2);
    const horizontalLines = gridLines.filter((line) => line.x1 !== line.x2);

    expect(verticalLines).toHaveLength(21);
    expect(horizontalLines).toHaveLength(21);
  });

  it("should snap svg points to the nearest cartesian grid intersection", () => {
    const coordinateSystem = fixture.createCoordinateSystem();
    const renderContext = fixture.createRenderContext();

    const snapped = coordinateSystem.snapSvgPoint({ x: 471, y: 187 }, renderContext);
    const snappedCartesian = coordinateSystem.mapSvgToCartesian(snapped, renderContext);

    expect(snappedCartesian.x).toBeCloseTo(Math.round(snappedCartesian.x), 6);
    expect(snappedCartesian.y).toBeCloseTo(Math.round(snappedCartesian.y), 6);
    expect(snapped.label).toBeDefined();
  });
});
