// code.test.ts

import { describe, expect, it } from 'vitest';
import {
  LayoutCompositionRoot,
  type Bounds,
  type Circle,
  type CircleGroupLayout,
  type CreateCircleGroupsRequest,
  type CreateRectangleGroupsRequest,
  type Rectangle,
  type RectangleGroupLayout,
  type RgbColor,
} from '../src/code.js';

class RectangleGroupLayoutFixture {
  public constructor(
    private readonly seed: number = 12345,
  ) {}

  public createSut() {
    return LayoutCompositionRoot.createRectangleGroupLayoutGenerator(this.seed);
  }

  public createRequest(
    overrides: Partial<CreateRectangleGroupsRequest> = {},
  ): CreateRectangleGroupsRequest {
    return {
      numberOfGroups: 4,
      worldBounds: { x: 0, y: 0, width: 1600, height: 1200 },
      groupSizeRange: { minWidth: 120, maxWidth: 180, minHeight: 120, maxHeight: 180 },
      groupDistanceRange: { min: 30, max: 1000 },
      rectangleSizeRange: { minWidth: 12, maxWidth: 24, minHeight: 12, maxHeight: 24 },
      rectangleDistanceRange: { min: 4, max: 300 },
      rectanglesPerGroupRange: { min: 4, max: 8 },
      ...overrides,
    };
  }

  public createLayout(
    overrides: Partial<CreateRectangleGroupsRequest> = {},
  ): RectangleGroupLayout {
    return this.createSut().create(this.createRequest(overrides));
  }
}

class CircleGroupLayoutFixture {
  public constructor(
    private readonly seed: number = 67890,
  ) {}

  public createSut() {
    return LayoutCompositionRoot.createCircleGroupLayoutGenerator(this.seed);
  }

  public createRequest(
    overrides: Partial<CreateCircleGroupsRequest> = {},
  ): CreateCircleGroupsRequest {
    return {
      numberOfGroups: 4,
      worldBounds: { x: 0, y: 0, width: 1600, height: 1200 },
      groupRadiusRange: { min: 80, max: 120 },
      groupDistanceRange: { min: 30, max: 1000 },
      circleRadiusRange: { min: 8, max: 18 },
      circleDistanceRange: { min: 4, max: 220 },
      circlesPerGroupRange: { min: 4, max: 8 },
      ...overrides,
    };
  }

  public createLayout(
    overrides: Partial<CreateCircleGroupsRequest> = {},
  ): CircleGroupLayout {
    return this.createSut().create(this.createRequest(overrides));
  }
}

class GeometryAssertions {
  public static expectRectangleWithinBounds(
    rectangle: Rectangle,
    bounds: Bounds,
  ): void {
    expect(rectangle.x).toBeGreaterThanOrEqual(bounds.x);
    expect(rectangle.y).toBeGreaterThanOrEqual(bounds.y);
    expect(rectangle.x + rectangle.width).toBeLessThanOrEqual(bounds.x + bounds.width);
    expect(rectangle.y + rectangle.height).toBeLessThanOrEqual(bounds.y + bounds.height);
  }

  public static expectCircleWithinBounds(
    circle: Circle,
    bounds: Bounds,
  ): void {
    expect(circle.cx - circle.radius).toBeGreaterThanOrEqual(bounds.x);
    expect(circle.cy - circle.radius).toBeGreaterThanOrEqual(bounds.y);
    expect(circle.cx + circle.radius).toBeLessThanOrEqual(bounds.x + bounds.width);
    expect(circle.cy + circle.radius).toBeLessThanOrEqual(bounds.y + bounds.height);
  }

  public static rectangleDistance(left: Rectangle, right: Rectangle): number {
    const dx = Math.max(
      0,
      Math.max(right.x - (left.x + left.width), left.x - (right.x + right.width)),
    );

    const dy = Math.max(
      0,
      Math.max(right.y - (left.y + left.height), left.y - (right.y + right.height)),
    );

    return Math.sqrt((dx * dx) + (dy * dy));
  }

  public static circleDistance(left: Circle, right: Circle): number {
    const dx = left.cx - right.cx;
    const dy = left.cy - right.cy;
    const centerDistance = Math.sqrt((dx * dx) + (dy * dy));
    return Math.max(0, centerDistance - (left.radius + right.radius));
  }

  public static expectDistanceInRange(
    distance: number,
    min: number,
    max: number,
  ): void {
    expect(distance).toBeGreaterThanOrEqual(min);
    expect(distance).toBeLessThanOrEqual(max);
  }

