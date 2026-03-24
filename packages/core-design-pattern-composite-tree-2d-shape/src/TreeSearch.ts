// packages/core-design-pattern-composite-tree-2d-shape/src/TreeSearch.ts

import type { IShapeComponent } from "./IShapeComponent.js";

export class TreeSearch {
  public static findByName(
    root: IShapeComponent,
    name: string
  ): IShapeComponent | null {
    if (root.name === name) {
      return root;
    }

    for (const child of root.getChildren()) {
      const found = TreeSearch.findByName(child, name);

      if (found !== null) {
        return found;
      }
    }

    return null;
  }
}