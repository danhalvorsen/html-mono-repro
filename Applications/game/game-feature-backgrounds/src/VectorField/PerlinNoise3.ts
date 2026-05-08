import type { INoise3 } from './INoise3.js';

export class PerlinNoise3 implements INoise3 {
  readonly #perm: Uint8Array;

  public constructor(seed = 1337) {
    this.#perm = this.#createPermutation(seed);
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
      PerlinNoise3.#grad(aaa, xf, yf, zf),
      PerlinNoise3.#grad(baa, xf - 1, yf, zf),
      u,
    );

    const x2 = PerlinNoise3.#lerp(
      PerlinNoise3.#grad(aba, xf, yf - 1, zf),
      PerlinNoise3.#grad(bba, xf - 1, yf - 1, zf),
      u,
    );

    const y1 = PerlinNoise3.#lerp(x1, x2, v);

    const x3 = PerlinNoise3.#lerp(
      PerlinNoise3.#grad(aab, xf, yf, zf - 1),
      PerlinNoise3.#grad(bab, xf - 1, yf, zf - 1),
      u,
    );

    const x4 = PerlinNoise3.#lerp(
      PerlinNoise3.#grad(abb, xf, yf - 1, zf - 1),
      PerlinNoise3.#grad(bbb, xf - 1, yf - 1, zf - 1),
      u,
    );

    return (PerlinNoise3.#lerp(y1, PerlinNoise3.#lerp(x3, x4, v), w) + 1) * 0.5;
  }

  #hash(x: number, y: number, z: number): number {
    return this.#perm[this.#perm[this.#perm[x & 255]! + (y & 255)]! + (z & 255)]!;
  }

  static #fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  static #lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  static #grad(hash: number, x: number, y: number, z: number): number {
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

    for (let i = source.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));

      const current = source[i]!;
      source[i] = source[j]!;
      source[j] = current;
    }

    for (let i = 0; i < result.length; i += 1) {
      result[i] = source[i & 255]!;
    }

    return result;
  }
}