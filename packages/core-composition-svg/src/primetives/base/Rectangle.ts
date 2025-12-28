import { BasePrimitive, type PrimitiveOptions } from "./BasePrimitive.js";

export class Rectangle extends BasePrimitive {
  width: number;
  height: number;

  constructor(id: string, width: number, height: number, options: PrimitiveOptions = {}) {
    super(id, options);
    this.width = width;
    this.height = height;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "0");
    rect.setAttribute("y", "0");
    rect.setAttribute("width", `${width}`);
    rect.setAttribute("height", `${height}`);
    this.applyStyle(rect, { fill: options.fill ?? "#cce", stroke: options.stroke, strokeWidth: options.strokeWidth });
    this.attachVisual(rect);

    this.setBBoxesFromPoints([
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ]);
  }
}
