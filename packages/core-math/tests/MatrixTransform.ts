 
import { Vector2 } from "three";

export interface IVectorTransformer {
  transformVec2(v: Vector2): Vector2;
}

export interface Matrix {
  rows: number;
  cols: number;
  data: number[][];
}

export class MatrixTransform implements IVectorTransformer {
  constructor(private readonly matrix: Matrix) {}

  transformVec2(v: Vector2): Vector2 {
    const rows = this.matrix.rows;
    const cols = this.matrix.cols;
    const m = this.matrix.data;

    // ---- 2x2 linear transform ----
    if (rows === 2 && cols === 2) {
      const x = m[0][0] * v.x + m[0][1] * v.y;
      const y = m[1][0] * v.x + m[1][1] * v.y;
      return new Vector2(x, y);
    }

    // ---- 3x3 affine transform ----
    if (rows === 3 && cols === 3) {
      const x = m[0][0] * v.x + m[0][1] * v.y + m[0][2];
      const y = m[1][0] * v.x + m[1][1] * v.y + m[1][2];
      return new Vector2(x, y);
    }

    throw new Error("transformVec2: unsupported matrix size");
  }
}
