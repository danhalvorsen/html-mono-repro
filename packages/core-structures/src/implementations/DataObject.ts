
import { IDataObject } from '../interfaces/IDataObject.js';
import { Matrix } from '@my-graphics/core-math';

export class DataObject<T> implements IDataObject<T> {
  id: string;
  data: T;
  private transform: Matrix;
  private listeners: ((matrix: Matrix) => void)[] = [];

  constructor(id: string, data: T) {
    this.id = id;
    this.data = data;
    this.transform = new Matrix([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]); // ✅ Fixed: Properly initialized a 4x4 identity matrix
  }

  setTransform(matrix: Matrix): void {
    this.transform = matrix; // ✅ Fixed: Matrix type consistency
    this.notifyListeners();
  }

  getTransform(): Matrix {
    return this.transform; // ✅ Fixed: Return the correct type
  }

  onTransformUpdate(callback: (matrix: Matrix) => void): void {
    this.listeners.push(callback); // ✅ Fixed: Correct function signature
  }

  private notifyListeners(): void {
    for (const callback of this.listeners) {
      callback(this.transform);
    }
  }
}
