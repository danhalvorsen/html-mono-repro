import type { INoise3 } from './INoise3.js';
import type { IVectorField, Vector2 } from './IVectorField.js';

export interface CurlNoiseVectorFieldOptions {
  readonly scale: number;
  readonly timeScale: number;
  readonly derivativeStep: number;
}

export class CurlNoiseVectorField implements IVectorField {
  readonly #noise: INoise3;
  readonly #options: CurlNoiseVectorFieldOptions;

  public constructor(noise: INoise3, options: CurlNoiseVectorFieldOptions) {
    if (options.scale <= 0) {
      throw new Error('scale must be greater than zero.');
    }

    if (options.derivativeStep <= 0) {
      throw new Error('derivativeStep must be greater than zero.');
    }

    this.#noise = noise;
    this.#options = options;
  }

  public sample(position: Vector2, timeSeconds: number): Vector2 {
    const x = position.x * this.#options.scale;
    const y = position.y * this.#options.scale;
    const z = timeSeconds * this.#options.timeScale;
    const e = this.#options.derivativeStep;

    const up = this.#noise.sample(x, y + e, z);
    const down = this.#noise.sample(x, y - e, z);
    const right = this.#noise.sample(x + e, y, z);
    const left = this.#noise.sample(x - e, y, z);

    const dx = (up - down) / (2 * e);
    const dy = (right - left) / (2 * e);

    return CurlNoiseVectorField.#normalize({ x: dx, y: -dy });
  }

  static #normalize(vector: Vector2): Vector2 {
    const length = Math.hypot(vector.x, vector.y);

    if (length <= Number.EPSILON) {
      return { x: 1, y: 0 };
    }

    return {
      x: vector.x / length,
      y: vector.y / length,
    };
  }
}