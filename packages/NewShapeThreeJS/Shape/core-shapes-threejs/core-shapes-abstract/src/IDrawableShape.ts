import { IShape } from "./IShape.js";

export interface IDrawableShape<TContext> extends IShape {
  draw(ctx: TContext): void;
}