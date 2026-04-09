import type { IShape } from "./IShape.js";

export interface IShapeValidator<TShape extends IShape = IShape> {
  validate(shape: TShape): void;
}