  public static expectRgbColor(color: RgbColor): void {
    expect(Number.isInteger(color.r)).toBe(true);
    expect(Number.isInteger(color.g)).toBe(true);
    expect(Number.isInteger(color.b)).toBe(true);

    expect(color.r).toBeGreaterThanOrEqual(0);
    expect(color.r).toBeLessThanOrEqual(255);

    expect(color.g).toBeGreaterThanOrEqual(0);
    expect(color.g).toBeLessThanOrEqual(255);

    expect(color.b).toBeGreaterThanOrEqual(0);
    expect(color.b).toBeLessThanOrEqual(255);
  }

  public static expectDistinctButRelatedShapeColor(
    groupColor: RgbColor,
    shapeColor: RgbColor,
  ): void {
    this.expectRgbColor(groupColor);
    this.expectRgbColor(shapeColor);

    expect(Math.abs(groupColor.r - shapeColor.r)).toBeLessThanOrEqual(28);
    expect(Math.abs(groupColor.g - shapeColor.g)).toBeLessThanOrEqual(28);
    expect(Math.abs(groupColor.b - shapeColor.b)).toBeLessThanOrEqual(28);
  }

  public static expectDeterministic<T>(left: T, right: T): void {
    expect(JSON.stringify(left)).toBe(JSON.stringify(right));
  }
}

describe('RectangleGroupLayoutGenerator', () => {
  const fixture = new RectangleGroupLayoutFixture();

  it('should create the requested number of groups when input is valid', () => {
    const result = fixture.createLayout({ numberOfGroups: 5 });

    expect(result.groups).toHaveLength(5);
  });

  it('should keep each group bounds inside world bounds', () => {
    const request = fixture.createRequest();
    const result = fixture.createSut().create(request);

    for (const group of result.groups) {
      GeometryAssertions.expectRectangleWithinBounds(group.bounds, request.worldBounds);
    }
  });

  it('should keep each group within the configured group distance range from every other group', () => {
    const request = fixture.createRequest();
    const result = fixture.createSut().create(request);

    for (let i = 0; i < result.groups.length; i++) {
      for (let j = i + 1; j < result.groups.length; j++) {
        const distance = GeometryAssertions.rectangleDistance(
          result.groups[i].bounds,
          result.groups[j].bounds,
        );

        GeometryAssertions.expectDistanceInRange(
          distance,
          request.groupDistanceRange.min,
          request.groupDistanceRange.max,
        );
      }
    }
  });

  it('should create a rectangle count per group within the configured range', () => {
    const request = fixture.createRequest({
      rectanglesPerGroupRange: { min: 3, max: 6 },
    });

    const result = fixture.createSut().create(request);

    for (const group of result.groups) {
      expect(group.rectangles.length).toBeGreaterThanOrEqual(3);
      expect(group.rectangles.length).toBeLessThanOrEqual(6);
    }
  });

  it('should keep each rectangle inside its group bounds', () => {
    const result = fixture.createLayout();

    for (const group of result.groups) {
      for (const rectangle of group.rectangles) {
        GeometryAssertions.expectRectangleWithinBounds(rectangle, group.bounds);
      }
    }
  });

  it('should keep each rectangle within the configured rectangle distance range from every other rectangle in its group', () => {
    const request = fixture.createRequest();
    const result = fixture.createSut().create(request);

    for (const group of result.groups) {
      for (let i = 0; i < group.rectangles.length; i++) {
        for (let j = i + 1; j < group.rectangles.length; j++) {
          const distance = GeometryAssertions.rectangleDistance(
            group.rectangles[i],
            group.rectangles[j],
          );

          GeometryAssertions.expectDistanceInRange(
            distance,
            request.rectangleDistanceRange.min,
            request.rectangleDistanceRange.max,
          );
        }
      }
    }
  });

  it('should assign a valid rgb group color to every group', () => {
    const result = fixture.createLayout();

    for (const group of result.groups) {
      GeometryAssertions.expectRgbColor(group.groupColor);
    }
  });

  it('should assign a valid rgb fill color to every rectangle derived from the group palette', () => {
    const result = fixture.createLayout();

    for (const group of result.groups) {
      for (const rectangle of group.rectangles) {
        GeometryAssertions.expectDistinctButRelatedShapeColor(
          group.groupColor,
          rectangle.fillColor,
        );
      }
    }
  });

  it('should return deterministic output for the same seed and request', () => {
    const leftFixture = new RectangleGroupLayoutFixture(999);
    const rightFixture = new RectangleGroupLayoutFixture(999);

    const request = leftFixture.createRequest();

    const left = leftFixture.createSut().create(request);
    const right = rightFixture.createSut().create(request);

    GeometryAssertions.expectDeterministic(left, right);
  });

  it('should throw when the request is invalid', () => {
    const sut = fixture.createSut();

    expect(() =>
      sut.create(
        fixture.createRequest({
          groupDistanceRange: { min: 100, max: 10 },
        }),
      ),
    ).toThrowError();
  });

  it('should throw when the layout cannot satisfy the configured constraints', () => {
    const sut = fixture.createSut();

    expect(() =>
      sut.create(
        fixture.createRequest({
          numberOfGroups: 12,
          worldBounds: { x: 0, y: 0, width: 180, height: 180 },
          groupSizeRange: { minWidth: 80, maxWidth: 80, minHeight: 80, maxHeight: 80 },
          groupDistanceRange: { min: 40, max: 60 },
        }),
      ),
    ).toThrowError();
  });
});

