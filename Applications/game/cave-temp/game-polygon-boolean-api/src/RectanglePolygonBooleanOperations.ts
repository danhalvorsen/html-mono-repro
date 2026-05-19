import { Vector2 } from "@monorepo/core-math";
import { Polygon } from "@monorepo/game-primetives";
import type { IPolygonBooleanOperations } from "./IPolygonBooleanOperations.js";

type RectangleBounds = {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
};

type Segment = {
  readonly start: Vector2;
  readonly end: Vector2;
};

export class RectanglePolygonBooleanOperations
  implements IPolygonBooleanOperations {
  public compose(polygons: readonly Polygon[]): Polygon {
    if (polygons.length === 0) {
      throw new RangeError("compose requires at least one polygon.");
    }

    const bounds = polygons
      .map((polygon) => this.toRectangleBounds(polygon))
      .filter((value): value is RectangleBounds => value !== null);

    if (bounds.length === 0) {
      throw new RangeError("compose requires rectangle-like polygons.");
    }

    const xs = this.collectSortedUnique(
      bounds.flatMap((box) => [box.minX, box.maxX]),
    );
    const ys = this.collectSortedUnique(
      bounds.flatMap((box) => [box.minY, box.maxY]),
    );
    if (xs.length < 2 || ys.length < 2) {
      throw new RangeError("compose requires non-degenerate rectangles.");
    }

    const occupied = Array.from({ length: xs.length - 1 }, () =>
      Array.from({ length: ys.length - 1 }, () => false),
    );

    for (const box of bounds) {
      const startX = xs.findIndex((value) => value === box.minX);
      const endX = xs.findIndex((value) => value === box.maxX);
      const startY = ys.findIndex((value) => value === box.minY);
      const endY = ys.findIndex((value) => value === box.maxY);

      if (startX < 0 || endX < 0 || startY < 0 || endY < 0) {
        continue;
      }

      for (let ix = startX; ix < endX; ix += 1) {
        for (let iy = startY; iy < endY; iy += 1) {
          occupied[ix]![iy] = true;
        }
      }
    }

    const segments = this.extractBoundarySegments(occupied, xs, ys);
    const points = this.traceBoundary(segments);
    if (points.length < 3) {
      throw new RangeError("compose could not trace polygon boundary.");
    }

    return new Polygon(points, true);
  }

  public union(subject: Polygon, clips: readonly Polygon[]): readonly Polygon[] {
    const all = [subject, ...clips];
    const box = this.toBounds(all);
    if (box === null) {
      return [];
    }

    return [this.boundsToPolygon(box.minX, box.minY, box.maxX, box.maxY)];
  }

  public difference(
    subject: Polygon,
    clips: readonly Polygon[],
  ): readonly Polygon[] {
    if (clips.length === 0) {
      return [subject.withClosed()];
    }

    const subjectBox = this.toBounds([subject]);
    if (subjectBox === null) {
      return [];
    }

    const clipUnionBox = this.toBounds(clips);
    if (clipUnionBox === null || !this.boxIntersects(subjectBox, clipUnionBox)) {
      return [subject.withClosed()];
    }

    const overlap = this.intersectionBox(subjectBox, clipUnionBox);
    if (overlap === null) {
      return [subject.withClosed()];
    }

    const horizontalCut =
      overlap.minX > subjectBox.minX
        ? this.boundsToPolygon(
            subjectBox.minX,
            subjectBox.minY,
            overlap.minX,
            subjectBox.maxY,
          )
        : null;
    const verticalCut =
      overlap.maxY < subjectBox.maxY
        ? this.boundsToPolygon(
            subjectBox.minX,
            overlap.maxY,
            subjectBox.maxX,
            subjectBox.maxY,
          )
        : null;

    return [horizontalCut, verticalCut].filter(
      (polygon): polygon is Polygon => polygon !== null,
    );
  }

  public intersect(subject: Polygon, clips: readonly Polygon[]): readonly Polygon[] {
    const subjectBox = this.toBounds([subject]);
    const clipUnionBox = this.toBounds(clips);

    if (subjectBox === null || clipUnionBox === null) {
      return [];
    }

    const overlap = this.intersectionBox(subjectBox, clipUnionBox);
    if (overlap === null) {
      return [];
    }

    return [
      this.boundsToPolygon(overlap.minX, overlap.minY, overlap.maxX, overlap.maxY),
    ];
  }

  public xor(subject: Polygon, clips: readonly Polygon[]): readonly Polygon[] {
    const union = this.union(subject, clips);
    const intersect = this.intersect(subject, clips);
    if (union.length === 0) {
      return [];
    }

    if (intersect.length === 0) {
      return union;
    }

    const unionBox = this.toBounds(union);
    const intersectBox = this.toBounds(intersect);
    if (unionBox === null || intersectBox === null) {
      return union;
    }

    const top =
      intersectBox.minY > unionBox.minY
        ? this.boundsToPolygon(
            unionBox.minX,
            unionBox.minY,
            unionBox.maxX,
            intersectBox.minY,
          )
        : null;
    const bottom =
      intersectBox.maxY < unionBox.maxY
        ? this.boundsToPolygon(
            unionBox.minX,
            intersectBox.maxY,
            unionBox.maxX,
            unionBox.maxY,
          )
        : null;

    return [top, bottom].filter((polygon): polygon is Polygon => polygon !== null);
  }

  private toBounds(polygons: readonly Polygon[]): RectangleBounds | null {
    if (polygons.length === 0) {
      return null;
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const polygon of polygons) {
      for (const point of polygon.points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }
    }

    if (
      !Number.isFinite(minX) ||
      !Number.isFinite(minY) ||
      !Number.isFinite(maxX) ||
      !Number.isFinite(maxY)
    ) {
      return null;
    }

    return { minX, minY, maxX, maxY };
  }

  private intersectionBox(
    left: RectangleBounds,
    right: RectangleBounds,
  ): RectangleBounds | null {
    const minX = Math.max(left.minX, right.minX);
    const minY = Math.max(left.minY, right.minY);
    const maxX = Math.min(left.maxX, right.maxX);
    const maxY = Math.min(left.maxY, right.maxY);

    if (maxX <= minX || maxY <= minY) {
      return null;
    }

    return { minX, minY, maxX, maxY };
  }

  private boxIntersects(left: RectangleBounds, right: RectangleBounds): boolean {
    return !(
      left.maxX <= right.minX ||
      right.maxX <= left.minX ||
      left.maxY <= right.minY ||
      right.maxY <= left.minY
    );
  }

  private boundsToPolygon(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): Polygon {
    return new Polygon(
      [
        new Vector2(minX, minY),
        new Vector2(maxX, minY),
        new Vector2(maxX, maxY),
        new Vector2(minX, maxY),
      ],
      true,
    );
  }

  private toRectangleBounds(polygon: Polygon): RectangleBounds | null {
    return this.toBounds([polygon]);
  }

  private collectSortedUnique(values: readonly number[]): readonly number[] {
    return [...new Set(values)].sort((left, right) => left - right);
  }

  private extractBoundarySegments(
    occupied: readonly (readonly boolean[])[],
    xs: readonly number[],
    ys: readonly number[],
  ): readonly Segment[] {
    const segments: Segment[] = [];
    const maxX = occupied.length;
    const maxY = occupied[0]?.length ?? 0;

    for (let ix = 0; ix < maxX; ix += 1) {
      for (let iy = 0; iy < maxY; iy += 1) {
        if (!occupied[ix]?.[iy]) {
          continue;
        }

        const x0 = xs[ix]!;
        const x1 = xs[ix + 1]!;
        const y0 = ys[iy]!;
        const y1 = ys[iy + 1]!;

        if (ix === 0 || !occupied[ix - 1]?.[iy]) {
          segments.push({ start: new Vector2(x0, y1), end: new Vector2(x0, y0) });
        }
        if (ix === maxX - 1 || !occupied[ix + 1]?.[iy]) {
          segments.push({ start: new Vector2(x1, y0), end: new Vector2(x1, y1) });
        }
        if (iy === 0 || !occupied[ix]?.[iy - 1]) {
          segments.push({ start: new Vector2(x0, y0), end: new Vector2(x1, y0) });
        }
        if (iy === maxY - 1 || !occupied[ix]?.[iy + 1]) {
          segments.push({ start: new Vector2(x1, y1), end: new Vector2(x0, y1) });
        }
      }
    }

    return segments;
  }

  private traceBoundary(segments: readonly Segment[]): readonly Vector2[] {
    if (segments.length === 0) {
      return [];
    }

    const byStart = new Map<string, Segment[]>();
    for (const segment of segments) {
      const key = this.toKey(segment.start);
      const list = byStart.get(key);
      if (list === undefined) {
        byStart.set(key, [segment]);
      } else {
        list.push(segment);
      }
    }

    const startSegment = segments[0]!;
    const points: Vector2[] = [startSegment.start.clone()];
    let current = startSegment.end.clone();
    const maxIterations = segments.length + 4;

    for (let i = 0; i < maxIterations; i += 1) {
      points.push(current.clone());
      const nextKey = this.toKey(current);
      const options = byStart.get(nextKey) ?? [];
      if (options.length === 0) {
        break;
      }

      const next = options.shift()!;
      current = next.end.clone();
      if (current.equals(points[0]!)) {
        break;
      }
    }

    return points;
  }

  private toKey(point: Vector2): string {
    return `${point.x}:${point.y}`;
  }
}
