import { IShape } from "./IShape.js";

export interface IShapeCollection {
  add(shape: IShape): void;
  remove(shape: IShape): void;
  has(shape: IShape): boolean;
  getAll(): ReadonlyArray<IShape>;
}