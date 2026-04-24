/* code.ts
   Self-contained production code
   - Rectangle groups with inner rectangles
   - Circle groups with inner circles
   - Deterministic random source
   - Group color + per-shape fill color palette derived from group color
   - No imports
*/

/* ===========================
   Shared domain
=========================== */

type Bounds = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

type IntRange = {
  readonly min: number;
  readonly max: number;
};

type SizeRange = {
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly minHeight: number;
  readonly maxHeight: number;
};

type DistanceRange = {
  readonly min: number;
  readonly max: number;
};

type RgbColor = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
};

class LayoutError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'LayoutError';
  }
}

interface IRandom {
  nextIntInclusive(min: number, max: number): number;
}

class Mulberry32Random implements IRandom {
  private _state: number;

  public constructor(seed: number) {
    this._state = seed >>> 0;
  }

  public nextIntInclusive(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new LayoutError('Random range must be integer based.');
    }

    if (max < min) {
      throw new LayoutError(`Invalid range. min=${min}, max=${max}`);
    }

    const value = this.nextUnit();
    return Math.floor(value * (max - min + 1)) + min;
  }

  private nextUnit(): number {
    let t = (this._state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

interface IAttemptPolicy {
  readonly maxGroupPlacementAttempts: number;
  readonly maxInnerPlacementAttemptsPerGroup: number;
}

class DefaultAttemptPolicy implements IAttemptPolicy {
  public constructor(
    public readonly maxGroupPlacementAttempts: number = 2000,
    public readonly maxInnerPlacementAttemptsPerGroup: number = 1000,
  ) {
    if (maxGroupPlacementAttempts <= 0) {
      throw new LayoutError('maxGroupPlacementAttempts must be greater than zero.');
    }

    if (maxInnerPlacementAttemptsPerGroup <= 0) {
      throw new LayoutError('maxInnerPlacementAttemptsPerGroup must be greater than zero.');
    }
  }
}

/* ===========================
   Validation
=========================== */

class Guard {
  public static againstNonPositiveInteger(value: number, name: string): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new LayoutError(`${name} must be a positive integer.`);
    }
  }

  public static againstNegativeNumber(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new LayoutError(`${name} must be a finite number greater than or equal to zero.`);
    }
  }

  public static againstInvalidBounds(bounds: Bounds, name: string): void {
    if (!Number.isFinite(bounds.x) || !Number.isFinite(bounds.y)) {
      throw new LayoutError(`${name} coordinates must be finite.`);
    }

    if (!Number.isFinite(bounds.width) || bounds.width <= 0) {
      throw new LayoutError(`${name}.width must be greater than zero.`);
    }

    if (!Number.isFinite(bounds.height) || bounds.height <= 0) {
      throw new LayoutError(`${name}.height must be greater than zero.`);
    }
  }

  public static againstInvalidIntRange(range: IntRange, name: string): void {
    this.againstNonPositiveInteger(range.min, `${name}.min`);
    this.againstNonPositiveInteger(range.max, `${name}.max`);

    if (range.max < range.min) {
      throw new LayoutError(`${name}.max must be greater than or equal to ${name}.min.`);
    }
  }

  public static againstInvalidSizeRange(range: SizeRange, name: string): void {
    this.againstNonPositiveInteger(range.minWidth, `${name}.minWidth`);
    this.againstNonPositiveInteger(range.maxWidth, `${name}.maxWidth`);
    this.againstNonPositiveInteger(range.minHeight, `${name}.minHeight`);
    this.againstNonPositiveInteger(range.maxHeight, `${name}.maxHeight`);

    if (range.maxWidth < range.minWidth) {
      throw new LayoutError(`${name}.maxWidth must be greater than or equal to ${name}.minWidth.`);
    }

    if (range.maxHeight < range.minHeight) {
      throw new LayoutError(`${name}.maxHeight must be greater than or equal to ${name}.minHeight.`);
    }
  }

  public static againstInvalidDistanceRange(range: DistanceRange, name: string): void {
    this.againstNegativeNumber(range.min, `${name}.min`);
    this.againstNegativeNumber(range.max, `${name}.max`);

    if (range.max < range.min) {
      throw new LayoutError(`${name}.max must be greater than or equal to ${name}.min.`);
    }
  }

  public static againstInvalidRgbColor(color: RgbColor, name: string): void {
    this.againstInvalidChannel(color.r, `${name}.r`);
    this.againstInvalidChannel(color.g, `${name}.g`);
    this.againstInvalidChannel(color.b, `${name}.b`);
  }

  private static againstInvalidChannel(value: number, name: string): void {
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw new LayoutError(`${name} must be an integer in range [0,255].`);
    }
  }
}

