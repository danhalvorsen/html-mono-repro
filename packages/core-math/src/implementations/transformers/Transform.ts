import { Vector2, Vector3 } from "three";
import { Matrix } from "../Matrix4.js";
import { IMatrix } from "../../interfaces/IMatrix.js";
import { ITransform } from "../../interfaces/ITransform.js";

export class Transform implements ITransform {
  private matrix: IMatrix;

  constructor(base?: IMatrix) {
    this.matrix = base?.clone() ?? Matrix.identity(3);
  }

  getMatrix(): IMatrix {
    return this.matrix;
  }

  setFrom(matrix: IMatrix): this {
    this.matrix = matrix.clone();
    return this;
  }

  translate(offset: Vector2 | Vector3): this {
    const tx = offset.x;
    const ty = offset.y;
    const t = new Matrix([
      [1, 0, tx],
      [0, 1, ty],
      [0, 0, 1],
    ]);
    this.matrix = t.multiply(this.matrix);
    return this;
  }

  rotate(angle: number): this {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const r = new Matrix([
      [cos, -sin, 0],
      [sin, cos, 0],
      [0, 0, 1],
    ]);
    this.matrix = r.multiply(this.matrix);
    return this;
  }

  scale(sx: number, sy: number): this {
    const s = new Matrix([
      [sx, 0, 0],
      [0, sy, 0],
      [0, 0, 1],
    ]);
    this.matrix = s.multiply(this.matrix);
    return this;
  }

  transformVec2(v: Vector2): Vector2 {
    const m = this.matrix.toFloat32Array();
    const { x, y } = v;

    if (m.length === 4) {
      return new Vector2(m[0] * x + m[1] * y, m[2] * x + m[3] * y);
    }

    if (m.length === 9) {
      return new Vector2(
        m[0] * x + m[1] * y + m[2],
        m[3] * x + m[4] * y + m[5]
      );
    }

    throw new Error('transformVec2: unsupported matrix size');
  }
}
