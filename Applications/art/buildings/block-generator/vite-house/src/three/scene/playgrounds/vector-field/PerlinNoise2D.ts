export class PerlinNoise2D {
  private readonly permutation: Uint8Array;

  public constructor(seed: number) {
    const values = new Uint8Array(256);
    for (let index = 0; index < 256; index += 1) {
      values[index] = index;
    }

    let random = seed >>> 0;
    for (let index = 255; index > 0; index -= 1) {
      random = this.nextRandom(random);
      const swapIndex = random % (index + 1);
      const temp = values[index];
      values[index] = values[swapIndex];
      values[swapIndex] = temp;
    }

    this.permutation = new Uint8Array(512);
    for (let index = 0; index < 512; index += 1) {
      this.permutation[index] = values[index & 255];
    }
  }

  public noise(x: number, y: number): number {
    const cellX = Math.floor(x) & 255;
    const cellY = Math.floor(y) & 255;

    const localX = x - Math.floor(x);
    const localY = y - Math.floor(y);

    const u = this.fade(localX);
    const v = this.fade(localY);

    const aa = this.permutation[this.permutation[cellX] + cellY];
    const ab = this.permutation[this.permutation[cellX] + cellY + 1];
    const ba = this.permutation[this.permutation[cellX + 1] + cellY];
    const bb = this.permutation[this.permutation[cellX + 1] + cellY + 1];

    const x1 = this.lerp(this.grad(aa, localX, localY), this.grad(ba, localX - 1, localY), u);
    const x2 = this.lerp(this.grad(ab, localX, localY - 1), this.grad(bb, localX - 1, localY - 1), u);

    return this.lerp(x1, x2, v);
  }

  private fade(value: number): number {
    return value * value * value * (value * (value * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3;
    if (h === 0) return x + y;
    if (h === 1) return -x + y;
    if (h === 2) return x - y;
    return -x - y;
  }

  private nextRandom(value: number): number {
    return (value * 1664525 + 1013904223) >>> 0;
  }
}