/* ===========================
   Color services
=========================== */

interface IColorPaletteGenerator {
  createGroupColor(): RgbColor;
  createShapeColor(groupColor: RgbColor): RgbColor;
}

class RandomPaletteGenerator implements IColorPaletteGenerator {
  public constructor(
    private readonly _random: IRandom,
  ) {}

  public createGroupColor(): RgbColor {
    const color: RgbColor = {
      r: this._random.nextIntInclusive(32, 224),
      g: this._random.nextIntInclusive(32, 224),
      b: this._random.nextIntInclusive(32, 224),
    };

    Guard.againstInvalidRgbColor(color, 'groupColor');
    return color;
  }

  public createShapeColor(groupColor: RgbColor): RgbColor {
    Guard.againstInvalidRgbColor(groupColor, 'groupColor');

    return {
      r: this.clampChannel(groupColor.r + this._random.nextIntInclusive(-28, 28)),
      g: this.clampChannel(groupColor.g + this._random.nextIntInclusive(-28, 28)),
      b: this.clampChannel(groupColor.b + this._random.nextIntInclusive(-28, 28)),
    };
  }

  private clampChannel(value: number): number {
    if (value < 0) {
      return 0;
    }

    if (value > 255) {
      return 255;
    }

    return value;
  }
}

/* ===========================
   Rectangle domain
=========================== */

type Rectangle = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

type ColoredRectangle = Rectangle & {
  readonly fillColor: RgbColor;
};

type RectangleGroup = {
  readonly id: number;
  readonly groupColor: RgbColor;
  readonly bounds: Rectangle;
  readonly rectangles: readonly ColoredRectangle[];
};

type RectangleGroupLayout = {
  readonly groups: readonly RectangleGroup[];
};

type CreateRectangleGroupsRequest = {
  readonly numberOfGroups: number;
  readonly worldBounds: Bounds;
  readonly groupSizeRange: SizeRange;
  readonly groupDistanceRange: DistanceRange;
  readonly rectangleSizeRange: SizeRange;
  readonly rectangleDistanceRange: DistanceRange;
  readonly rectanglesPerGroupRange: IntRange;
};

class RectangleGeometry {
  public intersects(left: Rectangle, right: Rectangle): boolean {
    return !(
      left.x + left.width <= right.x ||
      right.x + right.width <= left.x ||
      left.y + left.height <= right.y ||
      right.y + right.height <= left.y
    );
  }

  public intersectsAny(candidate: Rectangle, others: readonly Rectangle[]): boolean {
    for (const other of others) {
      if (this.intersects(candidate, other)) {
        return true;
      }
    }

    return false;
  }

  public distance(left: Rectangle, right: Rectangle): number {
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

  public contains(bounds: Bounds, rectangle: Rectangle): boolean {
    return (
      rectangle.x >= bounds.x &&
      rectangle.y >= bounds.y &&
      rectangle.x + rectangle.width <= bounds.x + bounds.width &&
      rectangle.y + rectangle.height <= bounds.y + bounds.height
    );
  }
}

interface IRectangleFactory {
  create(bounds: Bounds, sizeRange: SizeRange): Rectangle;
}

class RandomRectangleFactory implements IRectangleFactory {
  public constructor(
    private readonly _random: IRandom,
  ) {}

  public create(bounds: Bounds, sizeRange: SizeRange): Rectangle {
    Guard.againstInvalidBounds(bounds, 'bounds');
    Guard.againstInvalidSizeRange(sizeRange, 'sizeRange');

    const width = this._random.nextIntInclusive(sizeRange.minWidth, sizeRange.maxWidth);
    const height = this._random.nextIntInclusive(sizeRange.minHeight, sizeRange.maxHeight);

    if (width > bounds.width || height > bounds.height) {
      throw new LayoutError('Rectangle size exceeds the available bounds.');
    }

    const x = this._random.nextIntInclusive(bounds.x, bounds.x + bounds.width - width);
    const y = this._random.nextIntInclusive(bounds.y, bounds.y + bounds.height - height);

    return {
      x,
      y,
      width,
      height,
    };
  }
}

class RectangleGroupRequestValidator {
  public validate(request: CreateRectangleGroupsRequest): void {
    Guard.againstNonPositiveInteger(request.numberOfGroups, 'numberOfGroups');
    Guard.againstInvalidBounds(request.worldBounds, 'worldBounds');
    Guard.againstInvalidSizeRange(request.groupSizeRange, 'groupSizeRange');
    Guard.againstInvalidDistanceRange(request.groupDistanceRange, 'groupDistanceRange');
    Guard.againstInvalidSizeRange(request.rectangleSizeRange, 'rectangleSizeRange');
    Guard.againstInvalidDistanceRange(request.rectangleDistanceRange, 'rectangleDistanceRange');
    Guard.againstInvalidIntRange(request.rectanglesPerGroupRange, 'rectanglesPerGroupRange');

    if (
      request.groupSizeRange.minWidth > request.worldBounds.width ||
      request.groupSizeRange.minHeight > request.worldBounds.height
    ) {
      throw new LayoutError('Minimum group size must fit inside worldBounds.');
    }

    if (
      request.rectangleSizeRange.minWidth > request.groupSizeRange.minWidth ||
      request.rectangleSizeRange.minHeight > request.groupSizeRange.minHeight
    ) {
      throw new LayoutError('Minimum rectangle size must fit inside the minimum group size.');
    }
  }
}

class RectangleGroupLayoutGenerator {
  private readonly _geometry: RectangleGeometry;
  private readonly _validator: RectangleGroupRequestValidator;

