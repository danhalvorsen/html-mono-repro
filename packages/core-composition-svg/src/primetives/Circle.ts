import { BasePrimitive, type PrimitiveOptions } from "./BasePrimitive.js";

export class Circle extends BasePrimitive {
  radius: number;

  constructor(id: string, radius: number, options: PrimitiveOptions = {}) {
    super(id, options);
    this.radius = radius;

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", `${radius}`);
    circle.setAttribute("cy", `${radius}`);
    circle.setAttribute("r", `${radius}`);
    this.applyStyle(circle, { fill: options.fill ?? "#dff0ff", stroke: options.stroke, strokeWidth: options.strokeWidth });
    this.attachVisual(circle);

    this.setBBoxesFromPoints([
      { x: 0, y: 0 },
      { x: radius * 2, y: 0 },
      { x: radius * 2, y: radius * 2 },
      { x: 0, y: radius * 2 },
    ]);
  }
}
