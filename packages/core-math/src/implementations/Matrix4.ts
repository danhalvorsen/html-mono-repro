import { IMatrix } from '../interfaces/IMatrix.js';

export class Matrix implements IMatrix {
  public static translation(tx: number, ty: number): Matrix {
    return new Matrix([
      [1, 0, tx],
      [0, 1, ty],
      [0, 0, 1],
    ]);
  }
  public static rotation(angle: number): Matrix {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return new Matrix([
      [cos, -sin, 0],
      [sin, cos, 0],
      [0, 0, 1],
    ]);
  }
  public static scaling(sx: number, sy: number): Matrix {
    return new Matrix([
      [sx, 0, 0],
      [0, sy, 0],
      [0, 0, 1],
    ]);
  }
  private data: Float32Array;
  private size: number;

  constructor(data: number[][]) {
    this.size = data.length;
    this.data = new Float32Array(this.size * this.size);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.data[i * this.size + j] = data[i][j];
      }
    }
  }

  static fromFlatData(flat: Float32Array, size: number): Matrix {
    const m = Object.create(Matrix.prototype) as Matrix;
    m.size = size;
    m.data = flat;
    return m;
  }

  public static identity(size: number): Matrix {
    const flat = new Float32Array(size * size);
    for (let i = 0; i < size; i++) {
      flat[i * size + i] = 1;
    }
    return Matrix.fromFlatData(flat, size);
  }

  clone(): IMatrix {
    return Matrix.fromFlatData(new Float32Array(this.data), this.size);
  }

  multiply(mat: IMatrix): IMatrix {
    const size = this.size;
    const result = new Float32Array(size * size);
    const m = mat.toFloat32Array();

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let sum = 0;
        for (let k = 0; k < size; k++) {
          sum += this.data[i * size + k] * m[k * size + j];
        }
        result[i * size + j] = sum;
      }
    }

    return Matrix.fromFlatData(result, size);
  }

  setIdentity(): void {
    this.data.fill(0);
    for (let i = 0; i < this.size; i++) {
      this.data[i * this.size + i] = 1;
    }
  }

  transpose(): IMatrix {
    const size = this.size;
    const result = new Float32Array(size * size);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        result[j * size + i] = this.data[i * size + j];
      }
    }
    return Matrix.fromFlatData(result, size);
  }

  determinant(): number {
    if (this.size === 2) {
      return this.data[0] * this.data[3] - this.data[1] * this.data[2];
    }

    let det = 0;
    for (let i = 0; i < this.size; i++) {
      const subMatrix = this.getSubMatrix(0, i);
      det += (i % 2 === 0 ? 1 : -1) * this.data[i] * subMatrix.determinant();
    }
    return det;
  }

  inverse(): IMatrix | null {
    const size = this.size;
    const identity = Matrix.identity(size);
    const temp = new Float32Array(this.data);

    for (let i = 0; i < size; i++) {
      const pivot = temp[i * size + i];
      if (pivot === 0) return null;

      for (let j = 0; j < size; j++) {
        temp[i * size + j] /= pivot;
        identity.data[i * size + j] /= pivot;
      }

      for (let k = 0; k < size; k++) {
        if (k !== i) {
          const factor = temp[k * size + i];
          for (let j = 0; j < size; j++) {
            temp[k * size + j] -= factor * temp[i * size + j];
            identity.data[k * size + j] -= factor * identity.data[i * size + j];
          }
        }
      }
    }

    return Matrix.fromFlatData(identity.data.slice(), size);
  }

  add(mat: IMatrix): IMatrix {
    const m = mat.toFloat32Array();
    const result = new Float32Array(this.data.length);
    for (let i = 0; i < this.data.length; i++) {
      result[i] = this.data[i] + m[i];
    }
    return Matrix.fromFlatData(result, this.size);
  }

  subtract(mat: IMatrix): IMatrix {
    const m = mat.toFloat32Array();
    const result = new Float32Array(this.data.length);
    for (let i = 0; i < this.data.length; i++) {
      result[i] = this.data[i] - m[i];
    }
    return Matrix.fromFlatData(result, this.size);
  }

  scale(scalar: number): IMatrix {
    const result = new Float32Array(this.data.length);
    for (let i = 0; i < this.data.length; i++) {
      result[i] = this.data[i] * scalar;
    }
    return Matrix.fromFlatData(result, this.size);
  }

  applyToVector(vec: number[]): number[] {
    if (vec.length !== this.size)
      throw new Error('Vector length must match matrix size.');
    const result = new Float32Array(this.size);
    for (let i = 0; i < this.size; i++) {
      let sum = 0;
      for (let j = 0; j < this.size; j++) {
        sum += this.data[i * this.size + j] * vec[j];
      }
      result[i] = sum;
    }
    return Array.from(result);
  }

  setFrom(mat: IMatrix): IMatrix {
    const m = mat.toFloat32Array();
    if (m.length !== this.data.length) throw new Error('Matrix size mismatch.');
    for (let i = 0; i < m.length; i++) {
      this.data[i] = m[i];
    }
    return this;
  }

  equals(mat: IMatrix, epsilon: number = 1e-6): boolean {
    const m = mat.toFloat32Array();
    if (m.length !== this.data.length) return false;
    for (let i = 0; i < m.length; i++) {
      if (Math.abs(this.data[i] - m[i]) > epsilon) return false;
    }
    return true;
  }

  toFloat32Array(): Float32Array {
    return new Float32Array(this.data);
  }

  private getSubMatrix(row: number, col: number): Matrix {
    const size = this.size;
    const sub: number[][] = [];

    for (let i = 0; i < size; i++) {
      if (i === row) continue;
      const newRow: number[] = [];
      for (let j = 0; j < size; j++) {
        if (j === col) continue;
        newRow.push(this.data[i * size + j]);
      }
      sub.push(newRow);
    }

    return new Matrix(sub);
  }

  public static extractEulerAngles(m: IMatrix): {
    x: number;
    y: number;
    z: number;
  } {
    const e = m.toFloat32Array();

    // Extract rotation components (assuming no scale/shear)
    const sy = Math.sqrt(e[0] * e[0] + e[1] * e[1]);

    const singular = sy < 1e-6;

    let x: number, y: number, z: number;
    if (!singular) {
      x = Math.atan2(e[6], e[10]); // pitch
      y = Math.atan2(-e[2], sy); // yaw
      z = Math.atan2(e[1], e[0]); // roll
    } else {
      x = Math.atan2(-e[9], e[5]); // fallback
      y = Math.atan2(-e[2], sy);
      z = 0;
    }

    return { x, y, z };
  }
}
