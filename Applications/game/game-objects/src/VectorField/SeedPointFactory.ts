import type { Vector2, VectorFieldBounds } from './VectorFieldTypes.js';

export interface SeedPoint extends Vector2 {
  readonly strokeWidth: number;
}

export interface SeedPointFactoryOptions {
  readonly count: number;
  readonly seed: number;
  readonly bounds: VectorFieldBounds;
  readonly minStrokeWidth: number;
  readonly maxStrokeWidth: number;
}

export interface ISeedPointFactory {
  create(options: SeedPointFactoryOptions): readonly SeedPoint[];
}

export class SeedPointFactory implements ISeedPointFactory {
  public create(options: SeedPointFactoryOptions): readonly SeedPoint[] {
    this.#validate(options);

    let state = options.seed >>> 0;

    const random = (): number => {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 0x100000000;
    };

    return Object.freeze(
      Array.from({ length: options.count }, () => ({
        x: random() * options.bounds.width,
        y: random() * options.bounds.height,
        strokeWidth:
          options.minStrokeWidth +
          random() * (options.maxStrokeWidth - options.minStrokeWidth),
      })),
    );
  }

  #validate(options: SeedPointFactoryOptions): void {
    if (!Number.isInteger(options.count) || options.count < 1) {
      throw new RangeError('count must be an integer greater than or equal to 1.');
    }

    if (!Number.isInteger(options.seed)) {
      throw new RangeError('seed must be an integer.');
    }

    if (options.bounds.width <= 0 || options.bounds.height <= 0) {
      throw new RangeError('bounds width and height must be greater than zero.');
    }

    if (options.minStrokeWidth <= 0 || options.maxStrokeWidth < options.minStrokeWidth) {
      throw new RangeError('stroke width range is invalid.');
    }
  }
}