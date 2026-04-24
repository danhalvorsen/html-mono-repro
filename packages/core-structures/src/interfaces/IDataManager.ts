
import { DataObject } from '../implementations/DataObject.js';
import { Matrix } from '@monorepo/core-math';

export interface IDataManager<T> {
  add(object: DataObject<T>): void;
  get(id: string): DataObject<T> | undefined;
  remove(id: string): boolean;
  updateTransform(id: string, matrix: Matrix): boolean;
  onTransformUpdate(id: string, callback: (matrix: Matrix) => void): boolean;
  getAll(): DataObject<T>[];
}
