import { ShapeLeaf } from "./ShapeLeaf.js";

export class Rectangle extends ShapeLeaf {
  public constructor(
    name: string,
    public readonly width: number,
    public readonly height: number
  ) {
    super(name);
  }

  public area(): number {
    return this.width * this.height;
  }

  public operation(): void {
    // no-op or logging
  }
}
