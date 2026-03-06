import { Raycaster, type Intersection, Object3D, Vector2 } from "three";


export class RaycasterStub extends Raycaster {
  private hits: Intersection<Object3D>[] = [];

  public setHits(...objects: Object3D[]): this {
    this.hits = objects.map((object, index) => this.createIntersection(object, index));
    return this;
  }

  public override intersectObjects<TIntersected extends Object3D>(
    _objects: Object3D[],
    _recursive?: boolean,
    _optionalTarget?: Array<Intersection<TIntersected>>
  ): Array<Intersection<TIntersected>> {
    return this.hits as Array<Intersection<TIntersected>>;
  }

  private createIntersection(
    object: Object3D,
    index: number
  ): Intersection<Object3D> {
    return {
      distance: index,
      distanceToRay: 0,
      point: new Vector2(0, 0) as unknown as any,
      object
    } as Intersection<Object3D>;
  }
}
