import { describe, expect, it } from "vitest";

import { CorePlotFixture } from "./fixtures/core-plot.fixture.js";

describe("CoordinateSystem grid alignment bug fix", () => {
  const fixture = new CorePlotFixture();

  it("should place cartesian x = 1 and y = 1 on rendered grid intersections", () => {
    const coordinateSystem = fixture.createCoordinateSystem();
    const renderContext = fixture.createRenderContext();
    const gridLines = coordinateSystem.getGridLines(renderContext);
    const xOneSvg = coordinateSystem.snapSvgPoint({ x: 468, y: 233 }, renderContext);

    const snappedCartesian = coordinateSystem.mapSvgToCartesian(
      { x: xOneSvg.x, y: xOneSvg.y },
      renderContext,
    );

    expect(snappedCartesian.x).toBe(1);
    expect(snappedCartesian.y).toBe(1);

    const hasVerticalGridAtXOne = gridLines.some(
      (line) =>
        line.y1 !== line.y2 &&
        Math.abs(line.x1 - xOneSvg.x) < 0.000001 &&
        Math.abs(line.x2 - xOneSvg.x) < 0.000001,
    );

    const hasHorizontalGridAtYOne = gridLines.some(
      (line) =>
        line.x1 !== line.x2 &&
        Math.abs(line.y1 - xOneSvg.y) < 0.000001 &&
        Math.abs(line.y2 - xOneSvg.y) < 0.000001,
    );

    expect(hasVerticalGridAtXOne).toBe(true);
    expect(hasHorizontalGridAtYOne).toBe(true);
  });

  it("should snap an arbitrary svg point to the nearest integer cartesian intersection", () => {
    const coordinateSystem = fixture.createCoordinateSystem();
    const renderContext = fixture.createRenderContext();

    const snapped = coordinateSystem.snapSvgPoint({ x: 463.4, y: 229.3 }, renderContext);
    const snappedCartesian = coordinateSystem.mapSvgToCartesian(snapped, renderContext);

    expect(snappedCartesian.x).toBe(1);
    expect(snappedCartesian.y).toBe(1);
    expect(snapped.label).toBe("1, 1");
  });
});
