/* =========================================
 * FILE: src/shapes/ShapeCloner.ts
 * ========================================= */

import type { IShapeComponent } from "./IShapeComponent.js";
import { Circle } from "./Circle.js";
import { Rectangle } from "./Rectangle.js";
import { ShapeComposite } from "./ShapeComposite.js";
import { Triangle } from "./Triangle.js";

export class ShapeCloner {
  public clone(node: IShapeComponent): IShapeComponent {
    if (node instanceof Circle) {
      return new Circle(node.name, node.radius);
    }

    if (node instanceof Rectangle) {
      return new Rectangle(node.name, node.width, node.height);
    }

    if (node instanceof Triangle) {
      return new Triangle(node.name, node.base, node.height);
    }

    if (node instanceof ShapeComposite) {
      const clone = new ShapeComposite(node.name);

      for (const child of node.getChildren()) {
        clone.add(this.clone(child));
      }

      return clone;
    }

    throw new Error("Unsupported shape component.");
  }
}