// packages/core-design-pattern-composite-tree-2d-shape/src/ShapeLeaf.ts

import { Leaf } from "@monorepo/core-design-pattern-composite-tree";
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