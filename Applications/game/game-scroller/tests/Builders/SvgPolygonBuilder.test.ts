import { describe, expect, it, vi } from 'vitest';
import type { Point } from '@monorepo/core-math';
import { SvgPolygonBuilder, SvgRectangleBuilder } from '../../src/Game/Builders/SvgPolygonBuilder.js';

describe('SvgPolygonBuilder', () => {
  it('builds a GamePolygon with provided canvas size', () => {
    const points: readonly Point[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 5 }
    ];

    const polygon = new SvgPolygonBuilder(points, { width: 320, height: 240 }).build();

    expect(polygon.width).toBe(320);
    expect(polygon.height).toBe(240);
  });

  it('maps all incoming points through coordinateMapper', () => {
    const points: readonly Point[] = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 }
    ];

    const coordinateMapper = vi.fn((p: Readonly<Point>) => ({ x: p.x + 100, y: p.y + 200 }));

    new SvgPolygonBuilder(points, { coordinateMapper }).build();

    expect(coordinateMapper).toHaveBeenCalledTimes(3);
    expect(coordinateMapper).toHaveBeenNthCalledWith(1, { x: 1, y: 2 });
    expect(coordinateMapper).toHaveBeenNthCalledWith(2, { x: 3, y: 4 });
    expect(coordinateMapper).toHaveBeenNthCalledWith(3, { x: 5, y: 6 });
  });
});

describe('SvgRectangleBuilder', () => {
  it('supports fluent builder API and builds polygon', () => {
    const polygon = new SvgRectangleBuilder()
      .withLength(80)
      .withHeigth(40)
      .withCenter({ x: 100, y: 100 })
      .withCanvasSize(500, 400)
      .build();

    expect(polygon.width).toBe(500);
    expect(polygon.height).toBe(400);
  });

  it('maps all generated rectangle points through coordinateMapper', () => {
    const coordinateMapper = vi.fn((p: Readonly<Point>) => ({ x: p.x, y: p.y }));

    new SvgRectangleBuilder()
      .withX(10)
      .withY(20)
      .withLength(30)
      .withHeigth(40)
      .withCoordinateMapper(coordinateMapper)
      .build();

    expect(coordinateMapper).toHaveBeenCalledTimes(4);
    expect(coordinateMapper).toHaveBeenNthCalledWith(1, { x: 10, y: 20 });
    expect(coordinateMapper).toHaveBeenNthCalledWith(2, { x: 40, y: 20 });
    expect(coordinateMapper).toHaveBeenNthCalledWith(3, { x: 40, y: 60 });
    expect(coordinateMapper).toHaveBeenNthCalledWith(4, { x: 10, y: 60 });
  });
});
