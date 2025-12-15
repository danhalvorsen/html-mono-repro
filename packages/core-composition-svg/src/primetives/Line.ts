import { BasePrimitive, type PrimitiveOptions } from "./BasePrimitive.js";

export class Line extends BasePrimitive {
  constructor(
    id: string,
    endpoints: [DOMPointInit, DOMPointInit] = [
      { x: 0, y: 0 },
      { x: 150, y: 0 },
    ],
    options: PrimitiveOptions = {}
  ) {
    super(id, options);
    const [p1, p2] = endpoints;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", `${p1.x ?? 0}`);
    line.setAttribute("y1", `${p1.y ?? 0}`);
    line.setAttribute("x2", `${p2.x ?? 0}`);
    line.setAttribute("y2", `${p2.y ?? 0}`);
    this.applyStyle(line, {
      fill: "none",
      stroke: options.stroke ?? "#333",
      strokeWidth: options.strokeWidth ?? 2,
    });
    this.attachVisual(line);

    this.setBBoxesFromPoints([p1, p2]);
  }
}
