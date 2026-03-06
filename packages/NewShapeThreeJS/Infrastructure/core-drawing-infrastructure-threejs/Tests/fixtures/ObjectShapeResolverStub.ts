import { Object3D } from "three";
import type { IObjectShapeResolver } from "../../src/IObjectShapeResolver.js";


export class ObjectShapeResolverStub<TShape> implements IObjectShapeResolver<TShape> {
  private readonly map = new Map<Object3D, TShape>();

  public register(object: Object3D, shape: TShape): this {
    this.map.set(object, shape);
    return this;
  }

  public resolveIdentifierKey(object: Object3D): TShape | undefined {
    return this.map.get(object);
  }
}
