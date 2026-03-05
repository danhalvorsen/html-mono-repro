export interface INoise {
  sample(x: number, y: number): number;
}

export class PerlinNoise implements INoise {
  private gradients: Map<string, [number, number]> = new Map();

  constructor(private readonly seed = 1) {}

  private rand(x: number, y: number) {
    const k = Math.sin(x * 15731 + y * 789221 + this.seed) * 43758.5453;
    return k - Math.floor(k);
  }

  private gradient(ix: number, iy: number): [number, number] {
    const key = `${ix},${iy}`;
    if (!this.gradients.has(key)) {
      const theta = this.rand(ix, iy) * 2 * Math.PI;
      this.gradients.set(key, [Math.cos(theta), Math.sin(theta)]);
    }
    return this.gradients.get(key)!;
  }

  private dotGridGradient(ix: number, iy: number, x: number, y: number) {
    const [gx, gy] = this.gradient(ix, iy);
    return (x - ix) * gx + (y - iy) * gy;
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  public sample(x: number, y: number): number {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = x0 + 1;
    const y1 = y0 + 1;

    const sx = this.fade(x - x0);
    const sy = this.fade(y - y0);

    const n0 = this.dotGridGradient(x0, y0, x, y);
    const n1 = this.dotGridGradient(x1, y0, x, y);
    const ix0 = n0 + sx * (n1 - n0);

    const n2 = this.dotGridGradient(x0, y1, x, y);
    const n3 = this.dotGridGradient(x1, y1, x, y);
    const ix1 = n2 + sx * (n3 - n2);

    return ix0 + sy * (ix1 - ix0);
  }
}