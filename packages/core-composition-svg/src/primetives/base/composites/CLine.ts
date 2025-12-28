import { BasePrimitive, type PrimitiveOptions } from "../BasePrimitive.js";

export class CLine extends BasePrimitive {
  constructor(
    id: string,
    _endpoints: [DOMPointInit, DOMPointInit] = [
      { x: 0, y: 0 },
      { x: 150, y: 0 },
    ],
    options: PrimitiveOptions = {}
  ) {
    super(id, options);
  }
}
