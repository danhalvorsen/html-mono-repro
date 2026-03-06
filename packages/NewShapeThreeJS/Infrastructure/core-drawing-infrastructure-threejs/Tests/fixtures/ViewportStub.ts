import type { Rectangle2 } from "core-math/dist/index.js";
import type { IViewport } from "NewShapeThreeJS/Infrastructure/core-drawing-infrastructure-abstract/dist/IViewport.js";


export class ViewportStub implements IViewport {
  public readonly size: { x: number; y: number; };
  public readonly bounds: Rectangle2;

  public constructor(
    rectangle: Rectangle2 = { x: 0, y: 0, width: 100, height: 100 }
  ) {
    this.size = { x: rectangle.width, y: rectangle.height };
    this.bounds = rectangle;
  }
}
