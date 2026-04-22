import { IDataManager } from '../interfaces/IDataManager.js';
import { DataObject } from './DataObject.js';
import { Matrix } from '@monorepo/core-math';

export class DataManager<T> implements IDataManager<T> {
  private objects: Map<string, DataObject<T>> = new Map();

  add(object: DataObject<T>): void {
    this.objects.set(object.id, object);
  }

  get(id: string): DataObject<T> | undefined {
    return this.objects.get(id);
  }

  remove(id: string): boolean {
    return this.objects.delete(id);
  }

  updateTransform(id: string, matrix: Matrix): boolean {
    const obj = this.objects.get(id);
    if (!obj) return false;

    obj.setTransform(matrix);
    return true;
  }

  onTransformUpdate(id: string, callback: (matrix: Matrix) => void): boolean {
    const obj = this.objects.get(id);
    if (!obj) return false;

    obj.onTransformUpdate(callback);
    return true;
  }

  getAll(): DataObject<T>[] {
    return Array.from(this.objects.values());
  }
}
