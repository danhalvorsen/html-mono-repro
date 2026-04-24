import { Matrix } from '@monorepo/core-math';

export interface IDataObject<T> {
  id: string;
  data: T;
  getTransform(): Matrix;
  setTransform(matrix: Matrix): void;
  onTransformUpdate(callback: (matrix: Matrix) => void): void;
}