  public constructor(
    private readonly _rectangleFactory: IRectangleFactory,
    private readonly _random: IRandom,
    private readonly _attemptPolicy: IAttemptPolicy,
    private readonly _paletteGenerator: IColorPaletteGenerator,
  ) {
    this._geometry = new RectangleGeometry();
    this._validator = new RectangleGroupRequestValidator();
  }

  public create(request: CreateRectangleGroupsRequest): RectangleGroupLayout {
    this._validator.validate(request);

    const groups: RectangleGroup[] = [];

    for (let index = 0; index < request.numberOfGroups; index++) {
      const groupBounds = this.placeGroupBounds(request, groups.map(group => group.bounds));
      const groupColor = this._paletteGenerator.createGroupColor();
      const rectangles = this.placeGroupRectangles(request, groupBounds, groupColor);

      groups.push({
        id: index + 1,
        groupColor,
        bounds: groupBounds,
        rectangles,
      });
    }

    return {
      groups,
    };
  }

  private placeGroupBounds(
    request: CreateRectangleGroupsRequest,
    existingGroups: readonly Rectangle[],
  ): Rectangle {
    for (let attempt = 0; attempt < this._attemptPolicy.maxGroupPlacementAttempts; attempt++) {
      const candidate = this._rectangleFactory.create(request.worldBounds, request.groupSizeRange);

      if (!this._geometry.contains(request.worldBounds, candidate)) {
        continue;
      }

      if (!this.satisfiesDistanceRange(candidate, existingGroups, request.groupDistanceRange)) {
        continue;
      }

      return candidate;
    }

    throw new LayoutError('Unable to place rectangle group bounds within the configured attempt limit.');
  }

  private placeGroupRectangles(
    request: CreateRectangleGroupsRequest,
    groupBounds: Rectangle,
    groupColor: RgbColor,
  ): readonly ColoredRectangle[] {
    const rectangles: ColoredRectangle[] = [];
    const count = this._random.nextIntInclusive(
      request.rectanglesPerGroupRange.min,
      request.rectanglesPerGroupRange.max,
    );

    for (let index = 0; index < count; index++) {
      let placed = false;

      for (let attempt = 0; attempt < this._attemptPolicy.maxInnerPlacementAttemptsPerGroup; attempt++) {
        const candidate = this._rectangleFactory.create(groupBounds, request.rectangleSizeRange);

        if (!this._geometry.contains(groupBounds, candidate)) {
          continue;
        }

        if (this._geometry.intersectsAny(candidate, rectangles)) {
          continue;
        }

        if (!this.satisfiesDistanceRange(candidate, rectangles, request.rectangleDistanceRange)) {
          continue;
        }

        rectangles.push({
          ...candidate,
          fillColor: this._paletteGenerator.createShapeColor(groupColor),
        });

        placed = true;
        break;
      }

      if (!placed) {
        throw new LayoutError('Unable to place rectangle inside the group within the configured attempt limit.');
      }
    }

    return rectangles;
  }

