import { BasePrimitive, type PrimitiveOptions } from "./BasePrimitive.js";

export class Triangle extends BasePrimitive {
  constructor(
    id: string,
    points: [DOMPointInit, DOMPointInit, DOMPointInit] = [
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 50, y: 0 },
    ],
    options: PrimitiveOptions = {}
  ) {
    super(id, options);
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute(
      "points",
      points.map((p) => `${p.x ?? 0},${p.y ?? 0}`).join(" ")
    );
    this.applyStyle(polygon, { fill: options.fill ?? "#fee0c6", stroke: options.stroke, strokeWidth: options.strokeWidth });
    this.attachVisual(polygon);

    this.setBBoxesFromPoints(points);
  }
}
