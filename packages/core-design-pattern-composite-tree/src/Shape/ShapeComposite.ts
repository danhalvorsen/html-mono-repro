 
import { Composite } from "../Composite.js";
import type { IShapeComponent } from "./IShapeComponent.js";

export class ShapeComposite
  extends Composite<IShapeComponent>
  implements IShapeComponent
{
  public constructor(name: string) {
    super(name);
  }

  public area(): number {
    return this.getChildren().reduce((sum, child) => sum + child.area(), 0);
  }
}