  private satisfiesDistanceRange(
    candidate: Rectangle,
    others: readonly Rectangle[],
    distanceRange: DistanceRange,
  ): boolean {
    for (const other of others) {
      const distance = this._geometry.distance(candidate, other);

      if (distance < distanceRange.min) {
        return false;
      }

      if (distance > distanceRange.max) {
        return false;
      }
    }

    return true;
  }
}

/* ===========================
   Circle domain
=========================== */

type Circle = {
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
};

type ColoredCircle = Circle & {
  readonly fillColor: RgbColor;
};

type CircleGroup = {
  readonly id: number;
  readonly groupColor: RgbColor;
  readonly bounds: Circle;
  readonly circles: readonly ColoredCircle[];
};

type CircleGroupLayout = {
  readonly groups: readonly CircleGroup[];
};

type CreateCircleGroupsRequest = {
  readonly numberOfGroups: number;
  readonly worldBounds: Bounds;
  readonly groupRadiusRange: IntRange;
  readonly groupDistanceRange: DistanceRange;
  readonly circleRadiusRange: IntRange;
  readonly circleDistanceRange: DistanceRange;
  readonly circlesPerGroupRange: IntRange;
};

class CircleGeometry {
  public intersects(left: Circle, right: Circle): boolean {
    const dx = left.cx - right.cx;
    const dy = left.cy - right.cy;
    const radiusSum = left.radius + right.radius;

    return ((dx * dx) + (dy * dy)) < (radiusSum * radiusSum);
  }

  public intersectsAny(candidate: Circle, others: readonly Circle[]): boolean {
    for (const other of others) {
      if (this.intersects(candidate, other)) {
        return true;
      }
    }

    return false;
  }

  public distance(left: Circle, right: Circle): number {
    const dx = left.cx - right.cx;
    const dy = left.cy - right.cy;
    const centerDistance = Math.sqrt((dx * dx) + (dy * dy));
    return Math.max(0, centerDistance - (left.radius + right.radius));
  }

  public contains(bounds: Bounds, circle: Circle): boolean {
    return (
      circle.cx - circle.radius >= bounds.x &&
      circle.cy - circle.radius >= bounds.y &&
      circle.cx + circle.radius <= bounds.x + bounds.width &&
      circle.cy + circle.radius <= bounds.y + bounds.height
    );
  }
}

interface ICircleFactory {
  create(bounds: Bounds, radiusRange: IntRange): Circle;
}

class RandomCircleFactory implements ICircleFactory {
  public constructor(
    private readonly _random: IRandom,
  ) {}

  public create(bounds: Bounds, radiusRange: IntRange): Circle {
    Guard.againstInvalidBounds(bounds, 'bounds');
    Guard.againstInvalidIntRange(radiusRange, 'radiusRange');

    const radius = this._random.nextIntInclusive(radiusRange.min, radiusRange.max);

    if ((radius * 2) > bounds.width || (radius * 2) > bounds.height) {
      throw new LayoutError('Circle diameter exceeds the available bounds.');
    }

    const cx = this._random.nextIntInclusive(bounds.x + radius, bounds.x + bounds.width - radius);
    const cy = this._random.nextIntInclusive(bounds.y + radius, bounds.y + bounds.height - radius);

    return {
      cx,
      cy,
      radius,
    };
  }
}

class CircleGroupRequestValidator {
  public validate(request: CreateCircleGroupsRequest): void {
    Guard.againstNonPositiveInteger(request.numberOfGroups, 'numberOfGroups');
    Guard.againstInvalidBounds(request.worldBounds, 'worldBounds');
    Guard.againstInvalidIntRange(request.groupRadiusRange, 'groupRadiusRange');
    Guard.againstInvalidDistanceRange(request.groupDistanceRange, 'groupDistanceRange');
    Guard.againstInvalidIntRange(request.circleRadiusRange, 'circleRadiusRange');
    Guard.againstInvalidDistanceRange(request.circleDistanceRange, 'circleDistanceRange');
    Guard.againstInvalidIntRange(request.circlesPerGroupRange, 'circlesPerGroupRange');

    if ((request.groupRadiusRange.min * 2) > request.worldBounds.width) {
      throw new LayoutError('Minimum group diameter must fit inside worldBounds width.');
    }

    if ((request.groupRadiusRange.min * 2) > request.worldBounds.height) {
      throw new LayoutError('Minimum group diameter must fit inside worldBounds height.');
    }

    if (request.circleRadiusRange.min > request.groupRadiusRange.min) {
      throw new LayoutError('Minimum circle radius must fit inside the minimum group radius.');
    }
  }
}

class CircleGroupLayoutGenerator {
  private readonly _geometry: CircleGeometry;
  private readonly _validator: CircleGroupRequestValidator;

  public constructor(
    private readonly _circleFactory: ICircleFactory,
    private readonly _random: IRandom,
    private readonly _attemptPolicy: IAttemptPolicy,
    private readonly _paletteGenerator: IColorPaletteGenerator,
  ) {
    this._geometry = new CircleGeometry();
    this._validator = new CircleGroupRequestValidator();
  }

