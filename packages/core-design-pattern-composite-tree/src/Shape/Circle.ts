import { ShapeLeaf } from "./ShapeLeaf.js";

export class Circle extends ShapeLeaf {
  public constructor(
    name: string,
    public readonly radius: number
  ) {
    super(name);
  }

  public area(): number {
    return Math.PI * this.radius * this.radius;
  }

  public operation(): void {
    // no-op or logging
  }
}
