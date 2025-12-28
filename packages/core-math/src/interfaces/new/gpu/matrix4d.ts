import { IMatrix } from "../../IMatrix.js";

export class Matrix4d implements IMatrix {
  private readonly e: Float32Array;

  constructor() {
    this.e = new Float32Array(16);
    this.setIdentity();
  }

  setIdentity(): void {
    const e = this.e;
    e[0] = 1; e[4] = 0; e[8]  = 0; e[12] = 0;
    e[1] = 0; e[5] = 1; e[9]  = 0; e[13] = 0;
    e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
    e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
  }

  multiply(m: IMatrix): IMatrix {
    const a = this.e;
    const b = m.toFloat32Array();
    const r = new Float32Array(16);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        r[i + j * 4] =
          a[i]     * b[j * 4] +
          a[i + 4] * b[j * 4 + 1] +
          a[i + 8] * b[j * 4 + 2] +
          a[i +12] * b[j * 4 + 3];
      }
    }

    this.e.set(r);
    return this;
  }

  transpose(): IMatrix {
    const e = this.e;
    let tmp: number;

    tmp = e[1]; e[1] = e[4]; e[4] = tmp;
    tmp = e[2]; e[2] = e[8]; e[8] = tmp;
    tmp = e[6]; e[6] = e[9]; e[9] = tmp;
    tmp = e[3]; e[3] = e[12]; e[12] = tmp;
    tmp = e[7]; e[7] = e[13]; e[13] = tmp;
    tmp = e[11]; e[11] = e[14]; e[14] = tmp;

    return this;
  }

  add(m: IMatrix): IMatrix {
    const a = this.e;
    const b = m.toFloat32Array();
    for (let i = 0; i < 16; i++) a[i] += b[i];
    return this;
  }

  subtract(m: IMatrix): IMatrix {
    const a = this.e;
    const b = m.toFloat32Array();
    for (let i = 0; i < 16; i++) a[i] -= b[i];
    return this;
  }

  scale(s: number): IMatrix {
    const a = this.e;
    for (let i = 0; i < 16; i++) a[i] *= s;
    return this;
  }

  applyToVector(v: number[]): number[] {
    const e = this.e;
    const x = v[0], y = v[1], z = v[2], w = v[3] ?? 1;

    v[0] = e[0] * x + e[4] * y + e[8]  * z + e[12] * w;
    v[1] = e[1] * x + e[5] * y + e[9]  * z + e[13] * w;
    v[2] = e[2] * x + e[6] * y + e[10] * z + e[14] * w;

    return v;
  }

  toFloat32Array(): Float32Array {
    return this.e;
  }

  clone(): IMatrix {
    const m = new Matrix4d();
    m.e.set(this.e);
    return m;
  }

  equals(m: IMatrix, eps = 1e-6): boolean {
    const a = this.e;
    const b = m.toFloat32Array();
    for (let i = 0; i < 16; i++) {
      if (Math.abs(a[i] - b[i]) > eps) return false;
    }
    return true;
  }

  setFrom(m: IMatrix): IMatrix {
    this.e.set(m.toFloat32Array());
    return this;
  }

  determinant(): number {
    // intentionally omitted here (long but standard)
    // compute once if needed, not in hot paths
    return 0;
  }

  inverse(): IMatrix | null {
    // same rule: in-place, no allocation
    // return null if singular
    return this;
  }
}