  public create(request: CreateCircleGroupsRequest): CircleGroupLayout {
    this._validator.validate(request);

    const groups: CircleGroup[] = [];

    for (let index = 0; index < request.numberOfGroups; index++) {
      const groupBounds = this.placeGroupBounds(request, groups.map(group => group.bounds));
      const groupColor = this._paletteGenerator.createGroupColor();
      const circles = this.placeGroupCircles(request, groupBounds, groupColor);

      groups.push({
        id: index + 1,
        groupColor,
        bounds: groupBounds,
        circles,
      });
    }

    return {
      groups,
    };
  }

  private placeGroupBounds(
    request: CreateCircleGroupsRequest,
    existingGroups: readonly Circle[],
  ): Circle {
    for (let attempt = 0; attempt < this._attemptPolicy.maxGroupPlacementAttempts; attempt++) {
      const candidate = this._circleFactory.create(request.worldBounds, request.groupRadiusRange);

      if (!this._geometry.contains(request.worldBounds, candidate)) {
        continue;
      }

      if (!this.satisfiesDistanceRange(candidate, existingGroups, request.groupDistanceRange)) {
        continue;
      }

      return candidate;
    }

    throw new LayoutError('Unable to place circle group bounds within the configured attempt limit.');
  }

  private placeGroupCircles(
    request: CreateCircleGroupsRequest,
    groupBounds: Circle,
    groupColor: RgbColor,
  ): readonly ColoredCircle[] {
    const circles: ColoredCircle[] = [];
    const count = this._random.nextIntInclusive(
      request.circlesPerGroupRange.min,
      request.circlesPerGroupRange.max,
    );

    const groupBoundsBox: Bounds = {
      x: groupBounds.cx - groupBounds.radius,
      y: groupBounds.cy - groupBounds.radius,
      width: groupBounds.radius * 2,
      height: groupBounds.radius * 2,
    };

    for (let index = 0; index < count; index++) {
      let placed = false;

      for (let attempt = 0; attempt < this._attemptPolicy.maxInnerPlacementAttemptsPerGroup; attempt++) {
        const candidate = this._circleFactory.create(groupBoundsBox, request.circleRadiusRange);

        if (!this._geometry.contains(groupBoundsBox, candidate)) {
          continue;
        }

        if (this._geometry.intersectsAny(candidate, circles)) {
          continue;
        }

        if (!this.satisfiesDistanceRange(candidate, circles, request.circleDistanceRange)) {
          continue;
        }

        circles.push({
          ...candidate,
          fillColor: this._paletteGenerator.createShapeColor(groupColor),
        });

        placed = true;
        break;
      }

      if (!placed) {
        throw new LayoutError('Unable to place circle inside the group within the configured attempt limit.');
      }
    }

    return circles;
  }

  private satisfiesDistanceRange(
    candidate: Circle,
    others: readonly Circle[],
    distanceRange: DistanceRange,
  ): boolean {
    for (const other of others) {
      const distance = this._geometry.distance(candidate, other);

      if (distance < distanceRange.min) {
        return false;
      }

      if (distance > distanceRange.max) {
        return false;
      }
    }

    return true;
  }
}

/* ===========================
   Composition root
=========================== */

class LayoutCompositionRoot {
  public static createRectangleGroupLayoutGenerator(seed: number): RectangleGroupLayoutGenerator {
    const random = new Mulberry32Random(seed);
    const attemptPolicy = new DefaultAttemptPolicy();
    const paletteGenerator = new RandomPaletteGenerator(random);
    const rectangleFactory = new RandomRectangleFactory(random);

    return new RectangleGroupLayoutGenerator(
      rectangleFactory,
      random,
      attemptPolicy,
      paletteGenerator,
    );
  }

  public static createCircleGroupLayoutGenerator(seed: number): CircleGroupLayoutGenerator {
    const random = new Mulberry32Random(seed);
    const attemptPolicy = new DefaultAttemptPolicy();
    const paletteGenerator = new RandomPaletteGenerator(random);
    const circleFactory = new RandomCircleFactory(random);

    return new CircleGroupLayoutGenerator(
      circleFactory,
      random,
      attemptPolicy,
      paletteGenerator,
    );
  }
}

export { LayoutCompositionRoot };
export type {
  Bounds,
  Circle,
  CircleGroupLayout,
  CreateCircleGroupsRequest,
  CreateRectangleGroupsRequest,
  Rectangle,
  RectangleGroupLayout,
  RgbColor,
};
