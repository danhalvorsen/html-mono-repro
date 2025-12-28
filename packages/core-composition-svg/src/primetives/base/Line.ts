import { type PrimitiveOptions } from "./BasePrimitive.js";

/** Pure SVG primetive */
export class Line {
  constructor(
    endpoints: [DOMPointInit, DOMPointInit] = [
      { x: 0, y: 0 },
      { x: 150, y: 0 },
    ],
    _options: PrimitiveOptions = {}
  ) {
   
    const [p1, p2] = endpoints;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", `${p1.x ?? 0}`);
    line.setAttribute("y1", `${p1.y ?? 0}`);
    line.setAttribute("x2", `${p2.x ?? 0}`);
    line.setAttribute("y2", `${p2.y ?? 0}`);
 
  }
}
