import type { INoise3 } from './VectorFieldTypes.js';

export class PerlinNoise3 implements INoise3 {
  readonly #permutation: Uint8Array;

  public constructor(seed: number) {
    if (!Number.isInteger(seed)) {
      throw new RangeError('seed must be an integer.');
    }

    this.#permutation = this.#createPermutation(seed);
  }

  public sample(x: number, y: number, z: number): number {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const zi = Math.floor(z) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const zf = z - Math.floor(z);

    const u = PerlinNoise3.#fade(xf);
    const v = PerlinNoise3.#fade(yf);
    const w = PerlinNoise3.#fade(zf);

    const aaa = this.#hash(xi, yi, zi);
    const aba = this.#hash(xi, yi + 1, zi);
    const aab = this.#hash(xi, yi, zi + 1);
    const abb = this.#hash(xi, yi + 1, zi + 1);
    const baa = this.#hash(xi + 1, yi, zi);
    const bba = this.#hash(xi + 1, yi + 1, zi);
    const bab = this.#hash(xi + 1, yi, zi + 1);
    const bbb = this.#hash(xi + 1, yi + 1, zi + 1);

    const x1 = PerlinNoise3.#lerp(
      PerlinNoise3.#gradient(aaa, xf, yf, zf),
      PerlinNoise3.#gradient(baa, xf - 1, yf, zf),
      u,
    );

    const x2 = PerlinNoise3.#lerp(
      PerlinNoise3.#gradient(aba, xf, yf - 1, zf),
      PerlinNoise3.#gradient(bba, xf - 1, yf - 1, zf),
      u,
    );

    const y1 = PerlinNoise3.#lerp(x1, x2, v);

    const x3 = PerlinNoise3.#lerp(
      PerlinNoise3.#gradient(aab, xf, yf, zf - 1),
      PerlinNoise3.#gradient(bab, xf - 1, yf, zf - 1),
      u,
    );

    const x4 = PerlinNoise3.#lerp(
      PerlinNoise3.#gradient(abb, xf, yf - 1, zf - 1),
      PerlinNoise3.#gradient(bbb, xf - 1, yf - 1, zf - 1),
      u,
    );

    return (PerlinNoise3.#lerp(y1, PerlinNoise3.#lerp(x3, x4, v), w) + 1) * 0.5;
  }

  #hash(x: number, y: number, z: number): number {
    return this.#at(this.#at(this.#at(x) + y) + z);
  }

  #at(index: number): number {
    const value = this.#permutation[index & 511];

    if (value === undefined) {
      throw new Error(`Permutation index ${index} is out of range.`);
    }

    return value;
  }

  static #fade(value: number): number {
    return value * value * value * (value * (value * 6 - 15) + 10);
  }

  static #lerp(left: number, right: number, ratio: number): number {
    return left + ratio * (right - left);
  }

  static #gradient(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;

    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  #createPermutation(seed: number): Uint8Array {
    const source = Array.from({ length: 256 }, (_, index) => index);
    const result = new Uint8Array(512);

    let state = seed >>> 0;

    const random = (): number => {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 0x100000000;
    };

    for (let index = source.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));

      const current = source[index];

      if (current === undefined) {
        throw new Error(`Permutation source index ${index} is out of range.`);
      }

      const swap = source[swapIndex];

      if (swap === undefined) {
        throw new Error(`Permutation source index ${swapIndex} is out of range.`);
      }

      source[index] = swap;
      source[swapIndex] = current;
    }

    for (let index = 0; index < result.length; index += 1) {
      const sourceValue = source[index & 255];

      if (sourceValue === undefined) {
        throw new Error(`Permutation source index ${index & 255} is out of range.`);
      }

      result[index] = sourceValue;
    }

    return result;
  }
}