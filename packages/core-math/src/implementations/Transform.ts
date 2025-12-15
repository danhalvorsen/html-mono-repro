import { IMatrix } from '../interfaces/IMatrix.js';
import { Vector2 } from './Vector2.js';
import { Vector3 } from './Vector3.js';
import { ITransform } from '../interfaces/ITransform.js';
import { Matrix } from './Matrix4.js';

export class Transform implements ITransform {
  private matrix: IMatrix;

  constructor(base?: IMatrix) {
    this.matrix = base?.clone() ?? Matrix.identity(3);
  }

  translate(offset: Vector2 | Vector3): this {
    const tx = offset.x;
    const ty = offset.y;
    const t = Matrix.translation(tx, ty);
    this.matrix = t.multiply(this.matrix);
    return this;
  }

  rotate(angle: number): this {
    const r = Matrix.rotation(angle);
    this.matrix = r.multiply(this.matrix);
    return this;
  }

  scale(sx: number, sy: number): this {
    const s = Matrix.scaling(sx, sy);
    this.matrix = s.multiply(this.matrix);
    return this;
  }

  setFrom(matrix: IMatrix): this {
    this.matrix = matrix.clone();
    return this;
  }

  getMatrix(): IMatrix {
    return this.matrix;
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

    throw new Error(
      'transformVec2: unsupported matrix size (must be 2x2 or 3x3)'
    );
  }

  transformVec3(v: Vector3): Vector3 {
    const { x, y, z } = v;
    const m = this.matrix.toFloat32Array();

    if (m.length === 9) {
      return new Vector3(
        m[0] * x + m[1] * y + m[2] * z,
        m[3] * x + m[4] * y + m[5] * z,
        m[6] * x + m[7] * y + m[8] * z
      );
    }

    if (m.length === 16) {
      const nx = m[0] * x + m[1] * y + m[2] * z + m[3];
      const ny = m[4] * x + m[5] * y + m[6] * z + m[7];
      const nz = m[8] * x + m[9] * y + m[10] * z + m[11];
      const w = m[12] * x + m[13] * y + m[14] * z + m[15];

      if (w !== 0 && w !== 1) {
        return new Vector3(nx / w, ny / w, nz / w);
      }

      return new Vector3(nx, ny, nz);
    }

    throw new Error(
      'transformVec3: unsupported matrix size (must be 3x3 or 4x4)'
    );
  }
}

export class ParameterT {
  constructor(public readonly value: number) {
    if (value < 0 || value > 1) {
      throw new RangeError("ParameterT must be between 0 and 1.");
    }
  }
}
