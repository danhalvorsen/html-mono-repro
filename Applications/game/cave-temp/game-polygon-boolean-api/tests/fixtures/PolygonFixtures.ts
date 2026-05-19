import { Polygon } from "@monorepo/game-primetives";

class PolygonFixturePoint {
  public readonly x: number;
  public readonly y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public clone(): PolygonFixturePoint {
    return new PolygonFixturePoint(this.x, this.y);
  }

  public equals(other: Readonly<{ x: number; y: number }>): boolean {
    return this.x === other.x && this.y === other.y;
  }
}

export type BoxFixture = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type PolygonBooleanFixtureSet = Readonly<{
  subject: Polygon;
  clipA: Polygon;
  clipB: Polygon;
  clips: readonly Polygon[];
  emptyResult: readonly Polygon[];
  subjectOnlyResult: readonly Polygon[];
  allPolygonsResult: readonly Polygon[];
}>;

export function createClosedBoxPolygon(box: BoxFixture): Polygon {
  if (box.width <= 0) {
    throw new RangeError("Box width must be positive.");
  }

  if (box.height <= 0) {
    throw new RangeError("Box height must be positive.");
  }

  const points = [
    new PolygonFixturePoint(box.x, box.y),
    new PolygonFixturePoint(box.x + box.width, box.y),
    new PolygonFixturePoint(box.x + box.width, box.y + box.height),
    new PolygonFixturePoint(box.x, box.y + box.height),
  ] as unknown as ConstructorParameters<typeof Polygon>[0];

  return new Polygon(points, true);
}

export function createPolygonBooleanFixtureSet(): PolygonBooleanFixtureSet {
  const subject = createClosedBoxPolygon({
    x: 0,
    y: 0,
    width: 10,
    height: 10,
  });

  const clipA = createClosedBoxPolygon({
    x: 5,
    y: 0,
    width: 10,
    height: 10,
  });

  const clipB = createClosedBoxPolygon({
    x: 2,
    y: 2,
    width: 3,
    height: 3,
  });

  const clips = [clipA, clipB] as const;

  return {
    subject,
    clipA,
    clipB,
    clips,
    emptyResult: [],
    subjectOnlyResult: [subject],
    allPolygonsResult: [subject, clipA, clipB],
  };
}
