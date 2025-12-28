import { IMatrix } from "../../IMatrix.js";
import { Matrix4d } from "./matrix4d.js";

export class Matrix4dAdapter implements IMatrix {
  private readonly core: Matrix4d;

  constructor(core?: Matrix4d) {
    this.core = core ? (core.clone() as Matrix4d) : new Matrix4d();
  }

  private static unwrap(mat: IMatrix): Matrix4d {
    if (mat instanceof Matrix4dAdapter) return mat.core;
    if (mat instanceof Matrix4d) return mat;
    throw new Error("IMatrix not backed by Matrix4d");
  }

  multiply(mat: IMatrix): IMatrix {
    const r = this.core.clone() as Matrix4d;
    r.multiply(Matrix4dAdapter.unwrap(mat));
    return new Matrix4dAdapter(r);
  }

  add(mat: IMatrix): IMatrix {
    const r = this.core.clone() as Matrix4d;
    r.add(Matrix4dAdapter.unwrap(mat));
    return new Matrix4dAdapter(r);
  }

  subtract(mat: IMatrix): IMatrix {
    const r = this.core.clone() as Matrix4d;
    r.subtract(Matrix4dAdapter.unwrap(mat));
    return new Matrix4dAdapter(r);
  }

  scale(s: number): IMatrix {
    const r = this.core.clone() as Matrix4d;
    r.scale(s);
    return new Matrix4dAdapter(r);
  }

  transpose(): IMatrix {
    const r = this.core.clone() as Matrix4d;
    r.transpose();
    return new Matrix4dAdapter(r);
  }

  inverse(): IMatrix | null {
    const r = this.core.clone() as Matrix4d;
    return r.inverse() ? new Matrix4dAdapter(r) : null;
  }

  determinant(): number {
    return this.core.determinant();
  }

  applyToVector(v: number[]): number[] {
    const out = v.slice();
    this.core.applyToVector(out);
    return out;
  }

  toFloat32Array(): Float32Array {
    return this.core.toFloat32Array().slice();
  }

  clone(): IMatrix {
    return new Matrix4dAdapter(this.core.clone() as Matrix4d);
  }

  equals(mat: IMatrix, eps = 1e-6): boolean {
    return this.core.equals(Matrix4dAdapter.unwrap(mat), eps);
  }

  setFrom(mat: IMatrix): IMatrix {
    const r = this.core.clone() as Matrix4d;
    r.setFrom(Matrix4dAdapter.unwrap(mat));
    return new Matrix4dAdapter(r);
  }

  setIdentity(): void {
    this.core.setIdentity();
  }
}
