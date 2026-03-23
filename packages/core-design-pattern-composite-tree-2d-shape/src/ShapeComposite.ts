// packages/core-design-pattern-composite-tree-2d-shape/src/ShapeComposite.ts

import { Composite } from "@monorepo/core-design-pattern-composite-tree";
import type { IShapeComponent } from "./IShapeComponent.js";

export class ShapeComposite
  extends Composite<IShapeComponent>
  implements IShapeComponent
{
  public constructor(name: string) {
    super(name);
  }

  public area(): number {
    return this
      .getChildren()
      .reduce((sum: number, child: IShapeComponent) => sum + child.area(), 0);
  }
}