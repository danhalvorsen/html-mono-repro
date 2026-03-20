/* =========================================
 * FILE: src/shapes/TreeSearch.ts
 * ========================================= */

import type { IShapeComponent } from "./IShapeComponent.js";

export class TreeSearch {
  public static findByName(root: IShapeComponent, name: string): IShapeComponent | null {
    if (root.name === name) {
      return root;
    }

    for (const child of root.getChildren()) {
      const found = this.findByName(child, name);
      if (found) {
        return found;
      }
    }

    return null;
  }
}