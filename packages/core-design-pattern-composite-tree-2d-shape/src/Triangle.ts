
import { ShapeLeaf } from "./ShapeLeaf.js";

export class Triangle extends ShapeLeaf {
  public constructor(
    name: string,
    public readonly base: number,
    public readonly height: number
  ) {
    super(name);
  }

  public area(): number {
    return 0.5 * this.base * this.height;
  }

  public operation(): void {
    // no-op or logging
  }
}