import { BasePrimitive } from "../base/BasePrimitive";

/**
 * Minimal builder abstraction to decouple primitive construction.
 */
export interface IShapeBuilder<TShape> {

  build(): TShape;
}

/**
 * Builder for primitives created by a supplied factory function.
 */
export class PrimitiveBuilder<TShape extends BasePrimitive> implements IShapeBuilder<TShape> {
  constructor(private readonly factory: () => TShape) {}

  build(): TShape {
    return this.factory();
  }
}
