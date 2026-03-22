// Applications/composite-tree-demo/composite-tree/src/Shapes/Circle/Ellipse.ts

import { customElement, property } from "lit/decorators.js";
import type { IEllipseShape } from "./IEllipseShape";
import { EllipseShape } from "./EllipseShape";
import { AbstractDrawableElement } from "../ShapeElement";
 
@customElement("ellipse-primitive")
export class Ellipse extends AbstractDrawableElement {
  @property({ type: Number })
  public cx = 0;

  @property({ type: Number })
  public cy = 0;

  @property({ type: Number })
  public rx = 50;

  @property({ type: Number })
  public ry = 30;

  public toShape(): IEllipseShape {
    return new EllipseShape(
      { x: this.cx, y: this.cy },
      this.rx,
      this.ry,
    );
  }
}