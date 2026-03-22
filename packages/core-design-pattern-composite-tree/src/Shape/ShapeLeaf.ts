 
import { Leaf } from "../Leaf.js";
import type { IShapeComponent } from "./IShapeComponent.js";

export abstract class ShapeLeaf
  extends Leaf<IShapeComponent>
  implements IShapeComponent
{
  protected constructor(name: string) {
    super(name);
  }

  public abstract area(): number;
}