describe('CircleGroupLayoutGenerator', () => {
  const fixture = new CircleGroupLayoutFixture();

  it('should create the requested number of groups when input is valid', () => {
    const result = fixture.createLayout({ numberOfGroups: 5 });

    expect(result.groups).toHaveLength(5);
  });

  it('should keep each group bounds inside world bounds', () => {
    const request = fixture.createRequest();
    const result = fixture.createSut().create(request);

    for (const group of result.groups) {
      GeometryAssertions.expectCircleWithinBounds(group.bounds, request.worldBounds);
    }
  });

  it('should keep each group within the configured group distance range from every other group', () => {
    const request = fixture.createRequest();
    const result = fixture.createSut().create(request);

    for (let i = 0; i < result.groups.length; i++) {
      for (let j = i + 1; j < result.groups.length; j++) {
        const distance = GeometryAssertions.circleDistance(
          result.groups[i].bounds,
          result.groups[j].bounds,
        );

        GeometryAssertions.expectDistanceInRange(
          distance,
          request.groupDistanceRange.min,
          request.groupDistanceRange.max,
        );
      }
    }
  });

  it('should create a circle count per group within the configured range', () => {
    const request = fixture.createRequest({
      circlesPerGroupRange: { min: 3, max: 6 },
    });

    const result = fixture.createSut().create(request);

    for (const group of result.groups) {
      expect(group.circles.length).toBeGreaterThanOrEqual(3);
      expect(group.circles.length).toBeLessThanOrEqual(6);
    }
  });

  it('should keep each circle inside its group bounds box', () => {
    const result = fixture.createLayout();

    for (const group of result.groups) {
      const groupBoundsBox: Bounds = {
        x: group.bounds.cx - group.bounds.radius,
        y: group.bounds.cy - group.bounds.radius,
        width: group.bounds.radius * 2,
        height: group.bounds.radius * 2,
      };

      for (const circle of group.circles) {
        GeometryAssertions.expectCircleWithinBounds(circle, groupBoundsBox);
      }
    }
  });

  it('should keep each circle within the configured circle distance range from every other circle in its group', () => {
    const request = fixture.createRequest();
    const result = fixture.createSut().create(request);

    for (const group of result.groups) {
      for (let i = 0; i < group.circles.length; i++) {
        for (let j = i + 1; j < group.circles.length; j++) {
          const distance = GeometryAssertions.circleDistance(
            group.circles[i],
            group.circles[j],
          );

          GeometryAssertions.expectDistanceInRange(
            distance,
            request.circleDistanceRange.min,
            request.circleDistanceRange.max,
          );
        }
      }
    }
  });

  it('should assign a valid rgb group color to every group', () => {
    const result = fixture.createLayout();

    for (const group of result.groups) {
      GeometryAssertions.expectRgbColor(group.groupColor);
    }
  });

  it('should assign a valid rgb fill color to every circle derived from the group palette', () => {
    const result = fixture.createLayout();

    for (const group of result.groups) {
      for (const circle of group.circles) {
        GeometryAssertions.expectDistinctButRelatedShapeColor(
          group.groupColor,
          circle.fillColor,
        );
      }
    }
  });

  it('should return deterministic output for the same seed and request', () => {
    const leftFixture = new CircleGroupLayoutFixture(222);
    const rightFixture = new CircleGroupLayoutFixture(222);

    const request = leftFixture.createRequest();

    const left = leftFixture.createSut().create(request);
    const right = rightFixture.createSut().create(request);

    GeometryAssertions.expectDeterministic(left, right);
  });

  it('should throw when the request is invalid', () => {
    const sut = fixture.createSut();

    expect(() =>
      sut.create(
        fixture.createRequest({
          circleDistanceRange: { min: 100, max: 10 },
        }),
      ),
    ).toThrowError();
  });

  it('should throw when the layout cannot satisfy the configured constraints', () => {
    const sut = fixture.createSut();

    expect(() =>
      sut.create(
        fixture.createRequest({
          numberOfGroups: 10,
          worldBounds: { x: 0, y: 0, width: 160, height: 160 },
          groupRadiusRange: { min: 50, max: 50 },
          groupDistanceRange: { min: 50, max: 60 },
        }),
      ),
    ).toThrowError();
  });
});