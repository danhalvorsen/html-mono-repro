import type { IVectorField, Vector2, VectorFieldBounds } from './VectorFieldTypes.js';

export interface StreamlinePathOptions {
  readonly stepLength: number;
  readonly steps: number;
  readonly bounds: VectorFieldBounds;
}

export class StreamlinePathBuilder {
  readonly #vectorField: IVectorField;
  readonly #options: StreamlinePathOptions;

  public constructor(vectorField: IVectorField, options: StreamlinePathOptions) {
    if (options.stepLength <= 0 || !Number.isFinite(options.stepLength)) {
      throw new RangeError('stepLength must be finite and greater than zero.');
    }

    if (!Number.isInteger(options.steps) || options.steps < 2) {
      throw new RangeError('steps must be an integer greater than or equal to 2.');
    }

    if (options.bounds.width <= 0 || options.bounds.height <= 0) {
      throw new RangeError('bounds width and height must be greater than zero.');
    }

    this.#vectorField = vectorField;
    this.#options = options;
  }

  public build(seed: Vector2, timeSeconds: number): string {
    const points: Vector2[] = [seed];
    let current = seed;

    for (let index = 0; index < this.#options.steps; index += 1) {
      const direction = this.#vectorField.sample(current, timeSeconds);

      current = {
        x: current.x + direction.x * this.#options.stepLength,
        y: current.y + direction.y * this.#options.stepLength,
      };

      if (!this.#isInside(current)) {
        break;
      }

      points.push(current);
    }

    return StreamlinePathBuilder.#toPath(points);
  }

  #isInside(point: Vector2): boolean {
    return (
      point.x >= 0 &&
      point.y >= 0 &&
      point.x <= this.#options.bounds.width &&
      point.y <= this.#options.bounds.height
    );
  }

  static #toPath(points: readonly Vector2[]): string {
    if (points.length < 2) {
      return '';
    }

    const first = points[0];

    if (first === undefined) {
      return '';
    }

    return [
      `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`,
      ...points.slice(1).map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`),
    ].join(' ');
  }
}