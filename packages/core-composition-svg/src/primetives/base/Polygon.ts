import { BasePrimitive, type PrimitiveOptions } from "./BasePrimitive.js";

export class Polygon extends BasePrimitive {
  constructor(
    id: string,
    points: DOMPointInit[] = [
      { x: 0, y: 50 },
      { x: 40, y: 0 },
      { x: 90, y: 20 },
      { x: 110, y: 60 },
      { x: 60, y: 90 },
    ],
    options: PrimitiveOptions = {}
  ) {
    super(id, options);
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute(
      "points",
      points.map((p) => `${p.x ?? 0},${p.y ?? 0}`).join(" ")
    );
    this.applyStyle(polygon, { fill: options.fill ?? "#e0ffd6", stroke: options.stroke, strokeWidth: options.strokeWidth });
    this.attachVisual(polygon);

    this.setBBoxesFromPoints(points);
  }
}
