import { describe, expect, it } from "vitest";

import { CoordinateSystem } from "../src/coordinates/coordinate-system.js";
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

  it("should map rectangle geometry from cartesian space into svg bounds deterministically", () => {
    const coordinateSystem = fixture.createCoordinateSystem();
    const renderContext = fixture.createRenderContext();

    const mappedRectangle = coordinateSystem.mapCartesianRectangleToSvg(
      { x: -8, y: -6, width: 4, height: 3 },
      renderContext,
    );

    expect(mappedRectangle.x).toBeCloseTo(150, 1);
    expect(mappedRectangle.y).toBeCloseTo(315.8, 1);
    expect(mappedRectangle.width).toBeCloseTo(140, 1);
    expect(mappedRectangle.height).toBeCloseTo(61.8, 1);
  });

  it("should remap rectangle geometry when the axis ranges change", () => {
    const coordinateSystem = fixture.createCoordinateSystem();
    const defaultContext = fixture.createRenderContext();
    const zoomedContext = fixture.createRenderContext();
    const xRange = fixture.createAxisRange(-20, 20);
    const yRange = fixture.createAxisRange(-20, 20);
    const zoomedCoordinateSystem = new CoordinateSystem(
      fixture.createReactiveHost(),
      "coordinate-system-zoomed",
      fixture.createPointSet(),
      fixture.createRectangleSet(),
      xRange,
      yRange,
    );

    const defaultMapped = coordinateSystem.mapCartesianRectangleToSvg(
      { x: -8, y: -6, width: 4, height: 3 },
      defaultContext,
    );
    const zoomedMapped = zoomedCoordinateSystem.mapCartesianRectangleToSvg(
      { x: -8, y: -6, width: 4, height: 3 },
      zoomedContext,
    );

    expect(zoomedMapped.width).toBeLessThan(defaultMapped.width);
    expect(zoomedMapped.height).toBeLessThan(defaultMapped.height);
  });

  it("should interpolate a deterministic cartesian curve from source points", () => {
    const coordinateSystem = fixture.createCoordinateSystem();
    const [curve] = fixture.createCurveSet();

    const first = coordinateSystem.sampleInterpolatedCurve(curve);
    const second = coordinateSystem.sampleInterpolatedCurve(curve);

    expect(first).toHaveLength(second.length);
    expect(first[0]?.x).toBeCloseTo(second[0]?.x ?? 0, 6);
    expect(first[0]?.y).toBeCloseTo(second[0]?.y ?? 0, 6);
    expect(first.at(-1)?.x).toBeCloseTo(second.at(-1)?.x ?? 0, 6);
    expect(first.at(-1)?.y).toBeCloseTo(second.at(-1)?.y ?? 0, 6);
    expect(first[Math.floor(first.length / 2)]?.x).toBeCloseTo(
      second[Math.floor(second.length / 2)]?.x ?? 0,
      6,
    );
    expect(first[Math.floor(first.length / 2)]?.y).toBeCloseTo(
      second[Math.floor(second.length / 2)]?.y ?? 0,
      6,
    );
  });

  it("should safely avoid publishing curve geometry when interpolation input is insufficient", () => {
    const coordinateSystem = fixture.createCoordinateSystem();
    const shortCurve = fixture.createCurve(
      [
        fixture.createPoint(0, 0, "A"),
        fixture.createPoint(1, 1, "B"),
        fixture.createPoint(2, 0, "C"),
      ],
      "short",
    );

    const samples = coordinateSystem.sampleInterpolatedCurve(shortCurve);

    expect(samples).toHaveLength(0);
  });

  it("should remap interpolated curve samples when the axis ranges change", () => {
    const defaultCoordinateSystem = fixture.createCoordinateSystem();
    const zoomedCoordinateSystem = new CoordinateSystem(
      fixture.createReactiveHost(),
      "coordinate-system-zoomed-curve",
      fixture.createPointSet(),
      fixture.createRectangleSet(),
      fixture.createAxisRange(-20, 20),
      fixture.createAxisRange(-20, 20),
      fixture.createCurveSet(),
    );
    const [curve] = fixture.createCurveSet();
    const defaultContext = fixture.createRenderContext();
    const zoomedContext = fixture.createRenderContext();

    const cartesianSamples = defaultCoordinateSystem.sampleInterpolatedCurve(curve);
    const defaultMapped = defaultCoordinateSystem.mapCurveSamplesToSvg(cartesianSamples, defaultContext);
    const zoomedMapped = zoomedCoordinateSystem.mapCurveSamplesToSvg(cartesianSamples, zoomedContext);

    expect(zoomedMapped[1]?.x).not.toBe(defaultMapped[1]?.x);
    expect(Math.abs((zoomedMapped[1]?.x ?? 0) - (zoomedMapped[0]?.x ?? 0))).toBeLessThan(
      Math.abs((defaultMapped[1]?.x ?? 0) - (defaultMapped[0]?.x ?? 0)),
    );
  });

  it("should hit test rectangles against mapped svg bounds", () => {
    const coordinateSystem = fixture.createCoordinateSystem();
    const renderContext = fixture.createRenderContext();
    const mappedRectangle = coordinateSystem.mapCartesianRectangleToSvg(
      { x: -8, y: -6, width: 4, height: 3 },
      renderContext,
    );

    const hit = coordinateSystem.hitTest({
      x: mappedRectangle.x + mappedRectangle.width / 2,
      y: mappedRectangle.y + mappedRectangle.height / 2,
    });

    expect(hit).toBe(true);
  });

  it("should hit test curves against polyline distance tolerance", () => {
    const coordinateSystem = fixture.createCoordinateSystem();
    const renderContext = fixture.createRenderContext();
    const [curve] = fixture.createCurveSet();
    const mappedSamples = coordinateSystem.mapCurveSamplesToSvg(
      coordinateSystem.sampleInterpolatedCurve(curve),
      renderContext,
    );
    const sample = mappedSamples[Math.floor(mappedSamples.length / 2)];

    expect(sample).toBeDefined();
    const hit = coordinateSystem.hitTest({
      x: (sample?.x ?? 0) + 2,
      y: (sample?.y ?? 0) + 2,
    });

    expect(hit).toBe(true);
  });

  it("should build a valid svg path for the interpolated curve", () => {
    const coordinateSystem = fixture.createCoordinateSystem();
    const renderContext = fixture.createRenderContext();
    const [curve] = fixture.createCurveSet();

    const pathData = coordinateSystem.buildCurvePathData(curve, renderContext);

    expect(pathData.startsWith("M ")).toBe(true);
    expect(pathData.includes(" L ")).toBe(true);
  });

  it("should provide deterministic curve operations", () => {
    const coordinateSystem = fixture.createCoordinateSystem();
    const [curve] = fixture.createCurveSet();

    const firstPoint = coordinateSystem.getCurvePointAt(curve, 0.5);
    const secondPoint = coordinateSystem.getCurvePointAt(curve, 0.5);
    const tangent = coordinateSystem.getCurveTangentAt(curve, 0.5);
    const normal = coordinateSystem.getCurveNormalAt(curve, 0.5);
    const length = coordinateSystem.getCurveLength(curve);

    expect(firstPoint).not.toBeNull();
    expect(secondPoint).not.toBeNull();
    expect(firstPoint?.x).toBeCloseTo(secondPoint?.x ?? 0, 6);
    expect(firstPoint?.y).toBeCloseTo(secondPoint?.y ?? 0, 6);
    expect(tangent).not.toBeNull();
    expect(normal).not.toBeNull();
    expect(length).toBeGreaterThan(0);
    expect(tangent?.length()).toBeCloseTo(1, 4);
    expect(normal?.length()).toBeCloseTo(1, 4);
  });
});
